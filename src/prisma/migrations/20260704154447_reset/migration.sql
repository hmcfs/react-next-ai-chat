/*
  Warnings:

  - You are about to alter the column `model_name` on the `chat_message` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(32)`.

*/
-- AlterTable
ALTER TABLE "chat_message" ALTER COLUMN "model_name" SET DATA TYPE CHAR(32);
