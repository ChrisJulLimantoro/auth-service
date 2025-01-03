-- CreateIndex
CREATE INDEX "companies_deleted_at_idx" ON "companies"("deleted_at");

-- CreateIndex
CREATE INDEX "companies_owner_id_idx" ON "companies"("owner_id");

-- CreateIndex
CREATE INDEX "feature_roles_deleted_at_idx" ON "feature_roles"("deleted_at");

-- CreateIndex
CREATE INDEX "feature_roles_feature_id_idx" ON "feature_roles"("feature_id");

-- CreateIndex
CREATE INDEX "feature_roles_role_id_idx" ON "feature_roles"("role_id");

-- CreateIndex
CREATE INDEX "features_deleted_at_idx" ON "features"("deleted_at");

-- CreateIndex
CREATE INDEX "features_is_public_idx" ON "features"("is_public");

-- CreateIndex
CREATE INDEX "roles_deleted_at_idx" ON "roles"("deleted_at");

-- CreateIndex
CREATE INDEX "roles_company_id_store_id_idx" ON "roles"("company_id", "store_id");

-- CreateIndex
CREATE INDEX "stores_deleted_at_idx" ON "stores"("deleted_at");

-- CreateIndex
CREATE INDEX "stores_company_id_idx" ON "stores"("company_id");

-- CreateIndex
CREATE INDEX "user_roles_deleted_at_idx" ON "user_roles"("deleted_at");

-- CreateIndex
CREATE INDEX "user_roles_user_id_idx" ON "user_roles"("user_id");

-- CreateIndex
CREATE INDEX "user_roles_role_id_idx" ON "user_roles"("role_id");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");
