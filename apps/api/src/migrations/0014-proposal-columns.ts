import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProposalColumns1710000000014 implements MigrationInterface {
  name = 'ProposalColumns1710000000014';

  public async up(q: QueryRunner): Promise<void> {
    /* добавляем только колонку status.
       FK → api_key(id) переносится в миграцию 0015 */
    await q.query(`
      ALTER TABLE "proposal"
      ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'DRAFT'
    `);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`
      ALTER TABLE "proposal" DROP COLUMN IF EXISTS "status";
    `);
  }
}
