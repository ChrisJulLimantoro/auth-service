/*
  Warnings:

  - You are about to drop the column `company_id` on the `user_roles` table. All the data in the column will be lost.
  - You are about to drop the column `store_id` on the `user_roles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,company_id,store_id]` on the table `roles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,role_id]` on the table `user_roles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `company_id` to the `roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `store_id` to the `roles` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_company_id_fkey";

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_store_id_fkey";

-- DropIndex
DROP INDEX "user_roles_user_id_role_id_company_id_store_id_key";

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "company_id" UUID NOT NULL,
ADD COLUMN     "store_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "user_roles" DROP COLUMN "company_id",
DROP COLUMN "store_id";

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_company_id_store_id_key" ON "roles"("name", "company_id", "store_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_id_key" ON "user_roles"("user_id", "role_id");

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
