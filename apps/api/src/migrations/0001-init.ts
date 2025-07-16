import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1710000000001 implements MigrationInterface {
  name = 'Init1710000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `CREATE TYPE "user_role_enum" AS ENUM('OWNER','SDR','VIEWER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "subscription_status_enum" AS ENUM('ACTIVE','PAST_DUE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "role" "user_role_enum" NOT NULL DEFAULT 'OWNER', "hashedPw" character varying NOT NULL, "subscription" "subscription_status_enum" NOT NULL DEFAULT 'ACTIVE', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_user_id" PRIMARY KEY ("id"), CONSTRAINT "UQ_user_email" UNIQUE ("email"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "api_key" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid, "upworkKey" character varying NOT NULL, "upworkSecret" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_api_key_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "api_key" ADD CONSTRAINT "FK_api_key_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "api_key" DROP CONSTRAINT "FK_api_key_user"`);
    await queryRunner.query(`DROP TABLE "api_key"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TYPE "subscription_status_enum"`);
    await queryRunner.query(`DROP TYPE "user_role_enum"`);
  }
}
