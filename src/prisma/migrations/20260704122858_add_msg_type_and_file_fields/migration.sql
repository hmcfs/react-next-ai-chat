-- CreateEnum
CREATE TYPE "MsgType" AS ENUM ('chat', 'memory', 'document', 'imageOcr', 'fileNotice');

-- AlterTable
ALTER TABLE "chat_message" ADD COLUMN     "file_name" TEXT,
ADD COLUMN     "file_type" TEXT,
ADD COLUMN     "file_url" TEXT,
ADD COLUMN     "type" "MsgType" NOT NULL DEFAULT 'chat';
