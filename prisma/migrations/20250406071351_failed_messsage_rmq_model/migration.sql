-- CreateTable
CREATE TABLE "FailedMessage" (
    "id" SERIAL NOT NULL,
    "queue" TEXT NOT NULL,
    "routingKey" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "error" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FailedMessage_pkey" PRIMARY KEY ("id")
);
