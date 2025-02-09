/*
  Warnings:

  - You are about to drop the column `created_at` on the `feature_roles` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `feature_roles` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `feature_roles` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `features` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `features` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `features` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `page_features` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `page_features` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `page_roles` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `page_roles` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `pages` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "feature_roles" DROP CONSTRAINT "feature_roles_feature_id_fkey";

-- DropForeignKey
ALTER TABLE "feature_roles" DROP CONSTRAINT "feature_roles_role_id_fkey";

-- DropForeignKey
ALTER TABLE "page_features" DROP CONSTRAINT "page_features_feature_id_fkey";

-- DropForeignKey
ALTER TABLE "page_features" DROP CONSTRAINT "page_features_page_id_fkey";

-- DropForeignKey
ALTER TABLE "page_roles" DROP CONSTRAINT "page_roles_page_id_fkey";

-- DropForeignKey
ALTER TABLE "page_roles" DROP CONSTRAINT "page_roles_role_id_fkey";

-- DropIndex
DROP INDEX "feature_roles_deleted_at_idx";

-- DropIndex
DROP INDEX "features_deleted_at_idx";

-- DropIndex
DROP INDEX "pages_deleted_at_idx";

-- AlterTable
ALTER TABLE "feature_roles" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "updated_at";

-- AlterTable
ALTER TABLE "features" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "updated_at";

-- AlterTable
ALTER TABLE "page_features" DROP COLUMN "created_at",
DROP COLUMN "updated_at";

-- AlterTable
ALTER TABLE "page_roles" DROP COLUMN "created_at",
DROP COLUMN "updated_at";

-- AlterTable
ALTER TABLE "pages" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "updated_at";

-- AddForeignKey
ALTER TABLE "feature_roles" ADD CONSTRAINT "feature_roles_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "features"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_roles" ADD CONSTRAINT "feature_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_roles" ADD CONSTRAINT "page_roles_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_roles" ADD CONSTRAINT "page_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_features" ADD CONSTRAINT "page_features_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_features" ADD CONSTRAINT "page_features_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "features"("id") ON DELETE CASCADE ON UPDATE CASCADE;
