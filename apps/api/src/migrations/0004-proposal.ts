import { MigrationInterface, QueryRunner } from 'typeorm';

export class Proposal0004 implements MigrationInterface {
  name = 'Proposal0004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "proposal_status_enum" AS ENUM('DRAFT','SENT','ERROR')`,
    );
    await queryRunner.query(
      `CREATE TABLE "proposal" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "jobId" character varying NOT NULL, "draft" text NOT NULL, "status" "proposal_status_enum" NOT NULL DEFAULT 'DRAFT', "sentAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_proposal_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal" ADD CONSTRAINT "FK_proposal_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "proposal" DROP CONSTRAINT "FK_proposal_user"`,
    );
    await queryRunner.query(`DROP TABLE "proposal"`);
    await queryRunner.query(`DROP TYPE "proposal_status_enum"`);
  }
}
