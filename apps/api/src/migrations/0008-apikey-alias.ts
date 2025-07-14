import { MigrationInterface, QueryRunner } from 'typeorm';

export class ApiKeyAlias0008 implements MigrationInterface {
  name = 'ApiKeyAlias0008'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "api_key" ADD "alias" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "api_key" DROP COLUMN "alias"`);
  }
}
