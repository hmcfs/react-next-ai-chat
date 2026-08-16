import { AuthShell } from '@/components/auth/auth-shell';
import { BrainCircuit, FileText, MessageSquareText } from 'lucide-react';
import { Metadata } from 'next';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: '登录',
  description: '登录 Clair，继续使用你的 AI 对话助手。',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://clair-ai.com/login',
  },
};

export default function LoginPage() {
  return (
    <AuthShell
      headline="欢迎回来，接着聊。"
      tagline="登录 Clair，继续与你的 AI 助手对话。多模型、深度思考、文件即传即聊。"
      chats={[
        { role: 'user', text: '帮我总结一下今天的会议纪要' },
        { role: 'assistant', text: '好的，我整理了 3 个关键结论和 2 个待办事项，需要我列出来吗？' },
        { role: 'user', text: '顺便把重点事项排个优先级' },
        {
          role: 'assistant',
          text: '已按紧急程度排好：① 修复线上登录问题 ② 确认下季度路线图 ③ 跟进客户反馈。要生成待办清单吗？',
        },
      ]}
      features={[
        { icon: MessageSquareText, title: '多模型支持', desc: '主流模型随意切换，按需选择' },
        { icon: BrainCircuit, title: '深度思考', desc: '复杂问题，一步步推理给你看' },
        { icon: FileText, title: '即传即聊', desc: '图片、文档直接拖进来对话' },
      ]}
    >
      <LoginForm />
    </AuthShell>
  );
}
