'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Brain,
  Code2,
  CornerDownLeft,
  LoaderCircle,
  MessageSquare,
  Minus,
  Send,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { studentService, getStudentServiceErrorMessage } from '../../services/student.service';

interface MessageItem {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
}

const QUICK_PROMPTS = [
  'Gợi ý cách tiếp cận bài toán bằng Đệ quy hoặc Quy hoạch động',
  'Làm sao để tránh Time Limit Exceeded (TLE)?',
  'Giải thích nguyên nhân bị Segmentation Fault trong C',
];

export function AiTutorFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome',
      role: 'ASSISTANT',
      content:
        'Xin chào! Tôi là Trợ giảng Socratic AI. Tôi có thể gợi ý hướng tư duy, phân tích giải thuật và giúp bạn debug code mà không đưa sẵn lời giải trực tiếp. Bạn cần hỗ trợ vấn đề gì?',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessageRef = useRef<((textToSend?: string, overrideSubId?: string) => Promise<void>) | null>(null);

  // Lắng nghe sự kiện mở AI Tutor từ các trang khác (ví dụ: trang kết quả bài thi)
  useEffect(() => {
    const handleOpenTutor = (e: any) => {
      const detail = e.detail || {};
      setIsOpen(true);
      if (detail.submissionId && detail.submissionId !== activeSubmissionId) {
        setActiveSubmissionId(detail.submissionId);
        setConversationId(null); // Reset để tạo/kết nối phiên mới theo submissionId
      }
      if (detail.prompt) {
        setTimeout(() => {
          handleSendMessageRef.current?.(detail.prompt, detail.submissionId);
        }, 150);
      }
    };

    window.addEventListener('open-ai-tutor', handleOpenTutor);
    return () => window.removeEventListener('open-ai-tutor', handleOpenTutor);
  }, [activeSubmissionId]);

  const handleSendMessage = async (textToSend?: string, overrideSubId?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: MessageItem = {
      id: Date.now().toString(),
      role: 'USER',
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const subId = overrideSubId || activeSubmissionId || undefined;
      let currentConvoId = conversationId;
      if (!currentConvoId) {
        const convo = await studentService.startTutorConversation(
          subId,
          subId ? `Hỗ trợ gỡ lỗi bài nộp ${subId.slice(0, 8)}` : 'Tư vấn giải thuật Socratic'
        );
        currentConvoId = convo.id;
        setConversationId(convo.id);
      }

      const response = await studentService.sendTutorMessage(currentConvoId, text);
      const assistantMsg: MessageItem = {
        id: response.id || (Date.now() + 1).toString(),
        role: 'ASSISTANT',
        content: response.content,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorReply: MessageItem = {
        id: (Date.now() + 2).toString(),
        role: 'ASSISTANT',
        content:
          getStudentServiceErrorMessage(err, 'Rất tiếc, AI tạm thời chưa thể phản hồi. Vui lòng đảm bảo Gemini API Key đã sẵn sàng.'),
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsLoading(false);
    }
  };

  handleSendMessageRef.current = handleSendMessage;

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-indigo-600 px-4 py-3 text-white shadow-xl shadow-indigo-600/30 transition-all hover:bg-indigo-700 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
        >
          <Sparkles className="h-5 w-5 animate-pulse text-amber-300" />
          <span className="text-xs font-bold tracking-wide">Trợ giảng Socratic AI</span>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[540px] w-[360px] sm:w-[400px] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
                <Brain size={18} />
              </span>
              <div>
                <p className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  Socratic AI Tutor
                  <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-300">
                    Online
                  </span>
                </p>
                <p className="text-[10px] text-slate-400">Gợi ý tư duy • Không giải bài hộ</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'ASSISTANT' && (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 mt-0.5">
                    <Bot size={13} />
                  </span>
                )}
                <div
                  className={`rounded-2xl px-3.5 py-2.5 max-w-[82%] leading-relaxed ${
                    msg.role === 'USER'
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-xs shadow-2xs whitespace-pre-wrap'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
                <LoaderCircle size={14} className="animate-spin text-indigo-600" />
                <span>AI đang suy luận gợi ý...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts (if only welcome message) */}
          {messages.length <= 1 && (
            <div className="p-3 border-t border-slate-100 bg-white space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gợi ý câu hỏi nhanh:</p>
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  className="block w-full text-left rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200/60 hover:border-indigo-200 px-2.5 py-1.5 text-[11px] text-slate-700 hover:text-indigo-700 transition-colors truncate"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <div className="border-t border-slate-100 bg-white p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Nhập câu hỏi hoặc mô tả lỗi..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                className="flex-1 h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-600"
              />
              <Button
                type="submit"
                size="sm"
                disabled={isLoading || !inputValue.trim()}
                className="h-9 w-9 p-0 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
              >
                <Send size={14} />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
