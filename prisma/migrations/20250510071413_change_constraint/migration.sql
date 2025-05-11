/*
  Warnings:

  - A unique constraint covering the columns `[name,company_id,store_id,deleted_at]` on the table `roles` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "roles_name_company_id_store_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_company_id_store_id_deleted_at_key" ON "roles"("name", "company_id", "store_id", "deleted_at");
