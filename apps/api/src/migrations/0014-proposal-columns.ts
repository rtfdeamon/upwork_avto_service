import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProposalColumns1710000000014 implements MigrationInterface {
  name = 'ProposalColumns1710000000014';

  public async up(q: QueryRunner): Promise<void> {
    /* 0. гарантируем наличие apiKeyId */
    await q.query(`
      ALTER TABLE "proposal"
      ADD COLUMN IF NOT EXISTS "apiKeyId" uuid
    `);

    /* 1. добавляем status */
    await q.query(`
      ALTER TABLE "proposal"
      ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'DRAFT'
    `);

    /* 2. создаём FK, если ещё нет */
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
      ALTER TABLE "proposal" DROP COLUMN IF EXISTS "status";
      ALTER TABLE "proposal" DROP COLUMN IF EXISTS "apiKeyId";
    `);
  }
}
