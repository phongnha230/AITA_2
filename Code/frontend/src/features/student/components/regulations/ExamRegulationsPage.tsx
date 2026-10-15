'use client';

import Link from 'next/link';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Code2,
  Cpu,
  FileCheck2,
  Headphones,
  HelpCircle,
  Laptop,
  Mail,
  Phone,
  PlayCircle,
  RefreshCw,
  Scale,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { StudentPageHeading } from '../shared/StudentPageHeading';

export function ExamRegulationsPage() {
  return (
    <div className="space-y-8">
      {/* 1. Header trang */}
      <StudentPageHeading
        eyebrow="Khảo thí & Đảm bảo chất lượng"
        title="Quy chế thi PE & Hướng dẫn phòng thi"
        description="Toàn bộ quy định, tiêu chuẩn kỹ thuật thực hành và quy trình xử lý sự cố trong kỳ thi Practical Exam (PE) tại hệ thống AITA."
        action={
          <Link
            href="/student/exams"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
          >
            <PlayCircle className="h-4 w-4" />
            <span>Vào danh sách ca thi</span>
          </Link>
        }
      />

      {/* 2. Banner Thông điệp Liêm chính học thuật */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white shadow-xl sm:p-7">
        <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-200">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-300" />
              <span>Tiêu chuẩn Đánh giá Năng lực Thực hành</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl text-white">
              Liêm chính học thuật là giá trị cốt lõi của sinh viên CNTT
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
              Kỳ thi PE kiểm tra kỹ năng tư duy lập trình và giải quyết bài toán độc lập. Mọi hành vi gian lận,
              trao đổi mã nguồn hoặc can thiệp kỹ thuật đều được hệ thống Sandbox &amp; AI Proctoring ghi nhận và xử lý nghiêm theo quy định nhà trường.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <div className="rounded-xl border border-white/10 bg-white/10 p-3.5 text-center backdrop-blur-xs">
              <span className="block text-xl font-extrabold text-emerald-400">100%</span>
              <span className="text-[11px] text-slate-200">Giám sát tự động</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-3.5 text-center backdrop-blur-xs">
              <span className="block text-xl font-extrabold text-blue-300">Isolated</span>
              <span className="text-[11px] text-slate-200">Docker Sandbox</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bốn Giai đoạn Quy chế ca thi */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Giai đoạn 1: Trước giờ thi */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:shadow-md">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-600/10">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Giai đoạn 1</span>
              <h3 className="text-base font-bold text-slate-900">Trước giờ thi (Chuẩn bị &amp; Điểm danh)</h3>
            </div>
          </div>

          <ul className="mt-4 space-y-3.5 text-xs text-slate-700">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <div>
                <strong className="text-slate-900">Có mặt đúng giờ:</strong> Thí sinh phải có mặt tại phòng thi trước ít nhất <strong>15 phút</strong> so với giờ bắt đầu ca thi. Thí sinh đến muộn quá 15 phút sau khi phát đề sẽ không được tham gia.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <div>
                <strong className="text-slate-900">Giấy tờ tùy thân:</strong> Xuất trình Thẻ sinh viên hợp lệ hoặc CCCD/VNeID định danh mức 2 cho Cán bộ coi thi (CBCT) kiểm tra.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <div>
                <strong className="text-slate-900">Tư trang cá nhân:</strong> Tắt nguồn điện thoại di động, đồng hồ thông minh, tai nghe và để tại khu vực quy định đầu phòng thi.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <div>
                <strong className="text-slate-900">Kiểm tra máy trạm:</strong> Khởi động máy tính, kiểm tra bàn phím, chuột, đường truyền mạng và đăng nhập tài khoản vào hệ thống AITA Exam.
              </div>
            </li>
          </ul>
        </div>

        {/* Giai đoạn 2: Trong giờ làm bài */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:shadow-md">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-600/10">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Giai đoạn 2</span>
              <h3 className="text-base font-bold text-slate-900">Trong ca thi (Môi trường &amp; Kỷ luật)</h3>
            </div>
          </div>

          <ul className="mt-4 space-y-3.5 text-xs text-slate-700">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
              <div>
                <strong className="text-slate-900">Làm bài độc lập:</strong> Nghiêm cấm trao đổi, thảo luận, quay cóp hoặc nhìn màn hình của thí sinh khác dưới mọi hình thức.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
              <div>
                <strong className="text-slate-900">Phần mềm cho phép:</strong> Chỉ được sử dụng các IDE lập trình theo đề (VS Code, Code::Blocks, CLion, NetBeans, IntelliJ) và trình duyệt web mở duy nhất tab thi AITA.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
              <div>
                <strong className="text-slate-900">Cấm kết nối ngoài:</strong> Không cắm USB, thiết bị lưu trữ, không dùng Proxy/VPN hoặc truy cập các trang web mạng xã hội, giải trí, AI bên thứ 3.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
              <div>
                <strong className="text-slate-900">Giữ trật tự phòng thi:</strong> Không tự ý rời khỏi chỗ ngồi. Khi có thắc mắc hoặc sự cố, giơ tay xin ý kiến CBCT.
              </div>
            </li>
          </ul>
        </div>

        {/* Giai đoạn 3: Nộp bài & Xác nhận */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:shadow-md">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-600/10">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Giai đoạn 3</span>
              <h3 className="text-base font-bold text-slate-900">Nộp bài thi &amp; Rời phòng thi</h3>
            </div>
          </div>

          <ul className="mt-4 space-y-3.5 text-xs text-slate-700">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <div>
                <strong className="text-slate-900">Đúng định dạng quy định:</strong> Kiểm tra tên file nguồn (vd: <code>main.c</code>, <code>Solution.java</code>...) và cấu trúc package chính xác theo yêu cầu đề bài.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <div>
                <strong className="text-slate-900">Xác nhận nộp bài thành công:</strong> Nhấn nút nộp bài và kiểm tra màn hình hiển thị trạng thái đã tiếp nhận và chạy bộ test của Sandbox.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <div>
                <strong className="text-slate-900">Ký biên bản ca thi:</strong> Giữ nguyên màn hình xác nhận bài nộp, báo CBCT đối chiếu và ký tên vào Biên bản nộp bài trước khi đăng xuất.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <div>
                <strong className="text-slate-900">Rời phòng trật tự:</strong> Sau khi CBCT cho phép, thu dọn đồ dùng cá nhân và rời khỏi khu vực phòng thi trong yên lặng.
              </div>
            </li>
          </ul>
        </div>

        {/* Giai đoạn 4: Xử lý vi phạm kỷ luật */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:shadow-md">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-600/10">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">Kỷ luật &amp; Chế tài</span>
              <h3 className="text-base font-bold text-slate-900">Xử lý các mức độ vi phạm</h3>
            </div>
          </div>

          <ul className="mt-4 space-y-3.5 text-xs text-slate-700">
            <li className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <div>
                <strong className="text-slate-900">Mức 1 - Khiển trách &amp; Trừ điểm:</strong> Áp dụng cho thí sinh trao đổi riêng, nhìn màn hình bạn khác sau khi đã được nhắc nhở lần 1 (trừ 25% - 50% số điểm ca thi).
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <AlertOctagon className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <div>
                <strong className="text-slate-900">Mức 2 - Đình chỉ thi (Điểm 0 môn học):</strong> Áp dụng khi mang điện thoại vào phòng thi, sử dụng tài liệu trái phép, sao chép mã nguồn hoặc cho bạn khác sao chép.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-700" />
              <div>
                <strong className="text-slate-900">Mức 3 - Kỷ luật đình chỉ học tập:</strong> Thi hộ, nhờ người thi hộ, hoặc cố tình can thiệp mã nguồn, tấn công mạng phòng thi sẽ bị chuyển Hội đồng kỷ luật nhà trường đình chỉ học tập từ 1 kỳ đến 1 năm.
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* 4. Quy trình xử lý sự cố kỹ thuật trong ca thi */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/40 p-6 shadow-sm sm:p-7">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/30">
            <Headphones className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Quy trình xử lý sự cố kỹ thuật phòng máy</h3>
            <p className="text-xs text-slate-500">Hướng dẫn khi gặp lỗi phần cứng, mất kết nối hoặc trục trặc phần mềm</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-[11px]">1</span>
              <span>Báo ngay Cán bộ coi thi</span>
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Giơ tay báo ngay CBCT. Tuyệt đối không tự ý khởi động lại máy, ngắt nguồn điện hoặc tự động chuyển sang máy khác.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-[11px]">2</span>
              <span>Đổi máy &amp; Khôi phục code</span>
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Kỹ thuật viên sẽ hỗ trợ chuyển sang máy trạm dự phòng. Các bài nộp và bản nháp đã lưu trên hệ thống AITA sẽ được giữ nguyên vẹn.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-[11px]">3</span>
              <span>Bù giờ theo biên bản</span>
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              CBCT ghi nhận thời gian gián đoạn vào Biên bản sự cố kỹ thuật và tiến hành bù đúng số phút thí sinh bị ảnh hưởng.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Khung Liên hệ Hỗ trợ Khảo thí & IT Helpdesk */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
          Thông tin liên hệ Ban Khảo thí &amp; Kỹ thuật hệ thống
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Mọi thắc mắc về lịch thi, phúc khảo hoặc phản hồi chất lượng phòng thi vui lòng liên hệ:
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <Phone className="h-5 w-5 text-indigo-600 shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-slate-900">Hotline Khảo thí</p>
              <p className="text-slate-500 font-mono">(024) 7300 5588 (Ext: 102)</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <Mail className="h-5 w-5 text-indigo-600 shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-slate-900">Email Khảo thí</p>
              <p className="text-slate-500 font-mono">khaothi@fe.edu.vn</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <Headphones className="h-5 w-5 text-indigo-600 shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-slate-900">Hỗ trợ Kỹ thuật AITA</p>
              <p className="text-slate-500 font-mono">support@aita.edu.vn</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
