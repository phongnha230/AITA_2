import { Modal } from '../ui/Modal';
import type { QueueJob } from '../../types/admin.types';

const buildLog = (job: QueueJob): string[] => {
  const docker = job.queue === 'docker-eval-queue';
  const lines = [
    `[queue] job ${job.id} accepted by ${job.queue}`,
    docker ? `[sandbox] spawning container (${job.detail}) — network=none, seccomp=student-strict` : `[ai] routing rubric request via key pool (round-robin)`,
  ];
  if (job.state === 'Queued') return [...lines, '[queue] waiting for free worker slot...'];
  lines.push(docker ? `[sandbox] compile OK • running testcases (${job.progressLabel})` : `[ai] ${job.progressLabel}`);
  if (job.state === 'Failed') lines.push(`[sandbox] ERROR: ${job.detail}`, `[queue] attempt failed after ${job.duration} — moved to dead-letter queue`);
  if (job.state === 'Completed') lines.push(`[queue] completed in ${job.duration}, result written to gradebook`);
  if (job.state === 'Processing') lines.push(`[queue] running… ${job.percent}% (${job.duration})`);
  return lines;
};

export const JobTerminalModal: React.FC<{ job: QueueJob | null; onClose: () => void }> = ({ job, onClose }) => (
  <Modal open={Boolean(job)} title={job ? `Terminal — ${job.id}` : ''} onClose={onClose}>
    {job && (
      <div className="space-y-3">
        <p className="text-xs text-slate-500">{job.student} • {job.course}</p>
        <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-slate-900 p-4 font-mono text-xs leading-relaxed text-slate-100">
          {buildLog(job).join('\n')}
        </pre>
      </div>
    )}
  </Modal>
);
