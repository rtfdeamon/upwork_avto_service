import { MigrationInterface, QueryRunner } from 'typeorm';

export class Webhook1710000000007 implements MigrationInterface {
  name = 'Webhook1710000000007'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "webhook_type_enum" AS ENUM('SLACK','TG')`);
    await queryRunner.query(
      `CREATE TABLE "webhook" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "url" character varying NOT NULL, "type" "webhook_type_enum" NOT NULL, "secret" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_webhook_id" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "webhook" ADD CONSTRAINT "FK_webhook_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "webhook" DROP CONSTRAINT "FK_webhook_user"`);
    await queryRunner.query(`DROP TABLE "webhook"`);
    await queryRunner.query(`DROP TYPE "webhook_type_enum"`);
  }
}
