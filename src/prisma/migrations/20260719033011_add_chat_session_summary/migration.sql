-- AlterTable
ALTER TABLE "chat_session" ADD COLUMN     "summary" VARCHAR(1500),
ADD COLUMN     "summary_update_time" TIMESTAMP(3);
