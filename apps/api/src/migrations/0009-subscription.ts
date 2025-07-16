import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserSubscription1710000000009 implements MigrationInterface {
  name = 'UserSubscription1710000000009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "subscription" varchar NOT NULL DEFAULT 'ACTIVE'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "subscription"`);
  }
}
