import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixFkProposalApiKey1710000000015 implements MigrationInterface {
  name = 'FixFkProposalApiKey1710000000015';

  public async up(q: QueryRunner): Promise<void> {
    /* 1. Создаём колонку apiKeyId, если её нет */
    await q.query(`
      ALTER TABLE "proposal"
      ADD COLUMN IF NOT EXISTS "apiKeyId" uuid
    `);

    /* 2. Удаляем старый конфликтующий FK, если он вдруг есть */
    await q.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'FK_proposal_apiKey'
        ) THEN
          ALTER TABLE "proposal"
            DROP CONSTRAINT "FK_proposal_apiKey";
        END IF;
      END$$;
    `);

    /* 3. Добавляем корректный FK → api_key(id) */
    await q.query(`
      ALTER TABLE "proposal"
        ADD CONSTRAINT "FK_proposal_apiKey"
        FOREIGN KEY ("apiKeyId")
        REFERENCES "api_key"("id")
        ON DELETE SET NULL
    `);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`
      ALTER TABLE "proposal" DROP CONSTRAINT IF EXISTS "FK_proposal_apiKey";
      ALTER TABLE "proposal" DROP COLUMN IF EXISTS "apiKeyId";
    `);
  }
}
