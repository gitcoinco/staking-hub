import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1740736920257 implements MigrationInterface {
    name = 'InitMigration1740736920257'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "pool" ("id" SERIAL NOT NULL, "chainId" integer NOT NULL, "alloPoolId" character varying NOT NULL, "rewards" text, "merkleRoot" text, CONSTRAINT "UQ_72fcaa655b2b7348f4feaf25ea3" UNIQUE ("chainId", "alloPoolId"), CONSTRAINT "PK_db1bfe411e1516c01120b85f8fe" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "pool"`);
    }

}
