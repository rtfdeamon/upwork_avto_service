import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvoJobTitle1710000000011 implements MigrationInterface {
  name = 'ConvoJobTitle1710000000011'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "conversation" ADD "jobTitle" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "conversation" DROP COLUMN "jobTitle"`);
  }
}
