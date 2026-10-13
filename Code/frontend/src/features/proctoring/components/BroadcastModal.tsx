'use client';

import { useState } from 'react';
import { Megaphone, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface BroadcastModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (message: string) => void;
  roomName: string;
}

export function BroadcastModal({ open, onClose, onSend, roomName }: BroadcastModalProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSend(message.trim());
    setMessage('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl border-border bg-card p-6 shadow-2xl">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Phát thông báo đến {roomName}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Thông báo sẽ xuất hiện toàn màn hình trên tất cả máy thi sinh viên.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Vd: Ca thi còn 15 phút. Thí sinh kiểm tra kỹ định dạng tên file trước khi nộp..."
              rows={4}
              required
              className="rounded-xl text-xs bg-white resize-none"
            />
          </div>

          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-xl text-xs"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!message.trim()}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
            >
              <Send className="mr-1.5 h-3.5 w-3.5" />
              Gửi thông báo ngay
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
