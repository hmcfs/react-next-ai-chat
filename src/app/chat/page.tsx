import { Metadata } from 'next';
import ChatContent from './chat-content';

export const metadata: Metadata = {
  title: '开始对话',
  description: '创建新对话，与 AI 进行智能交流。支持多模型切换、流式输出、文件上传、图片理解。',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://clair-ai.com/chat',
  },
};

export default function ChatPage() {
  return <ChatContent />;
}