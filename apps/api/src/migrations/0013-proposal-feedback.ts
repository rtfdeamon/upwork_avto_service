import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProposalFeedback0013 implements MigrationInterface {
  name = 'ProposalFeedback0013';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "proposal_feedback_enum" AS ENUM('up','down')`);
    await queryRunner.query(`ALTER TABLE "proposal" ADD "feedback" "proposal_feedback_enum"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "proposal" DROP COLUMN "feedback"`);
    await queryRunner.query(`DROP TYPE "proposal_feedback_enum"`);
  }
}
