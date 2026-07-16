/*
  Warnings:

  - You are about to drop the column `file_name` on the `chat_message` table. All the data in the column will be lost.
  - You are about to drop the column `file_type` on the `chat_message` table. All the data in the column will be lost.
  - You are about to drop the column `file_url` on the `chat_message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "chat_message" DROP COLUMN "file_name",
DROP COLUMN "file_type",
DROP COLUMN "file_url";

-- CreateTable
CREATE TABLE "attachment" (
    "id" CHAR(32) NOT NULL DEFAULT replace((gen_random_uuid())::text, '-'::text, ''::text),
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER,
    "msg_id" CHAR(32) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_attachment_msg_id" ON "attachment"("msg_id");

-- AddForeignKey
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_msg_id_fkey" FOREIGN KEY ("msg_id") REFERENCES "chat_message"("msg_id") ON DELETE CASCADE ON UPDATE CASCADE;
