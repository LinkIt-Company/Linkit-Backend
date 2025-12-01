import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1764589728508 implements MigrationInterface {
  name = 'Migration1764589728508';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "post_keywords" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_keywords" DROP CONSTRAINT "PK_69a48d837cede997cb0d949fc84"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_keywords" ADD CONSTRAINT "PK_14416d735343e53c4bb3052beb4" PRIMARY KEY ("post_id", "keyword_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_keywords" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_keywords" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboard_categories" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboard_categories" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "onboard_categories" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboard_categories" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_keywords" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_keywords" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_keywords" DROP CONSTRAINT "PK_14416d735343e53c4bb3052beb4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_keywords" ADD CONSTRAINT "PK_69a48d837cede997cb0d949fc84" PRIMARY KEY ("post_id", "keyword_id")`,
    );
    await queryRunner.query(`ALTER TABLE "post_keywords" DROP COLUMN "id"`);
  }
}
