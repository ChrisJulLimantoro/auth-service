-- CreateTable
CREATE TABLE "action_logs" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID,
    "event" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "diff" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "action_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "action_logs_user_id_idx" ON "action_logs"("user_id");

-- CreateIndex
CREATE INDEX "action_logs_resource_resource_id_idx" ON "action_logs"("resource", "resource_id");
