'use client';

import Link from 'next/link';
import { CalendarClock, CheckCircle2, Code2, FileText, HardDriveUpload, KeyRound, Laptop, ShieldCheck } from 'lucide-react';
import { StudentPageHeading } from '../shared/StudentPageHeading';

const steps = [
  { icon: CalendarClock, title: 'Trước giờ thi', items: ['Kiểm tra lịch bắt đầu và hạn nộp trong thẻ ca thi.', 'Chuẩn bị máy cá nhân, IDE và môi trường lập trình phù hợp.', 'Đến giờ thi, nhập mã đề giảng viên cung cấp. Nếu nhập trước giờ, màn hình sẽ chờ đến lúc mở ca.'] },
  { icon: FileText, title: 'Nhận đề', items: ['Khi ca mở, tải PDF đề thi từ trang ca thi.', 'Đọc kỹ yêu cầu, định dạng đầu vào/đầu ra và các giới hạn.', 'Testcase mẫu và rubric chỉ hiển thị nếu giảng viên công bố.'] },
  { icon: Code2, title: 'Làm bài trên máy cá nhân', items: ['Viết và chạy thử bài bằng IDE trên máy của bạn.', 'Không chia sẻ mã nguồn hoặc nhận trợ giúp trái quy định của khóa học.', 'Web chỉ ghi nhận lượt mở đề và bài nộp; không theo dõi màn hình hay IDE cá nhân.'] },
  { icon: HardDriveUpload, title: 'Nộp bài', items: ['Nộp qua ZIP hoặc Git nếu ca thi cho phép phương thức đó.', 'Kiểm tra đúng nội dung và định dạng trước khi gửi.', 'Backend sẽ từ chối nộp trước giờ, khi ca tạm dừng/đã đóng hoặc sau hạn nộp.'] },
];

export function ExamRegulationsPage() {
  return (
    <div className="space-y-7">
      <StudentPageHeading
        eyebrow="Khảo thí & hướng dẫn"
        title="Hướng dẫn tham gia ca thi"
        description="Mỗi đề thi là một ca gắn với khóa học. Bạn vào ca bằng mã đề, xem PDF rồi làm bài trên IDE của mình."
        action={<Link href="/student/exams" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"><CalendarClock className="size-4" />Danh sách ca thi</Link>}
      />
      <div className="flex flex-col gap-4 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-950 to-slate-900 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl"><span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold"><ShieldCheck className="size-4 text-emerald-300" />Liêm chính học thuật</span><h2 className="mt-3 text-xl font-bold">Làm bài độc lập và nộp đúng hạn</h2><p className="mt-2 text-sm leading-relaxed text-slate-200">Hệ thống quản lý lịch ca, mã mở đề và bài nộp. Việc làm bài diễn ra trên máy cá nhân của bạn.</p></div>
        <div className="flex shrink-0 gap-3"><div className="rounded-xl bg-white/10 p-3 text-center"><KeyRound className="mx-auto size-5 text-indigo-200" /><span className="mt-1 block text-xs">Mã đề</span></div><div className="rounded-xl bg-white/10 p-3 text-center"><Laptop className="mx-auto size-5 text-emerald-200" /><span className="mt-1 block text-xs">IDE cá nhân</span></div></div>
      </div>
      <section className="grid gap-5 md:grid-cols-2">
        {steps.map(({ icon: Icon, title, items }, index) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3 border-b border-slate-100 pb-4"><span className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><Icon className="size-5" /></span><div><p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Bước {index + 1}</p><h3 className="font-bold text-slate-900">{title}</h3></div></div><ul className="mt-4 space-y-3">{items.map((item) => <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-700"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" /><span>{item}</span></li>)}</ul></article>)}
      </section>
      <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Nếu gặp lỗi mã đề, PDF hoặc tải bài, liên hệ giảng viên phụ trách khóa học và gửi kèm tên ca thi cùng ảnh thông báo lỗi.</p>
    </div>
  );
}
