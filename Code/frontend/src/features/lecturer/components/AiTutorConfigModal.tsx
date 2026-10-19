'use client';

import { useEffect, useState } from 'react';
import {
  Bot,
  BrainCircuit,
  CheckCircle2,
  FileCode,
  Info,
  RotateCcw,
  Save,
  Sliders,
  X,
} from 'lucide-react';
import { courseService } from '@/features/courses/services/course.service';
import type { Course } from '@/features/courses/types/course.types';
import { getErrorMessage } from '@/lib/errors';
import { aiTutorConfigService, DEFAULT_AI_TUTOR_CONFIG } from '../services/ai-tutor-config.service';

interface AiTutorConfigModalProps {
  open: boolean;
  onClose: () => void;
}

export function AiTutorConfigModal({ open, onClose }: AiTutorConfigModalProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState('');
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [configLoadFailed, setConfigLoadFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [socraticMode, setSocraticMode] = useState<'STRICT' | 'BALANCED' | 'LENIENT'>('BALANCED');
  const [customPrompt, setCustomPrompt] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [enableContext, setEnableContext] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setIsLoadingCourses(true);
    setErrorMessage(null);
    courseService.getCourses()
      .then((loadedCourses) => {
        if (cancelled) return;
        setCourses(loadedCourses);
        if (loadedCourses.length === 1) setCourseId(loadedCourses[0]!.id);
      })
      .catch((error: unknown) => {
        console.error('Failed to load courses for AI Tutor configuration', error);
        if (!cancelled) setErrorMessage(getErrorMessage(error, 'Không tải được danh sách khóa học.'));
      })
      .finally(() => { if (!cancelled) setIsLoadingCourses(false); });
    return () => { cancelled = true; };
  }, [open]);

  useEffect(() => {
    if (!open || !courseId) return;
    let cancelled = false;
    setIsLoadingConfig(true);
    setConfigLoadFailed(false);
    setErrorMessage(null);
    aiTutorConfigService.get(courseId)
      .then((config) => {
        if (cancelled) return;
        setSocraticMode(config.socraticMode);
        setCustomPrompt(config.customPrompt);
        setTemperature(config.temperature);
        setEnableContext(config.enableContext);
        setConfigLoadFailed(false);
      })
      .catch((error: unknown) => {
        console.error('Failed to load AI Tutor course configuration', error);
        if (!cancelled) {
          setConfigLoadFailed(true);
          setErrorMessage(getErrorMessage(error, 'Không tải được cấu hình cho khóa học này.'));
        }
      })
      .finally(() => { if (!cancelled) setIsLoadingConfig(false); });
    return () => { cancelled = true; };
  }, [open, courseId]);

  if (!open) return null;

  const handleSave = async () => {
    if (!courseId) return;
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await aiTutorConfigService.save(courseId, { socraticMode, customPrompt, temperature, enableContext });
      setSavedSuccess(true);
      window.setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Failed to save AI Tutor course configuration', error);
      setErrorMessage(getErrorMessage(error, 'Không lưu được cấu hình AI Tutor.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setErrorMessage(null);
    setSocraticMode('BALANCED');
    setCustomPrompt(DEFAULT_AI_TUTOR_CONFIG.customPrompt);
    setTemperature(DEFAULT_AI_TUTOR_CONFIG.temperature);
    setEnableContext(DEFAULT_AI_TUTOR_CONFIG.enableContext);
  };

  const isConfigDisabled = !courseId || isLoadingConfig || isSaving || configLoadFailed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <dialog
        open
        aria-labelledby="ai-tutor-config-title"
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl transition-colors duration-200 animate-in fade-in zoom-in-95 block m-0 text-slate-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20">
              <Bot className="size-5" />
            </div>
            <div>
              <h3 id="ai-tutor-config-title" className="text-base font-bold text-slate-900 sm:text-lg flex items-center gap-2">
                Cấu hình Trợ giảng Socratic AI
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                  Model do hệ thống quản lý
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
            <X className="size-4" />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {savedSuccess && (
            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/90 p-3.5 text-xs text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
              <span className="font-semibold">Đã lưu cấu hình AI Tutor. Cấu hình có hiệu lực ngay từ lượt nhắn tiếp theo.</span>
            </div>
          )}

          {errorMessage && (
            <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800">
              {errorMessage}
            </div>
          )}

          <div>
            <label htmlFor="ai-tutor-course" className="mb-1.5 block text-xs font-bold text-slate-700">Áp dụng cho khóa học</label>
            <select
              id="ai-tutor-course"
              value={courseId}
              onChange={(event) => { setCourseId(event.target.value); setSavedSuccess(false); }}
              disabled={isLoadingCourses || isSaving}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
            >
              <option value="">{isLoadingCourses ? 'Đang tải khóa học…' : 'Chọn khóa học'}</option>
              {courses.map((course) => <option key={course.id} value={course.id}>{course.code} · {course.name} · {course.semester}</option>)}
            </select>
            {isLoadingConfig && <p className="mt-1 text-xs text-slate-500">Đang tải cấu hình…</p>}
          </div>

          {/* Mode selector */}
          <div>
            <p className="text-xs font-bold text-slate-700 mb-2">
              Chế độ sư phạm (Pedagogical Socratic Policy)
            </p>
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
                  disabled={isConfigDisabled}
                  onClick={() => setSocraticMode(item.id as 'STRICT' | 'BALANCED' | 'LENIENT')}
                  className={`p-3 rounded-xl border text-left transition-colors ${
                    socraticMode === item.id
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Instruction */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="custom-prompt-textarea" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileCode className="size-3.5 text-indigo-600" />
                System Prompt Chỉ thị cho AI
              </label>
              <button
                type="button"
                onClick={handleReset}
                disabled={isConfigDisabled}
                className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition"
              >
                <RotateCcw className="size-3" />
              Khôi phục mặc định (chưa lưu)
              </button>
            </div>
            <textarea
              id="custom-prompt-textarea"
              rows={5}
              maxLength={4000}
              value={customPrompt}
              disabled={isConfigDisabled}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Nhập prompt điều hướng AI..."
              aria-label="System Prompt Chỉ thị cho AI"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 font-mono text-base text-slate-800 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
            <p className="mt-1 text-right text-xs text-slate-400">{customPrompt.length}/4.000 ký tự</p>
          </div>

          {/* Advanced Sliders */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="temperature-slider" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sliders className="size-3.5 text-indigo-600" />
                  Độ ngẫu nhiên (Temperature): <span className="font-mono text-indigo-600">{temperature}</span>
                </label>
                <p className="text-xs text-slate-500">Giá trị thấp giúp câu trả lời ổn định và bám sát rubric hơn.</p>
              </div>
              <input
                id="temperature-slider"
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={temperature}
                disabled={isConfigDisabled}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                aria-label="Độ ngẫu nhiên (Temperature)"
                className="w-32 accent-indigo-600"
              />
            </div>

            <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
              <div>
                <label htmlFor="enable-rag-checkbox" className="text-xs font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer">
                  <BrainCircuit className="size-3.5 text-indigo-600" />
                  Dùng ngữ cảnh đề bài &amp; rubric
                </label>
                <p className="text-xs text-slate-500">AI được xem mô tả đề và rubric. Không gửi lời giải mẫu hoặc dữ liệu testcase ẩn.</p>
              </div>
              <input
                id="enable-rag-checkbox"
                type="checkbox"
                checked={enableContext}
                disabled={isConfigDisabled}
                onChange={(e) => setEnableContext(e.target.checked)}
                aria-label="Dùng ngữ cảnh đề bài và rubric"
                className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>

          {/* System status note */}
          <div className="flex items-start gap-2.5 rounded-xl bg-blue-50/70 border border-blue-100 p-3.5 text-xs text-blue-900">
            <Info className="size-4 shrink-0 text-blue-600 mt-0.5" />
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
            disabled={isConfigDisabled || isLoadingCourses}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98]"
          >
            <Save className="size-3.5" />
            <span>{isSaving ? 'Đang lưu…' : 'Lưu cấu hình'}</span>
          </button>
        </div>
      </dialog>
    </div>
  );
}
