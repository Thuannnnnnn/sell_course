import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios, { AxiosResponse } from 'axios';
import * as crypto from 'crypto';

// Entity để lưu webhook configurations
export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  secret: string;
  events: string[];
  isActive: boolean;
  headers?: Record<string, string>;
  retryAttempts: number;
  timeout: number;
}

export interface WebhookData {
  event: string;
  notification: any;
  user: any;
  timestamp: Date;
}

export interface WebhookResult {
  success: boolean;
  webhookUrl?: string;
  responseStatus?: number;
  error?: string;
  retryCount?: number;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private webhookConfigs: WebhookConfig[] = [];

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.loadWebhookConfigs();
  }

  /**
   * Load webhook configurations
   */
  private loadWebhookConfigs() {
    // In production, this would come from database
    // For now, load from environment or default configs
    const defaultConfigs: WebhookConfig[] = [
      {
        id: 'slack-notifications',
        name: 'Slack Notifications',
        url: this.configService.get('SLACK_WEBHOOK_URL', ''),
        secret: this.configService.get('SLACK_WEBHOOK_SECRET', ''),
        events: ['notification.delivered', 'support_ticket.created', 'course.submitted'],
        isActive: !!this.configService.get('SLACK_WEBHOOK_URL'),
        headers: {
          'Content-Type': 'application/json',
        },
        retryAttempts: 3,
        timeout: 5000,
      },
      {
        id: 'discord-notifications',
        name: 'Discord Notifications',
        url: this.configService.get('DISCORD_WEBHOOK_URL', ''),
        secret: this.configService.get('DISCORD_WEBHOOK_SECRET', ''),
        events: ['notification.delivered', 'course.approved', 'course.rejected'],
        isActive: !!this.configService.get('DISCORD_WEBHOOK_URL'),
        headers: {
          'Content-Type': 'application/json',
        },
        retryAttempts: 3,
        timeout: 5000,
      },
      {
        id: 'external-api',
        name: 'External API Integration',
        url: this.configService.get('EXTERNAL_API_WEBHOOK_URL', ''),
        secret: this.configService.get('EXTERNAL_API_WEBHOOK_SECRET', ''),
        events: ['notification.delivered'],
        isActive: !!this.configService.get('EXTERNAL_API_WEBHOOK_URL'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.configService.get('EXTERNAL_API_TOKEN', '')}`,
        },
        retryAttempts: 5,
        timeout: 10000,
      },
    ];

    this.webhookConfigs = defaultConfigs.filter(config => config.isActive);
    this.logger.log(`Loaded ${this.webhookConfigs.length} active webhook configurations`);
  }

  /**
   * Send notification webhook to all configured endpoints
   */
  async sendNotificationWebhook(data: WebhookData): Promise<WebhookResult> {
    const results: WebhookResult[] = [];

    // Filter webhooks that should receive this event
    const applicableWebhooks = this.webhookConfigs.filter(config => 
      config.events.includes(data.event)
    );

    if (applicableWebhooks.length === 0) {
      return {
        success: true,
        webhookUrl: 'none',
        responseStatus: 200,
      };
    }

    // Send to all applicable webhooks
    for (const webhook of applicableWebhooks) {
      const result = await this.sendToWebhook(webhook, data);
      results.push(result);
    }

    // Return combined result
    const hasSuccess = results.some(r => r.success);
    const hasFailure = results.some(r => !r.success);

    return {
      success: hasSuccess,
      webhookUrl: applicableWebhooks.map(w => w.url).join(', '),
      responseStatus: hasSuccess ? 200 : 500,
      error: hasFailure ? results.filter(r => !r.success).map(r => r.error).join('; ') : undefined,
    };
  }

  /**
   * Send webhook to specific endpoint
   */
  private async sendToWebhook(webhook: WebhookConfig, data: WebhookData): Promise<WebhookResult> {
    let lastError: string = '';
    
    for (let attempt = 1; attempt <= webhook.retryAttempts; attempt++) {
      try {
        const payload = this.prepareWebhookPayload(webhook, data);
        const headers = this.prepareWebhookHeaders(webhook, payload);

        this.logger.log(`Sending webhook to ${webhook.name} (attempt ${attempt}/${webhook.retryAttempts})`);

        const response: AxiosResponse = await axios.post(webhook.url, payload, {
          headers,
          timeout: webhook.timeout,
          validateStatus: (status) => status < 500, // Retry on 5xx errors
        });

        if (response.status >= 200 && response.status < 300) {
          this.logger.log(`Webhook sent successfully to ${webhook.name}: ${response.status}`);
          return {
            success: true,
            webhookUrl: webhook.url,
            responseStatus: response.status,
            retryCount: attempt,
          };
        } else {
          lastError = `HTTP ${response.status}: ${response.statusText}`;
          this.logger.warn(`Webhook failed for ${webhook.name}: ${lastError}`);
        }

      } catch (error) {
        // Wait before retry (exponential backoff)
        if (attempt < webhook.retryAttempts) {
          const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s, etc.
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    return {
      success: false,
      webhookUrl: webhook.url,
      error: lastError,
      retryCount: webhook.retryAttempts,
    };
  }

  /**
   * Prepare webhook payload based on webhook type
   */
  private prepareWebhookPayload(webhook: WebhookConfig, data: WebhookData): any {
    const basePayload = {
      event: data.event,
      timestamp: data.timestamp,
      data: {
        notification: data.notification,
        user: data.user,
      },
    };

    // Customize payload based on webhook type
    switch (webhook.id) {
      case 'slack-notifications':
        return this.formatSlackPayload(data);
      
      case 'discord-notifications':
        return this.formatDiscordPayload(data);
      
      default:
        return basePayload;
    }
  }

  /**
   * Format payload for Slack
   */
  private formatSlackPayload(data: WebhookData): any {
    const { notification, user } = data;
    
    let color = '#36a64f'; // green
    if (notification.priority === 'HIGH' || notification.priority === 'URGENT') {
      color = '#ff9900'; // orange
    } else if (notification.priority === 'CRITICAL') {
      color = '#ff0000'; // red
    }

    return {
      text: `New notification: ${notification.title}`,
      attachments: [
        {
          color,
          fields: [
            {
              title: 'Title',
              value: notification.title,
              short: false,
            },
            {
              title: 'Content',
              value: notification.content,
              short: false,
            },
            {
              title: 'User',
              value: `${user.email} (${user.role})`,
              short: true,
            },
            {
              title: 'Priority',
              value: notification.priority,
              short: true,
            },
            {
              title: 'Event Type',
              value: notification.eventType,
              short: true,
            },
          ],
          ts: Math.floor(data.timestamp.getTime() / 1000),
        },
      ],
    };
  }

  /**
   * Format payload for Discord
   */
  private formatDiscordPayload(data: WebhookData): any {
    const { notification, user } = data;
    
    let color = 0x00ff00; // green
    if (notification.priority === 'HIGH' || notification.priority === 'URGENT') {
      color = 0xff9900; // orange
    } else if (notification.priority === 'CRITICAL') {
      color = 0xff0000; // red
    }

    return {
      embeds: [
        {
          title: `📢 ${notification.title}`,
          description: notification.content,
          color,
          fields: [
            {
              name: '👤 User',
              value: `${user.email} (${user.role})`,
              inline: true,
            },
            {
              name: '⚡ Priority',
              value: notification.priority,
              inline: true,
            },
            {
              name: '🏷️ Event Type',
              value: notification.eventType,
              inline: true,
            },
          ],
          timestamp: data.timestamp.toISOString(),
          footer: {
            text: 'Sell Course Platform',
          },
        },
      ],
    };
  }

  /**
   * Prepare webhook headers with signature
   */
  private prepareWebhookHeaders(webhook: WebhookConfig, payload: any): Record<string, string> {
    const headers = { ...webhook.headers };

    // Add signature if secret is provided
    if (webhook.secret) {
      const signature = this.generateSignature(webhook.secret, JSON.stringify(payload));
      headers['X-Webhook-Signature'] = signature;
    }

    // Add timestamp
    headers['X-Webhook-Timestamp'] = Date.now().toString();

    return headers;
  }

  /**
   * Generate HMAC signature for webhook security
   */
  private generateSignature(secret: string, payload: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  /**
   * Add new webhook configuration
   */
  addWebhookConfig(config: Omit<WebhookConfig, 'id'>): WebhookConfig {
    const newConfig: WebhookConfig = {
      ...config,
      id: crypto.randomUUID(),
    };

    this.webhookConfigs.push(newConfig);
    this.logger.log(`Added new webhook configuration: ${newConfig.name}`);

    return newConfig;
  }

  /**
   * Update webhook configuration
   */
  updateWebhookConfig(id: string, updates: Partial<WebhookConfig>): boolean {
    const index = this.webhookConfigs.findIndex(config => config.id === id);
    
    if (index === -1) {
      return false;
    }

    this.webhookConfigs[index] = { ...this.webhookConfigs[index], ...updates };
    this.logger.log(`Updated webhook configuration: ${id}`);

    return true;
  }

  /**
   * Remove webhook configuration
   */
  removeWebhookConfig(id: string): boolean {
    const index = this.webhookConfigs.findIndex(config => config.id === id);
    
    if (index === -1) {
      return false;
    }

    const removed = this.webhookConfigs.splice(index, 1)[0];
    this.logger.log(`Removed webhook configuration: ${removed.name}`);

    return true;
  }

  /**
   * Get all webhook configurations
   */
  getWebhookConfigs(): WebhookConfig[] {
    return [...this.webhookConfigs];
  }

  /**
   * Test webhook endpoint
   */
  async testWebhook(id: string): Promise<WebhookResult> {
    const webhook = this.webhookConfigs.find(config => config.id === id);
    
    if (!webhook) {
      return {
        success: false,
        error: 'Webhook configuration not found',
      };
    }

    const testData: WebhookData = {
      event: 'webhook.test',
      notification: {
        id: 'test-notification',
        title: 'Test Notification',
        content: 'This is a test notification to verify webhook configuration.',
        priority: 'MEDIUM',
        eventType: 'SYSTEM_TEST',
      },
      user: {
        id: 'test-user',
        email: 'test@example.com',
        role: 'ADMIN',
      },
      timestamp: new Date(),
    };

    return await this.sendToWebhook(webhook, testData);
  }
}