import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationSystem1703000001000 implements MigrationInterface {
  name = 'CreateNotificationSystem1703000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create notification type enum
    await queryRunner.query(`
      CREATE TYPE "notification_type_enum" AS ENUM(
        'COURSE_CREATED',
        'COURSE_UPDATED', 
        'COURSE_PUBLISHED',
        'COURSE_REJECTED',
        'COURSE_REVIEW_REQUESTED'
      )
    `);

    // Create notification priority enum
    await queryRunner.query(`
      CREATE TYPE "notification_priority_enum" AS ENUM(
        'LOW',
        'MEDIUM',
        'HIGH', 
        'URGENT'
      )
    `);

    // Create notification status enum
    await queryRunner.query(`
      CREATE TYPE "notification_status_enum" AS ENUM(
        'UNREAD',
        'READ',
        'ARCHIVED'
      )
    `);

    // Create notifications table
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(255) NOT NULL,
        "message" text NOT NULL,
        "type" "notification_type_enum" NOT NULL,
        "priority" "notification_priority_enum" NOT NULL DEFAULT 'MEDIUM',
        "metadata" json,
        "created_by" uuid,
        "course_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications" PRIMARY KEY ("id")
      )
    `);

    // Create user_notifications table
    await queryRunner.query(`
      CREATE TABLE "user_notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "notification_id" uuid NOT NULL,
        "status" "notification_status_enum" NOT NULL DEFAULT 'UNREAD',
        "read_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_notifications" PRIMARY KEY ("id")
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_type" ON "notifications" ("type")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_created_at" ON "notifications" ("created_at")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_user_notifications_user_status" ON "user_notifications" ("user_id", "status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_user_notifications_created_at" ON "user_notifications" ("created_at")
    `);

    // Create unique constraint
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_user_notifications_unique" ON "user_notifications" ("user_id", "notification_id")
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "notifications" 
      ADD CONSTRAINT "FK_notifications_created_by" 
      FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "notifications" 
      ADD CONSTRAINT "FK_notifications_course_id" 
      FOREIGN KEY ("course_id") REFERENCES "course"("courseId") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "user_notifications" 
      ADD CONSTRAINT "FK_user_notifications_user_id" 
      FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "user_notifications" 
      ADD CONSTRAINT "FK_user_notifications_notification_id" 
      FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE "user_notifications" DROP CONSTRAINT "FK_user_notifications_notification_id"`);
    await queryRunner.query(`ALTER TABLE "user_notifications" DROP CONSTRAINT "FK_user_notifications_user_id"`);
    await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_notifications_course_id"`);
    await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_notifications_created_by"`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_user_notifications_unique"`);
    await queryRunner.query(`DROP INDEX "IDX_user_notifications_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_user_notifications_user_status"`);
    await queryRunner.query(`DROP INDEX "IDX_notifications_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_notifications_type"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "user_notifications"`);
    await queryRunner.query(`DROP TABLE "notifications"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE "notification_status_enum"`);
    await queryRunner.query(`DROP TYPE "notification_priority_enum"`);
    await queryRunner.query(`DROP TYPE "notification_type_enum"`);
  }
}