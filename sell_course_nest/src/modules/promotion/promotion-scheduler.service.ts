import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, Between } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Promotion } from './entities/promotion.entity';
import { PromotionNotificationService } from '../notification/promotion-notification.service';

@Injectable()
export class PromotionSchedulerService {
  constructor(
    @InjectRepository(Promotion)
    private promotionRepository: Repository<Promotion>,
    private promotionNotificationService: PromotionNotificationService,
  ) {}

  /**
   * Chạy hàng ngày lúc 9:00 AM để kiểm tra promotion sắp hết hạn
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkExpiringPromotions() {
    console.log('🔍 Checking for expiring promotions...');

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const oneDayFromNow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

    try {
      // Tìm promotions sắp hết hạn trong 3 ngày
      const promotionsExpiringSoon = await this.promotionRepository.find({
        where: {
          endDate: Between(now, threeDaysFromNow),
        },
        relations: ['course'],
      });

      for (const promotion of promotionsExpiringSoon) {
        if (!promotion.endDate) continue;

        const daysUntilExpiry = Math.ceil(
          (promotion.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Chỉ gửi notification cho promotions sắp hết hạn trong 1-3 ngày
        if (daysUntilExpiry >= 1 && daysUntilExpiry <= 3) {
          console.log(`⏰ Promotion "${promotion.name}" expires in ${daysUntilExpiry} days`);
          
          await this.promotionNotificationService.notifyOnPromotionExpiring(
            promotion,
            daysUntilExpiry
          );
        }
      }

      console.log(`✅ Checked ${promotionsExpiringSoon.length} expiring promotions`);
    } catch (error) {
      console.error('❌ Error checking expiring promotions:', error);
    }
  }

  /**
   * Chạy hàng ngày lúc 10:00 AM để cleanup expired promotions
   */
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async cleanupExpiredPromotions() {
    console.log('🧹 Cleaning up expired promotions...');

    const now = new Date();

    try {
      // Tìm promotions đã hết hạn
      const expiredPromotions = await this.promotionRepository.find({
        where: {
          endDate: LessThan(now),
        },
        relations: ['course'],
      });

      console.log(`📊 Found ${expiredPromotions.length} expired promotions`);

      // Có thể thêm logic để:
      // 1. Archive expired promotions
      // 2. Update status
      // 3. Send final notifications
      // 4. Generate reports

      for (const promotion of expiredPromotions) {
        console.log(`🗓️ Promotion "${promotion.name}" has expired`);
        // Có thể thêm logic xử lý promotion hết hạn ở đây
      }

    } catch (error) {
      console.error('❌ Error cleaning up expired promotions:', error);
    }
  }

  /**
   * Manual method để kiểm tra promotion expiry (có thể gọi từ API)
   */
  async manualCheckExpiringPromotions(): Promise<{
    expiringSoon: number;
    expired: number;
    message: string;
  }> {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const [expiringSoon, expired] = await Promise.all([
      this.promotionRepository.count({
        where: {
          endDate: Between(now, threeDaysFromNow),
        },
      }),
      this.promotionRepository.count({
        where: {
          endDate: LessThan(now),
        },
      }),
    ]);

    return {
      expiringSoon,
      expired,
      message: `Found ${expiringSoon} promotions expiring soon and ${expired} expired promotions`,
    };
  }
}