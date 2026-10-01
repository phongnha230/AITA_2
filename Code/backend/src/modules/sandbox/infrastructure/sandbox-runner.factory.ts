import { ISandboxRunner } from '../domain/interfaces/sandbox-runner.interface.js';
import { CDockerRunner } from './runners/c-docker.runner.js';
import { JavaDockerRunner } from './runners/java-docker.runner.js';
import { PlaywrightWebRunner } from './runners/playwright-web.runner.js';

export class SandboxRunnerFactory {
  /**
   * Factory Method: Cấp phát Sandbox Runner tương ứng với ngôn ngữ lập trình
   */
  public static createRunner(language: string): ISandboxRunner {
    const lang = (language || '').trim().toUpperCase();

    switch (lang) {
      case 'C':
      case 'CPP':
      case 'C_GCC':
      case 'PRF192':
        return new CDockerRunner();

      case 'JAVA':
      case 'JAVA_JDK':
      case 'PRO192':
      case 'CSD201':
        return new JavaDockerRunner();

      case 'WEB':
      case 'REACT':
      case 'NEXTJS':
      case 'HTML_CSS_JS':
      case 'PLAYWRIGHT':
      case 'VERCEL':
      case 'SWP391':
      case 'FER201':
        return new PlaywrightWebRunner();

      default:
        throw new Error(
          `[SandboxRunnerFactory] Chưa hỗ trợ ngôn ngữ lập trình: ${language}`
        );
    }
  }
}

