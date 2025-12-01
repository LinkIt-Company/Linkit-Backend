import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1764591609850 implements MigrationInterface {
  name = 'Migration1764591609850';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "ai_classifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "suggested_folder_id" uuid NOT NULL, "url" character varying NOT NULL, "description" character varying NOT NULL, "keywords" text array NOT NULL, "completed_at" TIMESTAMP, "deleted_at" TIMESTAMP, CONSTRAINT "PK_97061146c652fa1a2adff3ab879" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "keywords" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, CONSTRAINT "PK_4aa660a7a585ed828da68f3c28e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "post_keywords" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "post_id" uuid NOT NULL, "keyword_id" uuid NOT NULL, CONSTRAINT "PK_14416d735343e53c4bb3052beb4" PRIMARY KEY ("id", "post_id", "keyword_id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."posts_ai_status_enum" AS ENUM('in_progress', 'success', 'fail')`,
    );
    await queryRunner.query(
      `CREATE TABLE "posts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "folder_id" uuid NOT NULL, "url" character varying NOT NULL, "title" character varying NOT NULL, "description" character varying, "is_favorite" boolean NOT NULL DEFAULT false, "read_at" TIMESTAMP, "thumbnail_img_url" character varying, "ai_status" "public"."posts_ai_status_enum" NOT NULL, "ai_classification_id" uuid, CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."folders_type_enum" AS ENUM('custom', 'default', 'all', 'favorite')`,
    );
    await queryRunner.query(
      `CREATE TABLE "folders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "name" character varying NOT NULL, "type" "public"."folders_type_enum" NOT NULL, "visible" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_8578bd31b0e7f6d6c2480dbbca8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "device_token" character varying NOT NULL, CONSTRAINT "UQ_15b7292d84f25471d3fb957c7bb" UNIQUE ("device_token"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "onboard_categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "category" character varying NOT NULL, CONSTRAINT "UQ_c11490bf17f662f2bdf870cd81a" UNIQUE ("category"), CONSTRAINT "PK_d5dfeb07302b45379eb4974ddcf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "metrics" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_success" boolean NOT NULL, "time" integer NOT NULL, "post_url" character varying NOT NULL, "post_id" character varying NOT NULL, CONSTRAINT "PK_5283cad666a83376e28a715bf0e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_classifications" ADD CONSTRAINT "FK_3c9f9c6080a997ad272556b6698" FOREIGN KEY ("suggested_folder_id") REFERENCES "folders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_keywords" ADD CONSTRAINT "FK_6e8f234c747402c23dea39080f1" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_keywords" ADD CONSTRAINT "FK_867156d61901e2a2dd5335d4d93" FOREIGN KEY ("keyword_id") REFERENCES "keywords"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_c4f9a7bd77b489e711277ee5986" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_fa60ac0f1f9f0386488afe73355" FOREIGN KEY ("folder_id") REFERENCES "folders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_422d4fcb65624c6d8aede910bda" FOREIGN KEY ("ai_classification_id") REFERENCES "ai_classifications"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "folders" ADD CONSTRAINT "FK_71af7633de585b66b4db26734c9" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "folders" DROP CONSTRAINT "FK_71af7633de585b66b4db26734c9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" DROP CONSTRAINT "FK_422d4fcb65624c6d8aede910bda"`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" DROP CONSTRAINT "FK_fa60ac0f1f9f0386488afe73355"`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" DROP CONSTRAINT "FK_c4f9a7bd77b489e711277ee5986"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_keywords" DROP CONSTRAINT "FK_867156d61901e2a2dd5335d4d93"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_keywords" DROP CONSTRAINT "FK_6e8f234c747402c23dea39080f1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_classifications" DROP CONSTRAINT "FK_3c9f9c6080a997ad272556b6698"`,
    );
    await queryRunner.query(`DROP TABLE "metrics"`);
    await queryRunner.query(`DROP TABLE "onboard_categories"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "folders"`);
    await queryRunner.query(`DROP TYPE "public"."folders_type_enum"`);
    await queryRunner.query(`DROP TABLE "posts"`);
    await queryRunner.query(`DROP TYPE "public"."posts_ai_status_enum"`);
    await queryRunner.query(`DROP TABLE "post_keywords"`);
    await queryRunner.query(`DROP TABLE "keywords"`);
    await queryRunner.query(`DROP TABLE "ai_classifications"`);
  }
}
