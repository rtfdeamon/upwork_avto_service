import { MigrationInterface, QueryRunner } from 'typeorm';

export class OAuth0002 implements MigrationInterface {
  name = 'OAuth0002'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "api_key" ADD "refreshToken" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "api_key" ADD "expiresAt" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "api_key" DROP COLUMN "expiresAt"`);
    await queryRunner.query(`ALTER TABLE "api_key" DROP COLUMN "refreshToken"`);
  }
}
