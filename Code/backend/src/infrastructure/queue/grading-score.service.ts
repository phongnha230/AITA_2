export interface GradingScoreLimits {
  functionalMaxScore: number;
  algorithmMaxScore: number;
  cleanCodeMaxScore: number;
  gradingVersion: number;
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
  const sandboxScore = clampScore(inputs.sandboxScore, limits.functionalMaxScore);
  const algorithmScore = clampScore(inputs.algorithmScore, limits.algorithmMaxScore);
  const cleanCodeScore = clampScore(inputs.cleanCodeScore, limits.cleanCodeMaxScore);
  const aiScore = limits.gradingVersion >= 2
    ? algorithmScore + cleanCodeScore
    : clampScore(inputs.aiScore, limits.algorithmMaxScore + limits.cleanCodeMaxScore);
  return {
    sandboxScore,
    aiScore,
    algorithmScore,
    cleanCodeScore,
    finalScore: clampScore(sandboxScore + aiScore, 10),
  };
};
