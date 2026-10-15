import React from 'react';
import { Check } from 'lucide-react';

interface WizardStepperProps {
  activeStep: 1 | 2 | 3 | 4;
  setActiveStep: (step: 1 | 2 | 3 | 4) => void;
}

const steps = [
  { number: 1, title: 'Thông tin & Ca thi', desc: 'Môn học, Sandbox, Thời lượng' },
  { number: 2, title: 'PDF & Starter ZIP', desc: 'Đề thi & Mã nguồn khởi tạo' },
  { number: 3, title: 'Solution & Testcases', desc: 'Bài giải chuẩn & Import test' },
  { number: 4, title: 'Kiểm thử & Lưu CSDL', desc: 'Dry Run Sandbox & Xuất bản' },
] as const;

export const WizardStepper: React.FC<WizardStepperProps> = ({ activeStep, setActiveStep }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {steps.map((step) => {
          const isCurrent = activeStep === step.number;
          const isPassed = activeStep > step.number;

          return (
            <button
              key={step.number}
              type="button"
              onClick={() => setActiveStep(step.number as 1 | 2 | 3 | 4)}
              className={`flex items-center gap-3 p-3 rounded-xl text-left transition ${
                isCurrent
                  ? 'bg-indigo-50/80 border border-indigo-200 shadow-sm'
                  : isPassed
                  ? 'hover:bg-slate-50 text-slate-700'
                  : 'hover:bg-slate-50 text-slate-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : isPassed
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {isPassed ? <Check className="w-4 h-4" /> : step.number}
              </div>
              <div className="overflow-hidden">
                <div
                  className={`font-bold text-xs truncate ${
                    isCurrent ? 'text-indigo-950' : isPassed ? 'text-slate-800' : 'text-slate-500'
                  }`}
                >
                  {step.title}
                </div>
                <div className="text-[11px] text-slate-400 truncate hidden sm:block">
                  {step.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
