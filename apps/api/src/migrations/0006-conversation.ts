import { MigrationInterface, QueryRunner } from 'typeorm';

export class Conversation0006 implements MigrationInterface {
  name = 'Conversation0006'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "conversation" ("id" character varying NOT NULL, "jobId" character varying NOT NULL, "snippet" text NOT NULL, "ts" TIMESTAMP WITH TIME ZONE NOT NULL, "userId" uuid, CONSTRAINT "PK_conversation_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversation" ADD CONSTRAINT "FK_conversation_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "conversation" DROP CONSTRAINT "FK_conversation_user"`);
    await queryRunner.query(`DROP TABLE "conversation"`);
  }
}
