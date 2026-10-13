'use client';

import React from 'react';
import { Megaphone, X } from 'lucide-react';

interface LiveBroadcastModalProps {
  open: boolean;
  onClose: () => void;
  message: string;
  onChangeMessage: (msg: string) => void;
  onSend: () => void;
  selectedRoom: string;
}

export const LiveBroadcastModal: React.FC<LiveBroadcastModalProps> = ({
  open,
  onClose,
  message,
  onChangeMessage,
  onSend,
  selectedRoom,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-indigo-600" />
            <span className="font-extrabold text-sm text-slate-900">
              Phát Thông Báo Tới Toàn Bộ Máy Thi
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ phát thông báo"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3 overflow-y-auto flex-1">
          <p className="text-xs text-slate-500">
            Nội dung sẽ hiển thị dạng thông báo khẩn cấp trên màn hình Kiosk của toàn bộ thí sinh trong phòng {selectedRoom}:
          </p>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => onChangeMessage(e.target.value)}
            placeholder="Ví dụ: Còn 15 phút nữa hết giờ ca thi, các em chú ý kiểm tra lại code và bấm nộp bài!"
            aria-label="Nội dung thông báo khẩn cấp"
            className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />

          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              'Còn 15 phút nữa hết giờ làm bài!',
              'Còn 5 phút cuối, chuẩn bị nộp bài!',
              'Chú ý lưu bài trước khi kết thúc ca thi!',
            ].map((quickText) => (
              <button
                key={quickText}
                type="button"
                onClick={() => onChangeMessage(quickText)}
                className="text-[10px] px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                {quickText}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onSend}
            disabled={!message.trim()}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition shadow-md shadow-blue-500/20 disabled:opacity-50"
          >
            Gửi thông báo ngay
          </button>
        </div>
      </div>
    </div>
  );
};
