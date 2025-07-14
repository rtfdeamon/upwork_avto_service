import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProposalColumns0014 implements MigrationInterface {
  name = 'ProposalColumns0014';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "proposal" ADD COLUMN IF NOT EXISTS "apiKeyId" uuid`
    );
    await queryRunner.query(
      `ALTER TABLE "proposal" ADD COLUMN IF NOT EXISTS "jobTitle" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "proposal" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'DRAFT'`
    );
    await queryRunner.query(
      `ALTER TABLE "proposal" ADD CONSTRAINT IF NOT EXISTS "FK_proposal_apiKey" FOREIGN KEY ("apiKeyId") REFERENCES "api_key"("id") ON DELETE SET NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "proposal" DROP CONSTRAINT IF EXISTS "FK_proposal_apiKey"`
    );
    await queryRunner.query(
      `ALTER TABLE "proposal" DROP COLUMN IF EXISTS "apiKeyId"`
    );
    await queryRunner.query(
      `ALTER TABLE "proposal" DROP COLUMN IF EXISTS "jobTitle"`
    );
    await queryRunner.query(
      `ALTER TABLE "proposal" DROP COLUMN IF EXISTS "status"`
    );
  }
}
