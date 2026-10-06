'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, Pause, Play, SquareTerminal } from 'lucide-react';
import { cn } from '../../../../lib/cn';
import { downloadFile } from '../../../../lib/download';
import { DOCKER_LOGS, type DockerLogLine } from '../../mocks/ops.mock';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { useToast } from '../ui/Toast';

const TAG_CLASS: Record<DockerLogLine['tag'], string> = {
  CREATE: 'bg-blue-50 text-blue-700',
  SIGKILL: 'bg-rose-50 text-rose-700',
  RECLAIM: 'bg-emerald-50 text-emerald-700',
  SUCCESS: 'bg-emerald-50 text-emerald-700',
};

const MAX_LINES = 14;
const NODES = ['Node-01', 'Node-02', 'Node-03'];
const CYCLE: DockerLogLine['tag'][] = ['CREATE', 'SUCCESS', 'CREATE', 'SIGKILL', 'RECLAIM'];

const nextLine = (n: number): DockerLogLine => {
  const node = NODES[n % NODES.length];
  const id = 89106 + n;
  const tag = CYCLE[n % CYCLE.length];
  const now = new Date();
  const time = `${now.toLocaleTimeString('en-GB')}.${String(now.getMilliseconds()).padStart(3, '0')}`;
  const text: Record<DockerLogLine['tag'], string> = {
    CREATE: `${node}: Container sandbox-java-subm-${id} khởi tạo với seccomp profile student-strict.json (Cap CPU 1.0, RAM 512MB).`,
    SUCCESS: `${node}: Hoàn thành chấm bài sandbox-java-subm-${id} (thời gian thực thi: ${200 + (n * 37) % 300}ms). Trả kết quả về BullMQ.`,
    SIGKILL: `${node}: Đã ép dừng tiến trình trong container sandbox-py-subm-${id} do vượt giới hạn thời gian chạy (TLE > 2000ms).`,
    RECLAIM: `${node}: Dọn dẹp cgroups, thu hồi ${150 + (n * 13) % 100}MB RAM của sandbox-py-subm-${id - 1} thành công.`,
  };
  return { time, tag, text: text[tag] };
};

/** `pulse` changes whenever the page asks for an immediate refresh. */
export const AuditLog: React.FC<{ pulse: number }> = ({ pulse }) => {
  const toast = useToast();
  const [lines, setLines] = useState<DockerLogLine[]>(DOCKER_LOGS);
  const [streaming, setStreaming] = useState(true);
  const counter = useRef(0);

  const append = () => setLines((l) => [...l, nextLine(counter.current++)].slice(-MAX_LINES));

  useEffect(() => {
    if (!streaming) return;
    const id = setInterval(append, 4000);
    return () => clearInterval(id);
  }, [streaming]);

  useEffect(() => {
    if (pulse > 0) append();
  }, [pulse]);

  const exportLog = () => {
    downloadFile('docker-audit.jsonl', lines.map((l) => JSON.stringify(l)).join('\n'), 'application/x-ndjson');
    toast.success(`Đã xuất ${lines.length} dòng log (.jsonl).`);
  };

  return (
    <Card className="space-y-4">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <h2 className="flex flex-wrap items-center gap-2 text-base font-semibold text-slate-900">
          <SquareTerminal className="h-5 w-5 text-blue-600" /> Live Docker daemon audit log (thời gian thực)
          <Badge tone={streaming ? 'student' : 'neutral'}>{streaming ? 'Stream connected' : 'Stream paused'}</Badge>
        </h2>
        <div className="flex items-center gap-4 text-xs font-semibold text-blue-600">
          <button type="button" onClick={() => setStreaming((s) => !s)} className="inline-flex items-center gap-1.5 hover:underline">
            {streaming ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} {streaming ? 'Tạm dừng' : 'Tiếp tục'}
          </button>
          <button type="button" onClick={exportLog} className="inline-flex items-center gap-1.5 hover:underline">
            <Download className="h-4 w-4" /> Xuất file raw log (.jsonl)
          </button>
        </div>
      </div>
      <ul className="max-h-96 space-y-2 overflow-y-auto rounded-xl bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-700">
        {lines.map((l, i) => (
          <li key={`${l.time}-${i}`} className="flex flex-col gap-1 sm:flex-row sm:gap-3">
            <span className="shrink-0 text-slate-500">{l.time}</span>
            <span className={cn('h-fit w-fit shrink-0 rounded px-2 py-0.5 text-[10px] font-bold', TAG_CLASS[l.tag])}>{l.tag}</span>
            <span className="min-w-0 break-words">{l.text}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
};
