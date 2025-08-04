import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddLastNotificationSentToChatSession1703000002000 implements MigrationInterface {
  name = 'AddLastNotificationSentToChatSession1703000002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'chat_sessions',
      new TableColumn({
        name: 'lastNotificationSent',
        type: 'timestamp',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('chat_sessions', 'lastNotificationSent');
  }
}