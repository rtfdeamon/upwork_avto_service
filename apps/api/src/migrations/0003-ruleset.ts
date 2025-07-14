import { MigrationInterface, QueryRunner } from 'typeorm';

export class Ruleset0003 implements MigrationInterface {
  name = 'Ruleset0003'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "rule_set" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "jsonLogic" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_rule_set_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "rule_set" ADD CONSTRAINT "FK_rule_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "rule_set" DROP CONSTRAINT "FK_rule_user"`);
    await queryRunner.query(`DROP TABLE "rule_set"`);
  }
}
