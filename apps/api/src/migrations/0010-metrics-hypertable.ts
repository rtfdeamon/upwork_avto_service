import { MigrationInterface, QueryRunner } from 'typeorm';

export class MetricsHypertable1710000000010 implements MigrationInterface {
  name = 'MetricsHypertable1710000000010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "metric" ("day" date NOT NULL, "userId" uuid NOT NULL, "sent" integer NOT NULL DEFAULT 0, "replies" integer NOT NULL DEFAULT 0, "wins" integer NOT NULL DEFAULT 0, PRIMARY KEY ("day", "userId"))`,
    );
    await queryRunner.query(
      `DO $$
       BEGIN
         IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_hypertable') THEN
           PERFORM create_hypertable('metric', 'day', if_not_exists => TRUE);
         END IF;
       END$$;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "metric"`);
  }
}
