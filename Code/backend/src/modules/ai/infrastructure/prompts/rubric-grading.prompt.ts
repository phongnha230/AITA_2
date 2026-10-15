import { RagContext } from '../../application/services/rag-knowledge.service.interface.js';
import { ValidationError } from '../../../../shared/domain/exceptions/app.error.js';
import { CGradingPrompt } from './c-grading.prompt.js';
import { JavaGradingPrompt } from './java-grading.prompt.js';
import { GradingPromptStrategy } from './grading-prompt.strategy.js';
import { ReactGradingPrompt } from './react-grading.prompt.js';

export class RubricGradingPrompt {
  private static getStrategy(environment: string): GradingPromptStrategy {
    switch (environment) {
      case 'C_GCC':
        return new CGradingPrompt();
      case 'JAVA_JDK':
        return new JavaGradingPrompt();
      case 'REACT_JS':
        return new ReactGradingPrompt();
      default:
        throw new ValidationError(`AI grading chưa hỗ trợ ngôn ngữ ${environment}.`);
    }
  }

  public static buildSystemInstruction(environment: string, strictLeakageMode = false, courseCode?: string | null): string {
    const strategy = this.getStrategy(environment);
    if (strategy instanceof JavaGradingPrompt) {
      return strategy.buildSystemInstruction(strictLeakageMode, courseCode);
    }
    return strategy.buildSystemInstruction(strictLeakageMode);
  }

  public static buildUserPrompt(studentCode: string, context: RagContext): string {
    return this.getStrategy(context.environment).buildUserPrompt(studentCode, context);
  }
}
