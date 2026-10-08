'use client';

import { useEffect, useRef, useCallback } from 'react';
import { RotateCw } from 'lucide-react';

interface CaptchaBoxProps {
  onCodeChange: (code: string) => void;
}

const CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function generateRandomCode(length = 5): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return result;
}

export default function CaptchaBox({ onCodeChange }: CaptchaBoxProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const drawCaptcha = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const code = generateRandomCode(5);
    onCodeChange(code);

    const width = canvas.width;
    const height = canvas.height;

    // Background
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, width, height);

    // Random noise lines
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(Math.random() * 100 + 100)}, 220, 0.4)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height
      );
      ctx.stroke();
    }

    // Random dots
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(100, 116, 139, ${Math.random() * 0.4})`;
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw characters with subtle rotation & style
    const colors = ['#4f46e5', '#1e293b', '#0f766e', '#7c3aed', '#0369a1'];
    const charSpacing = width / (code.length + 1);

    ctx.font = 'bold 22px monospace';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const x = (i + 0.8) * charSpacing;
      const y = height / 2 + (Math.random() * 6 - 3);
      const angle = (Math.random() * 30 - 15) * (Math.PI / 180);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillText(char, -7, 0);
      ctx.restore();
    }
  }, [onCodeChange]);

  useEffect(() => {
    drawCaptcha();
  }, [drawCaptcha]);

  return (
    <div className="flex items-center gap-2">
      <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-inner">
        <canvas
          ref={canvasRef}
          width={130}
          height={42}
          className="block cursor-pointer select-none"
          title="Bấm để đổi mã khác"
          onClick={drawCaptcha}
        />
      </div>
      <button
        type="button"
        onClick={drawCaptcha}
        aria-label="Đổi mã xác nhận"
        title="Đổi mã xác nhận"
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none"
      >
        <RotateCw size={16} />
      </button>
    </div>
  );
}
