import { prisma } from '@/lib/prisma';

export async function createSession(userId: number, content: string) {
  console.log(`[createSession] START userId=${userId}, content.length=${content.length}`);

  const session = await prisma.chatSession.create({
    data: {
      userId: userId,
      title: content.slice(0, 20),
    },
  });
  console.log(`[createSession] chatSession created: chatId=${session.chatId}`);

  const msg = await prisma.chatMessage.create({
    data: {
      chatId: session.chatId,
      role: 'user',
      content: content,
    },
  });
  console.log(`[createSession] chatMessage created: msgId=${msg.msgId}`);

  return { chatId: session.chatId, title: session.title, content };
}
export async function getHistorySession(userId: number, page: number, pageSize: number) {
  const skip = (page - 1) * pageSize;
  const historyList = await prisma.chatSession.findMany({
    where: { userId: userId, isDelete: false },
    select: {
      chatId: true,
      title: true,
      createTime: true,
      updateTime: true,
    },
    orderBy: { updateTime: 'desc' },
    take: pageSize,
    skip,
  });
  return { historyList, page, pageSize };
}
