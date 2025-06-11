/*
  Warnings:

  - Added the required column `service` to the `features` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "features" ADD COLUMN     "service" TEXT NOT NULL;
