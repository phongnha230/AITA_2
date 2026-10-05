import { cn } from '../../../../lib/cn';
import { DOCKER_NODES } from '../../mocks/ops.mock';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

const TH = 'px-4 py-3 text-left text-xs font-semibold text-slate-500';

export const NodesTable: React.FC = () => (
  <Card className="overflow-hidden p-0">
    <div className="flex flex-col justify-between gap-2 px-6 py-4 sm:flex-row sm:items-center">
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
        Danh sách máy trạm Docker worker nodes <Badge tone="info">{DOCKER_NODES.length} active nodes hiển thị</Badge>
      </h2>
      <p className="flex gap-4 text-[11px] font-medium text-slate-500">
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> Seccomp enforced</span>
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> Rootless daemon</span>
      </p>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse">
        <thead className="bg-slate-50">
          <tr>
            <th className={TH}>Tên node &amp; vị trí</th>
            <th className={TH}>Địa chỉ IP nội bộ</th>
            <th className={TH}>Active containers</th>
            <th className={TH}>CPU tải</th>
            <th className={TH}>RAM tiêu thụ</th>
            <th className={TH}>Chính sách bảo mật</th>
            <th className={cn(TH, 'text-right')}>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {DOCKER_NODES.map((n) => (
            <tr key={n.name} className="border-t border-slate-100 hover:bg-slate-50">
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-600">{n.index}</span>
                  <div><p className="text-sm font-semibold text-slate-900">{n.name} ({n.location})</p><p className="text-[11px] text-slate-500">{n.role}</p></div>
                </div>
              </td>
              <td className="px-4 py-4 font-mono text-xs text-slate-600">{n.ip}</td>
              <td className="px-4 py-4 text-sm font-bold text-slate-900">{n.containers} <span className="text-xs font-normal text-slate-500">/ 50</span></td>
              <td className="w-44 px-4 py-4"><div className="flex items-center gap-2"><ProgressBar value={n.cpu} color="bg-emerald-600" /><span className="text-xs font-semibold text-slate-600">{n.cpu}%</span></div></td>
              <td className="w-44 px-4 py-4"><div className="flex items-center gap-2"><ProgressBar value={(n.ramGb / 16) * 100} /><span className="whitespace-nowrap text-xs font-semibold text-slate-600">{n.ramGb} GB</span></div></td>
              <td className="px-4 py-4"><div className="flex max-w-[260px] flex-wrap gap-1">{n.policies.map((p) => <span key={p} className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">{p}</span>)}</div></td>
              <td className="px-4 py-4 text-right"><Badge tone="student" dot>Healthy</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);
