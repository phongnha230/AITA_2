import { Download, SquareTerminal } from 'lucide-react';
import { cn } from '../../../../lib/cn';
import { DOCKER_LOGS, type DockerLogLine } from '../../mocks/ops.mock';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

const TAG_CLASS: Record<DockerLogLine['tag'], string> = {
  CREATE: 'bg-blue-50 text-blue-700',
  SIGKILL: 'bg-rose-50 text-rose-700',
  RECLAIM: 'bg-emerald-50 text-emerald-700',
  SUCCESS: 'bg-emerald-50 text-emerald-700',
};

export const AuditLog: React.FC = () => (
  <Card className="space-y-4">
    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
        <SquareTerminal className="h-5 w-5 text-blue-600" /> Live Docker daemon audit log (thời gian thực)
        <Badge tone="student">Stream connected</Badge>
      </h2>
      <button type="button" className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline">
        <Download className="h-4 w-4" /> Xuất file raw log (.jsonl)
      </button>
    </div>
    <ul className="space-y-2 rounded-xl bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-700">
      {DOCKER_LOGS.map((l) => (
        <li key={l.time} className="flex flex-col gap-1 sm:flex-row sm:gap-3">
          <span className="shrink-0 text-slate-500">{l.time}</span>
          <span className={cn('h-fit w-fit shrink-0 rounded px-2 py-0.5 text-[10px] font-bold', TAG_CLASS[l.tag])}>{l.tag}</span>
          <span className="min-w-0 break-words">{l.text}</span>
        </li>
      ))}
    </ul>
  </Card>
);
