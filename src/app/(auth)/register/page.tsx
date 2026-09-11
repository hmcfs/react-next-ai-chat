import { AuthShell } from '../auth-shell';
import { BrainCircuit, FileText, MessageSquareText } from 'lucide-react';
import { Metadata } from 'next';
import { RegisterForm } from './RegisterForm';

export const metadata: Metadata = {
  title: '注册',
  description: '注册 Clair，开始你的 AI 对话之旅。',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://clair-ai.com/register',
  },
};

export default function RegisterPage() {
  return (
    <AuthShell
      headline="开始你的第一段对话。"
      tagline="注册 Clair，一个清爽的 AI 对话助手。复杂的问题，用对话的方式解决。"
      chats={[
        { role: 'user', text: 'Hi，我想了解下 Clair 支持哪些模型' },
        {
          role: 'assistant',
          text: '你好！Clair 支持多种主流大模型，你可以随时切换，也可以让它深度思考复杂问题。',
        },
        { role: 'user', text: '那我能上传文件分析吗？' },
        {
          role: 'assistant',
          text: '当然可以。图片、PDF、文档直接拖进来就能对话，我会基于文件内容回答。现在就去试试吧！',
        },
      ]}
      features={[
        { icon: MessageSquareText, title: '多模型支持', desc: '主流模型随意切换，按需选择' },
        { icon: BrainCircuit, title: '深度思考', desc: '复杂问题，一步步推理给你看' },
        { icon: FileText, title: '即传即聊', desc: '图片、文档直接拖进来对话' },
      ]}
    >
      <RegisterForm />
    </AuthShell>
  );
}
