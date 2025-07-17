import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixFkProposalApiKey1710000000015 implements MigrationInterface {
  name = 'FixFkProposalApiKey1710000000015';

  public async up(q: QueryRunner): Promise<void> {
    /* 1. \u0421\u043e\u0437\u0434\u0451\u043c \u043a\u043e\u043b\u043e\u043d\u043a\u0443 apiKeyId, \u0435\u0441\u043b\u0438 \u0451\u0451 \u043d\u0435\u0442  */
    await q.query(`
      ALTER TABLE "proposal"
      ADD COLUMN IF NOT EXISTS "apiKeyId" uuid
    `);

    /* 2. \u0423\u0434\u0430\u043b\u044f\u0435\u043c \u0441\u0442\u0430\u0440\u044b\u0439 \u043a\u043e\u043d\u0444\u043b\u0438\u043a\u0442\u0443\u044e\u0449\u0438\u0439 FK, \u0435\u0441\u043b\u0438 \u043e\u043d \u0432\u0434\u0440\u0443\u0433 \u0435\u0441\u0442\u044c   */
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

    /* 3. \u0414\u043e\u0431\u0430\u0432\u043b\u044f\u0435\u043c \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u043d\u044b\u0439 FK \u2192 api_key(id)  */
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
