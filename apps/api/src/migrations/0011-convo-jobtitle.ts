import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvoJobTitle0011 implements MigrationInterface {
  name = 'ConvoJobTitle0011'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "conversation" ADD "jobTitle" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "conversation" DROP COLUMN "jobTitle"`);
  }
}
