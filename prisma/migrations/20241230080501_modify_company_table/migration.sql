/*
  Warnings:

  - Added the required column `owner_id` to the `companies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_internal` to the `features` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "owner_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "features" ADD COLUMN     "is_internal" BOOLEAN NOT NULL;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
