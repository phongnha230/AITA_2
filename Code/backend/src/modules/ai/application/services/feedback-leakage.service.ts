const TOKEN_RUN_LENGTH = 12;

function tokenize(value: string): string[] {
  return value.toLowerCase().match(/[a-z_][a-z0-9_]*|\d+|==|!=|<=|>=|&&|\|\||\S/g) ?? [];
}

function buildTokenWindows(tokens: string[], size: number): Set<string> {
  const windows = new Set<string>();
  for (let index = 0; index + size <= tokens.length; index += 1) {
    windows.add(tokens.slice(index, index + size).join('\u0000'));
  }
  return windows;
}

export class FeedbackLeakageService {
  detectsLeakage(feedback: string, referenceSolution: string): boolean {
    const longCodeBlock = [...feedback.matchAll(/```[\s\S]*?```/g)]
      .some((match) => match[0].split(/\r?\n/).length - 2 > 10);
    if (longCodeBlock) return true;

    const referenceTokens = tokenize(referenceSolution);
    const feedbackTokens = tokenize(feedback);
    if (referenceTokens.length < TOKEN_RUN_LENGTH || feedbackTokens.length < TOKEN_RUN_LENGTH) {
      return false;
    }

    const referenceWindows = buildTokenWindows(referenceTokens, TOKEN_RUN_LENGTH);
    for (let index = 0; index + TOKEN_RUN_LENGTH <= feedbackTokens.length; index += 1) {
      const candidate = feedbackTokens.slice(index, index + TOKEN_RUN_LENGTH).join('\u0000');
      if (referenceWindows.has(candidate)) return true;
    }
    return false;
  }
}
