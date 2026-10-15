import { describe, expect, it } from 'vitest';
import { FeedbackLeakageService } from '../../src/modules/ai/application/services/feedback-leakage.service.js';

describe('FeedbackLeakageService', () => {
  const service = new FeedbackLeakageService();
  const reference = 'int calculate sum int values int count for int index zero index count index plus plus return sum';

  it('detects a run of twelve tokens copied from the reference solution', () => {
    expect(service.detectsLeakage(reference, reference)).toBe(true);
  });

  it('detects code blocks longer than ten lines', () => {
    const lines = Array.from({ length: 11 }, (_, index) => `line ${index}`).join('\n');
    expect(service.detectsLeakage(`\`\`\`c\n${lines}\n\`\`\``, 'short reference')).toBe(true);
  });

  it('allows short conceptual feedback', () => {
    expect(service.detectsLeakage('Kiểm tra lại điều kiện dừng của vòng lặp.', reference)).toBe(false);
  });
});
