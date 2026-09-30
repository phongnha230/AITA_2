import { ISandboxRunner } from "./interfaces/sandbox-runner.interface";
import { CDockerRunner } from "./runners/c-docker.runner";
import { JavaDockerRunner } from "./runners/java-docker.runner";

export class SandboxRunnerFactory {
  /**
   * Factory Method: Cấp phát Sandbox Runner tương ứng với ngôn ngữ lập trình
   */
  public static createRunner(language: string): ISandboxRunner {
    const lang = (language || "").trim().toUpperCase();

    switch (lang) {
      case "C":
      case "CPP":
      case "PRF192":
        return new CDockerRunner();

      case "JAVA":
      case "PRO192":
      case "CSD201":
        return new JavaDockerRunner();

      default:
        throw new Error(
          `[SandboxRunnerFactory] Chưa hỗ trợ ngôn ngữ lập trình: ${language}`,
        );
    }
  }
}
