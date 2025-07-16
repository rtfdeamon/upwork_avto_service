import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1710000000001 implements MigrationInterface {
  name = 'Init1710000000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    // empty initial migration
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // empty
  }
}
