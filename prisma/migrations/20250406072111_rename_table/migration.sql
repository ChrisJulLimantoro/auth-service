/*
  Warnings:

  - You are about to drop the `FailedMessage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "FailedMessage";

-- CreateTable
CREATE TABLE "failed_messages" (
    "id" SERIAL NOT NULL,
    "queue" TEXT NOT NULL,
    "routingKey" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "error" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "failed_messages_pkey" PRIMARY KEY ("id")
);
