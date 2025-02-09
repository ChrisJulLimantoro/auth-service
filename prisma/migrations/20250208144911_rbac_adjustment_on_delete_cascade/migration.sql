/*
  Warnings:

  - You are about to drop the column `created_at` on the `user_roles` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `user_roles` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `user_roles` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_role_id_fkey";

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_user_id_fkey";

-- DropIndex
DROP INDEX "user_roles_deleted_at_idx";

-- AlterTable
ALTER TABLE "user_roles" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "updated_at";

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
