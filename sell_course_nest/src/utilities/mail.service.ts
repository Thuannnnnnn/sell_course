import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendSimpleEmail(to: string, subject: string, htmlContent: string) {
    if (!to || typeof to !== 'string' || !to.includes('@')) {
      throw new Error('Invalid recipient email address');
    }

    await this.mailerService.sendMail({
      to,
      subject,
      html: htmlContent,
    });
  }
}
