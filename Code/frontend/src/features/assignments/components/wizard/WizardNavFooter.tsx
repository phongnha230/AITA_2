import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface WizardNavFooterProps {
  onBack: () => void;
  backLabel?: string;
  onNext: () => void;
  nextLabel: string;
}

export const WizardNavFooter: React.FC<WizardNavFooterProps> = ({
  onBack,
  backLabel = 'Quay lại',
  onNext,
  nextLabel,
}) => {
  return (
    <div className="pt-2 flex items-center justify-between">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
      >
        <ArrowLeft className="size-4" />
        <span>{backLabel}</span>
      </button>
      <button
        type="button"
        onClick={onNext}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition"
      >
        <span>{nextLabel}</span>
        <ArrowRight className="size-4" />
      </button>
    </div>
  );
};
