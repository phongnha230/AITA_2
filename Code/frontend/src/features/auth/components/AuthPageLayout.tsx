import { ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';

interface AuthPageLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthPageLayout({ title, description, children }: AuthPageLayoutProps) {
  return (
    <main className="grid min-h-dvh bg-white lg:grid-cols-[minmax(0,0.9fr)_minmax(32rem,1.1fr)]">
      <section className="flex min-h-[15rem] flex-col justify-between bg-indigo-950 px-6 py-7 text-white sm:px-10 sm:py-9 lg:min-h-dvh lg:px-14 lg:py-12 xl:px-20">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-white/10 text-white">
            <ShieldCheck aria-hidden="true" size={22} />
          </span>
          <span className="text-sm font-semibold tracking-wide">AITA · FPT University</span>
        </div>
        <div className="max-w-xl py-8 lg:py-16">
          <h1 className="max-w-[12ch] text-4xl font-semibold leading-tight tracking-tight sm:text-5xl xl:text-6xl">
            Khảo thí lập trình, rõ ràng từ đầu đến cuối.
          </h1>
          <p className="mt-5 max-w-[48ch] text-base leading-7 text-indigo-100 sm:text-lg">
            Hệ thống Khảo thí &amp; Đánh giá lập trình tự động. Quản lý khóa học, tham gia ca thi và theo dõi kết quả bài nộp trên cùng một nền tảng.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-white/15 pt-5 text-sm text-indigo-100">
          <span>Sinh viên</span>
          <span>Giảng viên</span>
          <span>Quản trị viên</span>
        </div>
      </section>

      <section className="flex min-w-0 flex-col justify-center px-4 py-8 sm:px-8 lg:px-12 xl:px-20">
        <div className="mx-auto w-full max-w-md">
          <header className="mb-7">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          </header>
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
            {children}
          </div>
          <p className="mt-6 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} AITA System · FPT University
          </p>
        </div>
      </section>
    </main>
  );
}
