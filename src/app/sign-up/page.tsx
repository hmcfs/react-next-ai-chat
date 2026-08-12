// app/sign-up/[[...sign-up]]/page.tsx

// ISR：每天重新生成一次（页面几乎不变）
export const revalidate = 86400;

// import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return <div className="min-h-screen flex items-center justify-center">{/*  <SignUp /> */}</div>;
}