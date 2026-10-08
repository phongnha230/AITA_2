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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
