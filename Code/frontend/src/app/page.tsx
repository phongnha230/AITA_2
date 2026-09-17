'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Cpu, 
  Database, 
  Layers, 
  Terminal, 
  ShieldCheck, 
  Sparkles, 
  GitBranch 
} from 'lucide-react';
import api from '../lib/api';

interface HealthData {
  status: string;
  timestamp: string;
  services: {
    server: string;
    database: string;
    redis: string;
  };
}

export default function Home() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/health');
      setHealth(response.data.data);
    } catch (err: any) {
      setError(err.message || 'Không thể kết nối đến Backend API');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Hệ thống Trợ giảng Thông minh & Đánh giá Lập trình
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Chào mừng đến với <span className="text-indigo-600">AITA System</span>
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          Nền tảng tự động hóa chấm thi thực hành (PE), thực thi code cô lập trong Docker Sandbox và đánh giá chất lượng mã nguồn chuyên sâu bằng AI (Đại học FPT - Môn SWD392).
        </p>
      </section>

      {/* System Health Check Section */}
      <section id="system-health" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Trạng thái Kết nối Hệ thống (System Health)</h2>
              <p className="text-xs text-slate-500">Giám sát kết nối Backend Express.js, MySQL và Redis Queue</p>
            </div>
          </div>
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Backend API */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Backend API (Express)</span>
              {!loading && !error ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <XCircle className="h-5 w-5 text-rose-500" />
              )}
            </div>
            <p className="mt-2 text-xs text-slate-500">Port: 5000 | http://localhost:5000</p>
            <div className="mt-3 inline-block rounded px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800">
              {loading ? 'Đang kiểm tra...' : error ? 'Mất kết nối' : health?.services?.server || 'ONLINE'}
            </div>
          </div>

          {/* MySQL Database */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">MySQL Database</span>
              <Database className="h-5 w-5 text-indigo-500" />
            </div>
            <p className="mt-2 text-xs text-slate-500">Port: 3306 | aita_db (Docker)</p>
            <div className="mt-3 inline-block rounded px-2 py-0.5 text-xs font-medium bg-slate-200 text-slate-700">
              {loading ? 'Đang kiểm tra...' : health?.services?.database || 'Khởi động qua Docker'}
            </div>
          </div>

          {/* Redis Queue */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Redis Queue (BullMQ)</span>
              <Layers className="h-5 w-5 text-amber-500" />
            </div>
            <p className="mt-2 text-xs text-slate-500">Port: 6379 | Hàng đợi chấm bài</p>
            <div className="mt-3 inline-block rounded px-2 py-0.5 text-xs font-medium bg-slate-200 text-slate-700">
              {loading ? 'Đang kiểm tra...' : health?.services?.redis || 'Khởi động qua Docker'}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">
            <strong>Ghi chú:</strong> {error}. Hãy chắc chắn Backend Express (`npm run dev` trong thư mục `Code/backend`) đang chạy!
          </div>
        )}
      </section>

      {/* Features Showcase */}
      <section id="features" className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 text-center">Các Phân Hệ Nòng Cốt (Core Modules)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
              <Terminal className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Docker Sandbox Engine</h3>
            <p className="mt-2 text-sm text-slate-600">
              Môi trường container cô lập hoàn toàn, hỗ trợ biên dịch và chạy test cases cho bài thi C (PRF192) và Java OOP/CSD (PRO192 & CSD201).
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 mb-4">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">AI Semantic Grader & Tutor</h3>
            <p className="mt-2 text-sm text-slate-600">
              Đánh giá chất lượng code theo các RubricRule, cơ chế xoay vòng AiApiKey chống rate-limit và chatbot gia sư AI giải thích lỗi 24/7.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
              <GitBranch className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Git Analytics (Anti-Free-Riding)</h3>
            <p className="mt-2 text-sm text-slate-600">
              Tự động phân tích lịch sử commit và thay đổi dòng code từ GitHub để đo lường chính xác mức độ đóng góp của từng thành viên trong bài tập nhóm.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
