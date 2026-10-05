import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SiteShell } from '../components/common/SiteShell';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'vietnamese'], display: 'swap' });

export const metadata: Metadata = {
  title: 'AITA - AI-powered Teaching Assistant System',
  description: 'Hệ thống trợ giảng thông minh hỗ trợ tự động hóa chấm bài và đánh giá lập trình tại Đại học FPT (SWD392)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 antialiased`}>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
