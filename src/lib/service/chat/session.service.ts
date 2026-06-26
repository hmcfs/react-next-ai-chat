import { prisma } from '@/lib/prisma';
let count = 0;
console.log('createSession', ++count);
export async function createSession(userId: number, content: string) {
  const session = await prisma.chatSession.create({
    data: {
      userId: userId,
      title: content.slice(0, 20),
    },
  });

  // 2. 再独立创建 Message
  await prisma.chatMessage.create({
    data: {
      chatId: session.chatId,
      role: 'user',
      content: content,
    },
  });
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
