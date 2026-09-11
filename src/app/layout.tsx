import type { Metadata } from 'next';
import { Geist, Geist_Mono, Inter } from 'next/font/google';
import './globals.css';

import { ThemeProvider } from '@/components/theme/theme-provider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Clair - 清爽的 AI 对话助手',
    template: '%s | Clair',
  },
  description:
    'Clair 是一款清爽的 AI 对话助手：多模型支持、深度思考、图片与文件即传即聊、历史记录自动保存。让复杂的问题，用对话的方式解决。',
  keywords: ['AI', 'AI对话', '智能助手', '多模型', '流式输出', '图片理解', '文件上传'],
  authors: [{ name: 'Clair Team' }],
  creator: 'Clair',
  publisher: 'Clair',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://clair-ai.com',
    siteName: 'Clair',
    title: 'Clair - 清爽的 AI 对话助手',
    description: '多模型支持、深度思考、图片与文件即传即聊、历史记录自动保存',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Clair - AI 对话助手',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clair - 清爽的 AI 对话助手',
    description: '多模型支持、深度思考、图片与文件即传即聊',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        'h-full',
        'antialiased',
        geistSans.variable,
        geistMono.variable,
        'font-sans',
        inter.variable
      )}
    >
      <body className="min-h-full flex" suppressHydrationWarning>
        <ThemeProvider>
          <TooltipProvider>
            <SidebarProvider>
              {children}
              <Toaster position="top-center" />
            </SidebarProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
