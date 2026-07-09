-- AlterTable
ALTER TABLE "chat_message" ADD COLUMN     "enable_deep_think" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "model_name" TEXT NOT NULL DEFAULT 'qwen',
ADD COLUMN     "reasoning_content" TEXT;
