'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Bot,
  Brain,
  CheckCircle2,
  Clock,
  Code2,
  FileCode,
  LoaderCircle,
  Send,
  Sparkles,
  User,
  X,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { studentService, getStudentServiceErrorMessage } from '../../services/student.service';
import type { TutorMessage } from '../../types/student.types';

export interface AiTutorContextSubmission {
  id: string;
  assignmentTitle: string;
  courseCode?: string;
  paperCode?: string | null;
  attemptNo?: number;
  finalScore?: number;
  sandboxScore?: number;
  aiScore?: number;
  status?: string;
}

interface AiTutorChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  submission: AiTutorContextSubmission | null;
}

const QUICK_PROMPTS = [
  'Gợi ý cách tối ưu độ phức tạp (Time & Space Complexity) cho đề này',
  'Phân tích nguyên nhân thường gặp gây Time Limit Exceeded (TLE) hoặc Segfault',
  'Gợi ý phương pháp tiếp cận giải thuật bài này theo phong cách Socratic',
  'Nhận xét các tiêu chí Clean Code và cách refactor bài làm',
];

export function AiTutorChatDrawer({ isOpen, onClose, submission }: AiTutorChatDrawerProps) {
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Initialize conversation when drawer opens for a specific submission
  useEffect(() => {
    if (!isOpen || !submission) {
      setMessages([]);
      conversationIdRef.current = null;
      setInitError(null);
      return;
    }

    let isMounted = true;
    setIsInitializing(true);
    setInitError(null);

    const initConversation = async () => {
      try {
        const title = `Hỗ trợ giải thuật: ${submission.assignmentTitle} (${submission.courseCode || 'PE'})`;
        const convo = await studentService.startTutorConversation(submission.id, title);
        if (!isMounted) return;

        conversationIdRef.current = convo.id;

        if (convo.messages && convo.messages.length > 0) {
          setMessages(convo.messages);
        } else {
          // Fallback initial welcome
          setMessages([
            {
              id: 'welcome',
              role: 'ASSISTANT',
              content: `Xin chào! Tôi là Trợ giảng Socratic AI. Tôi đã đọc bài thi **${submission.assignmentTitle}** (Mã môn: **${submission.courseCode || 'PE'}**${submission.paperCode ? ` • Đề ${submission.paperCode}` : ''}) của bạn.\n\nTôi sẵn sàng gợi ý tư duy, giải thích thuật toán và hỗ trợ debug mà **không cung cấp sẵn lời giải**. Bạn đang gặp khó khăn ở phần nào?`,
            },
          ]);
        }
      } catch (err) {
        if (!isMounted) return;
        setInitError(getStudentServiceErrorMessage(err, 'Không thể khởi tạo phiên trò chuyện với AI Tutor.'));
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    };

    initConversation();

    return () => {
      isMounted = false;
    };
  }, [isOpen, submission]);

  // Handle sending a message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading || !submission) return;

    const userMsg: TutorMessage = {
      id: `user-${Date.now()}`,
      role: 'USER',
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      let currentConvoId = conversationIdRef.current;
      if (!currentConvoId) {
        const convo = await studentService.startTutorConversation(
          submission.id,
          `Hỗ trợ: ${submission.assignmentTitle}`
        );
        currentConvoId = convo.id;
        conversationIdRef.current = convo.id;
      }

      const response = await studentService.sendTutorMessage(currentConvoId, text);
      const assistantMsg: TutorMessage = {
        id: response.id || `ai-${Date.now()}`,
        role: 'ASSISTANT',
        content: response.content,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorReply: TutorMessage = {
        id: `err-${Date.now()}`,
        role: 'ASSISTANT',
        content: getStudentServiceErrorMessage(
          err,
          'Rất tiếc, AI tạm thời chưa thể phản hồi. Vui lòng thử lại sau giây lát.'
        ),
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !submission) return null;

  const finalScore = Number(submission.finalScore ?? 0);
  const isPassed = finalScore >= 5.0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Đóng bảng trò chuyện với AI"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onClose();
        }}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      />

      {/* Drawer Panel */}
      <aside
        aria-label="Khung trò chuyện với Trợ giảng AI"
        className="relative z-10 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl border-l border-slate-200 duration-300 animate-in slide-in-from-right sm:max-w-xl"
      >
        {/* Drawer Header */}
        <header className="flex flex-col border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/30">
                <Brain className="size-5 text-blue-100" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight text-white">Trợ giảng Socratic AI</h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-2xs font-semibold text-emerald-300">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Ngữ cảnh bài nộp
                  </span>
                </div>
                <p className="text-xs text-slate-300 truncate max-w-[280px] sm:max-w-[360px]">
                  {submission.assignmentTitle}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng cửa sổ chat"
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Context Strip */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-800/80 px-3.5 py-2 text-xs border border-slate-700/60">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-500/20 px-2 py-0.5 font-mono text-2xs font-bold text-blue-300">
                {submission.courseCode || 'PE'}
              </span>
              {submission.paperCode && (
                <span className="rounded-md border border-slate-600 bg-slate-700/40 px-1.5 py-0.5 text-2xs font-semibold text-slate-300">
                  Đề: {submission.paperCode}
                </span>
              )}
              {submission.attemptNo && (
                <span className="text-slate-400 text-2xs">
                  Attempt #{submission.attemptNo}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5 text-slate-300 text-2xs">
              <span>Sandbox: <strong className="text-slate-100">{submission.sandboxScore ?? 0}đ</strong></span>
              <span>•</span>
              <span>AI: <strong className="text-blue-300">{submission.aiScore ?? 0}đ</strong></span>
              <span>•</span>
              <span className={`font-bold ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                Tổng: {finalScore.toFixed(1)}đ
              </span>
            </div>
          </div>
        </header>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto bg-slate-50/60 p-4 space-y-3.5 sm:p-5">
          {isInitializing ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2.5 text-slate-500">
              <LoaderCircle className="size-6 animate-spin text-blue-600" />
              <p className="text-xs">Đang nạp ngữ cảnh bài thi và code đã nộp...</p>
            </div>
          ) : initError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="size-4 shrink-0 text-rose-600" />
                <span>Không thể kết nối với Trợ giảng AI</span>
              </div>
              <p>{initError}</p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'ASSISTANT' && (
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 mt-0.5 shadow-2xs">
                      <Bot className="size-4" />
                    </span>
                  )}

                  <div
                    className={`rounded-2xl px-4 py-3 max-w-[85%] text-xs leading-relaxed ${
                      msg.role === 'USER'
                        ? 'bg-blue-600 text-white rounded-br-xs shadow-sm font-medium'
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs shadow-2xs whitespace-pre-wrap'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {msg.role === 'USER' && (
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-700 mt-0.5 shadow-2xs">
                      <User className="size-4" />
                    </span>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2.5 text-slate-500 text-xs py-2 pl-2">
                  <LoaderCircle className="size-4 animate-spin text-blue-600" />
                  <span>Socratic AI đang phân tích bài nộp và suy luận gợi ý...</span>
                </div>
              )}
            </>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Suggestions */}
        {messages.length <= 2 && !isInitializing && !initError && (
          <div className="border-t border-slate-100 bg-white px-4 py-2.5">
            <p className="mb-1.5 flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-slate-400">
              <Sparkles className="size-3 text-amber-500" />
              Gợi ý câu hỏi trọng tâm cho bài thi này:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isLoading}
                  className="rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-2xs font-medium text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50/70 hover:text-blue-700 text-left disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input Footer */}
        <footer className="border-t border-slate-200 bg-white p-3 sm:p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Nhập thắc mắc về giải thuật hoặc testcase bài này..."
              aria-label="Nội dung câu hỏi cho AI Socratic"
              disabled={isLoading || isInitializing}
              className="flex-1 max-h-28 min-h-[42px] resize-none rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs text-slate-900 shadow-inner outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            />
            <Button
              type="submit"
              disabled={isLoading || isInitializing || !inputValue.trim()}
              aria-label="Gửi tin nhắn"
              className="min-h-[42px] px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shrink-0 shadow-sm disabled:opacity-40"
            >
              <Send className="size-4" />
            </Button>
          </form>
          <div className="mt-1.5 flex items-center justify-between text-2xs text-slate-400">
            <span>Nhấn Enter để gửi, Shift+Enter để xuống dòng</span>
            <span className="flex items-center gap-1">
              <HelpCircle className="size-3" />
              Socratic AI gợi ý tư duy • Không giải hộ
            </span>
          </div>
        </footer>
      </aside>
    </div>
  );
}
