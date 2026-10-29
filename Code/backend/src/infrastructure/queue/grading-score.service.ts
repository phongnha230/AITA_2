export interface GradingScoreLimits {
  functionalMaxScore: number;
  algorithmMaxScore: number;
  cleanCodeMaxScore: number;
  gradingVersion: number;
  compileSuccess?: boolean;
}

export interface GradingScoreInputs {
  sandboxScore: number;
  aiScore: number;
  algorithmScore: number;
  cleanCodeScore: number;
}

const clampScore = (value: number, maximum: number): number =>
  Math.min(Math.max(Number.isFinite(value) ? value : 0, 0), Math.max(maximum, 0));

export const aggregateGradingScores = (
  inputs: GradingScoreInputs,
  limits: GradingScoreLimits
): {
  sandboxScore: number;
  aiScore: number;
  algorithmScore: number;
  cleanCodeScore: number;
  finalScore: number;
} => {
  // Nếu biên dịch thất bại (Compile Error), toàn bộ điểm = 0 tuyệt đối
  if (limits.compileSuccess === false) {
    return {
      sandboxScore: 0,
      aiScore: 0,
      algorithmScore: 0,
      cleanCodeScore: 0,
      finalScore: 0,
    };
  }

  const sandboxScore = clampScore(inputs.sandboxScore, limits.functionalMaxScore);
  const algorithmScore = clampScore(inputs.algorithmScore, limits.algorithmMaxScore);
  const cleanCodeScore = clampScore(inputs.cleanCodeScore, limits.cleanCodeMaxScore);
  const isPureTestcaseExam = limits.algorithmMaxScore === 0 && limits.cleanCodeMaxScore === 0;
  const aiScore = isPureTestcaseExam
    ? 0
    : limits.gradingVersion >= 2
    ? algorithmScore + cleanCodeScore
    : clampScore(inputs.aiScore, limits.algorithmMaxScore + limits.cleanCodeMaxScore);
  return {
    sandboxScore,
    aiScore,
    algorithmScore: isPureTestcaseExam ? 0 : algorithmScore,
    cleanCodeScore: isPureTestcaseExam ? 0 : cleanCodeScore,
    finalScore: isPureTestcaseExam ? sandboxScore : clampScore(sandboxScore + aiScore, 10),
  };
};
