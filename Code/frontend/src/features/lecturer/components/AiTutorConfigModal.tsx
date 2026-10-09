'use client';

import { useState } from 'react';
import {
  Bot,
  BrainCircuit,
  CheckCircle2,
  FileCode,
  Info,
  KeyRound,
  RotateCcw,
  Save,
  Sliders,
  Sparkles,
  X,
} from 'lucide-react';

interface AiTutorConfigModalProps {
  open: boolean;
  onClose: () => void;
}

const DEFAULT_SOCRATIC_PROMPT = `Bạn là Trợ giảng Socratic AI của hệ thống AITA (FPT University).
Nhiệm vụ của bạn là hỗ trợ sinh viên tự phát hiện lỗi và tối ưu hóa giải thuật mà TUYỆT ĐỐI KHÔNG VIẾT HỘ CODE HOÀN CHỈNH.
1. Luôn dùng câu hỏi gợi mở để kích thích tư duy giải quyết vấn đề.
2. Tham chiếu các testcase bị lỗi hoặc rubric tiêu chí chấm điểm để định hướng sinh viên.
3. Giải thích ngắn gọn nguyên lý, khuyến khích sinh viên tự sửa và nộp lại bài.`;

export function AiTutorConfigModal({ open, onClose }: AiTutorConfigModalProps) {
  const [socraticMode, setSocraticMode] = useState<'STRICT' | 'BALANCED' | 'LENIENT'>('BALANCED');
  const [customPrompt, setCustomPrompt] = useState(DEFAULT_SOCRATIC_PROMPT);
  const [temperature, setTemperature] = useState(0.3);
  const [enableRag, setEnableRag] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!open) return null;

  const handleSave = () => {
    // Lưu cấu hình vào localStorage của giảng viên cho phiên làm việc
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'aita_lecturer_ai_config',
        JSON.stringify({
          socraticMode,
          customPrompt,
          temperature,
          enableRag,
          updatedAt: new Date().toISOString(),
        })
      );
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    setSocraticMode('BALANCED');
    setCustomPrompt(DEFAULT_SOCRATIC_PROMPT);
    setTemperature(0.3);
    setEnableRag(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-tutor-config-title"
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200/90 transition-all duration-200 animate-in fade-in zoom-in-95"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 id="ai-tutor-config-title" className="text-base font-bold text-slate-900 sm:text-lg flex items-center gap-2">
                Cấu hình Trợ giảng Socratic AI
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                  Gemini 1.5 Flash
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Tùy biến quy tắc gợi ý sư phạm và độ khắt khe khi AI phản hồi sinh viên
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {savedSuccess && (
            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/90 p-3.5 text-xs text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span className="font-semibold">Đã lưu cấu hình AI Tutor thành công! Sẽ áp dụng cho các phiên chat sắp tới.</span>
            </div>
          )}

          {/* Mode selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Chế độ sư phạm (Pedagogical Socratic Policy)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: 'STRICT',
                  title: 'Nghiêm ngặt',
                  desc: 'Chỉ hỏi câu gợi mở, cấm tuyệt đối sinh mã mẫu',
                },
                {
                  id: 'BALANCED',
                  title: 'Cân bằng (Mặc định)',
                  desc: 'Gợi mở lý thuyết + chỉ định vị trí lỗi cụ thể',
                },
                {
                  id: 'LENIENT',
                  title: 'Hỗ trợ nâng cao',
                  desc: 'Cho phép sinh pseudo-code khung giải thuật',
                },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSocraticMode(item.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    socraticMode === item.id
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900">{item.title}</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Instruction */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileCode className="h-3.5 w-3.5 text-indigo-600" />
                System Prompt Chỉ thị cho AI
              </label>
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition"
              >
                <RotateCcw className="h-3 w-3" />
                Khôi phục mặc định
              </button>
            </div>
            <textarea
              rows={5}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Nhập prompt điều hướng AI..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 font-mono text-xs text-slate-800 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Advanced Sliders */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-indigo-600" />
                  Độ ngẫu nhiên (Temperature): <span className="font-mono text-indigo-600">{temperature}</span>
                </label>
                <p className="text-[11px] text-slate-500">Giá trị thấp giúp AI trả lời chính xác, bám sát rubric hơn.</p>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-32 accent-indigo-600"
              />
            </div>

            <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <BrainCircuit className="h-3.5 w-3.5 text-indigo-600" />
                  Tích hợp RAG (Rubrics &amp; Test Cases)
                </p>
                <p className="text-[11px] text-slate-500">Tự động nạp tiêu chí chấm và testcase ẩn vào ngữ cảnh AI.</p>
              </div>
              <input
                type="checkbox"
                checked={enableRag}
                onChange={(e) => setEnableRag(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
              />
            </div>
          </div>

          {/* System status note */}
          <div className="flex items-start gap-2.5 rounded-xl bg-blue-50/70 border border-blue-100 p-3.5 text-[11px] text-blue-900">
            <Info className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
            <p>
              Backend AITA tự động điều phối xoay vòng API Keys (API Key Rotator) để đảm bảo không bị chạm giới hạn quota khi nhiều sinh viên cùng hỏi AI Tutor trong giờ thi.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-100 shrink-0 bg-slate-50/50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-white transition"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98]"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Áp dụng cấu hình</span>
          </button>
        </div>
      </div>
    </div>
  );
}
