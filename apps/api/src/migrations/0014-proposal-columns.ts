import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProposalColumns1710000000014 implements MigrationInterface {
  name = 'ProposalColumns1710000000014';

  public async up(q: QueryRunner): Promise<void> {
    // колонка status
    await q.query(`
      ALTER TABLE "proposal"
      ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'DRAFT'
    `);

    // безопасное добавление FK (Postgres не умеет IF NOT EXISTS в ADD CONSTRAINT)
    await q.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_proposal_apiKey'
        ) THEN
          ALTER TABLE "proposal"
            ADD CONSTRAINT "FK_proposal_apiKey"
            FOREIGN KEY ("apiKeyId")
            REFERENCES "api_key"("id")
            ON DELETE SET NULL;
        END IF;
      END$$;
    `);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`
      ALTER TABLE "proposal" DROP CONSTRAINT IF EXISTS "FK_proposal_apiKey";
      ALTER TABLE "proposal" DROP COLUMN IF EXISTS "status";
    `);
  }
}
