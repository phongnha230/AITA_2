import type { Metadata } from 'next';
import './globals.css';

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
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
