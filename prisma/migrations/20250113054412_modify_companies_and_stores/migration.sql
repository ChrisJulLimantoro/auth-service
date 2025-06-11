/*
  Warnings:

  - Added the required column `code` to the `companies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `stores` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "code" TEXT NOT NULL;
