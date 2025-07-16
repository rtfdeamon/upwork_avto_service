import { MigrationInterface, QueryRunner } from 'typeorm';

export class ApiKeyAlias1710000000008 implements MigrationInterface {
  name = 'ApiKeyAlias1710000000008'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "api_key" ADD "alias" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "api_key" DROP COLUMN "alias"`);
  }
}
