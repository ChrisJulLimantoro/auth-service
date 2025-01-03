-- DropForeignKey
ALTER TABLE "roles" DROP CONSTRAINT "roles_store_id_fkey";

-- AlterTable
ALTER TABLE "roles" ALTER COLUMN "store_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
