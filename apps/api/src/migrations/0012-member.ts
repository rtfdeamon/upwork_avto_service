import { MigrationInterface, QueryRunner } from 'typeorm';

export class Member1710000000012 implements MigrationInterface {
  name = 'Member1710000000012';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "member_role_enum" AS ENUM('SDR','VIEWER')`);
    await queryRunner.query(`CREATE TABLE "member" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "role" "member_role_enum" NOT NULL, "invitedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "ownerId" uuid, CONSTRAINT "PK_member_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`ALTER TABLE "member" ADD CONSTRAINT "FK_member_owner" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "member" DROP CONSTRAINT "FK_member_owner"`);
    await queryRunner.query(`DROP TABLE "member"`);
    await queryRunner.query(`DROP TYPE "member_role_enum"`);
  }
}
