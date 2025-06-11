/*
  Warnings:

  - You are about to drop the column `is_public` on the `features` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "features_is_public_idx";

-- AlterTable
ALTER TABLE "features" DROP COLUMN "is_public";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_owner" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "pages" (
    "id" UUID NOT NULL,
    "path" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_roles" (
    "id" UUID NOT NULL,
    "page_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_features" (
    "id" UUID NOT NULL,
    "page_id" UUID NOT NULL,
    "feature_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_features_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pages_deleted_at_idx" ON "pages"("deleted_at");

-- CreateIndex
CREATE INDEX "pages_path_idx" ON "pages"("path");

-- CreateIndex
CREATE INDEX "page_roles_page_id_idx" ON "page_roles"("page_id");

-- CreateIndex
CREATE INDEX "page_roles_role_id_idx" ON "page_roles"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "page_roles_page_id_role_id_key" ON "page_roles"("page_id", "role_id");

-- CreateIndex
CREATE INDEX "page_features_page_id_idx" ON "page_features"("page_id");

-- CreateIndex
CREATE INDEX "page_features_feature_id_idx" ON "page_features"("feature_id");

-- CreateIndex
CREATE UNIQUE INDEX "page_features_page_id_feature_id_key" ON "page_features"("page_id", "feature_id");

-- AddForeignKey
ALTER TABLE "page_roles" ADD CONSTRAINT "page_roles_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_roles" ADD CONSTRAINT "page_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_features" ADD CONSTRAINT "page_features_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_features" ADD CONSTRAINT "page_features_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "features"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
