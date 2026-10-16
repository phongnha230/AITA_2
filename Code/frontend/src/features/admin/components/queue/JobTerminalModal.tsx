import { Modal } from '../ui/Modal';
import type { QueueJob } from '../../types/admin.types';

export const JobTerminalModal: React.FC<{ job: QueueJob | null; onClose: () => void }> = ({ job, onClose }) => (
  <Modal open={Boolean(job)} title={job ? `Chi tiết job — ${job.id}` : ''} onClose={onClose}>
    {job ? (
      <dl className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-sm">
        <div><dt className="text-slate-500">Job</dt><dd className="font-semibold text-slate-900">{job.name}</dd></div>
        <div><dt className="text-slate-500">Trạng thái</dt><dd className="font-semibold text-slate-900">{job.state}</dd></div>
        <div><dt className="text-slate-500">Sinh viên</dt><dd className="font-semibold text-slate-900">{job.student}</dd></div>
        <div><dt className="text-slate-500">Môn</dt><dd className="font-semibold text-slate-900">{job.course}</dd></div>
        <div><dt className="text-slate-500">Hàng đợi</dt><dd className="font-semibold text-slate-900">{job.queue}</dd></div>
        <div><dt className="text-slate-500">Thời gian xử lý</dt><dd className="font-semibold text-slate-900">{job.duration}</dd></div>
        <div className="col-span-2"><dt className="text-slate-500">Chi tiết trạng thái</dt><dd className="font-semibold text-slate-900">{job.detail || job.progressLabel}</dd></div>
      </dl>
    ) : null}
  </Modal>
);
