/*
  Warnings:

  - You are about to drop the column `routes` on the `features` table. All the data in the column will be lost.
  - Added the required column `description` to the `features` table without a default value. This is not possible if the table is not empty.
  - Added the required column `store_id` to the `user_roles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "features" DROP COLUMN "routes",
ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user_roles" ADD COLUMN     "store_id" UUID NOT NULL;

-- CreateTable
CREATE TABLE "stores" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
