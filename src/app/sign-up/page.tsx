// app/sign-up/[[...sign-up]]/page.tsx

import { Metadata } from 'next';

// ISR：每天重新生成一次（页面几乎不变）
export const revalidate = 86400;

export const metadata: Metadata = {
  title: '注册',
  description: '注册 Clair，开始你的 AI 对话之旅。',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://clair-ai.com/sign-up',
  },
};

// import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return <div className="min-h-screen flex items-center justify-center">{/*  <SignUp /> */}</div>;
}