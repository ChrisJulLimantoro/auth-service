/*
  Warnings:

  - A unique constraint covering the columns `[feature_id,role_id]` on the table `feature_roles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,role_id,company_id,store_id]` on the table `user_roles` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "feature_roles_feature_id_role_id_key" ON "feature_roles"("feature_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_id_company_id_store_id_key" ON "user_roles"("user_id", "role_id", "company_id", "store_id");
