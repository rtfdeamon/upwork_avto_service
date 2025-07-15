import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init0001 implements MigrationInterface {
  name = 'Init0001';

  async up(queryRunner: QueryRunner): Promise<void> {
    // empty initial migration
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // empty
  }
}
