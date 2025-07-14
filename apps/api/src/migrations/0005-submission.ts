import { MigrationInterface, QueryRunner } from 'typeorm';

export class Submission0005 implements MigrationInterface {
  name = 'Submission0005'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "proposal" ADD "connectsUsed" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "proposal" ADD "errorReason" text`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "proposal" DROP COLUMN "errorReason"`);
    await queryRunner.query(`ALTER TABLE "proposal" DROP COLUMN "connectsUsed"`);
  }
}
