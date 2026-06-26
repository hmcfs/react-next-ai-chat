-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "chat_message" (
    "msg_id" CHAR(32) NOT NULL DEFAULT replace((gen_random_uuid())::text, '-'::text, ''::text),
    "chat_id" CHAR(32) NOT NULL,
    "role" VARCHAR(10) NOT NULL,
    "content" TEXT NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_message_pkey" PRIMARY KEY ("msg_id")
);

-- CreateTable
CREATE TABLE "chat_session" (
    "chat_id" CHAR(32) NOT NULL DEFAULT replace((gen_random_uuid())::text, '-'::text, ''::text),
    "user_id" BIGINT NOT NULL,
    "title" VARCHAR(255) NOT NULL DEFAULT '',
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_delete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "chat_session_pkey" PRIMARY KEY ("chat_id")
);

-- CreateTable
CREATE TABLE "sys_user" (
    "id" BIGSERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(100) NOT NULL,

    CONSTRAINT "sys_user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_chatid" ON "chat_message"("chat_id");

-- CreateIndex
CREATE INDEX "idx_userid" ON "chat_session"("user_id", "is_delete");

-- CreateIndex
CREATE UNIQUE INDEX "sys_user_username_key" ON "sys_user"("username");

-- AddForeignKey
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chat_session"("chat_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_session" ADD CONSTRAINT "chat_session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "sys_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
