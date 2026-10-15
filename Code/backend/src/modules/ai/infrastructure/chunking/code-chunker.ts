export interface CodeChunk {
  id: string;
  name: string; // Tên hàm hoặc tên class
  code: string; // Nội dung mã nguồn của chunk
  startLine: number;
  endLine: number;
  type: 'FUNCTION' | 'CLASS' | 'BLOCK';
}

export class CodeChunker {
  /**
   * Cắt nhỏ mã nguồn C hoặc Java thành các chunk theo hàm (function/method)
   */
  public static chunkSourceCode(sourceCode: string, language: 'C_GCC' | 'JAVA_JDK' | string): CodeChunk[] {
    if (!sourceCode || sourceCode.trim().length === 0) {
      return [];
    }

    const lines = sourceCode.split('\n');

    if (language === 'JAVA_JDK') {
      return this.chunkJava(lines, sourceCode);
    } else {
      return this.chunkC(lines, sourceCode);
    }
  }

  /**
   * Cắt mã nguồn C (PRF192) theo hàm
   */
  private static chunkC(lines: string[], fullCode: string): CodeChunk[] {
    const chunks: CodeChunk[] = [];
    // Regex nhận diện chữ ký hàm trong C:
    // ví dụ: int sum(int a, int b) { hoặc void swap(int* x, int* y)
    const cFuncPattern = /^\s*([a-zA-Z_][a-zA-Z0-9_* \t]+)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*\)\s*\{?$/;

    let inFunction = false;
    let braceCount = 0;
    let funcName = '';
    let startLine = 0;
    let currentChunkLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Kiểm tra bắt đầu hàm
      if (!inFunction) {
        const match = trimmed.match(cFuncPattern);
        // Loại trừ cấu trúc if/for/while/switch
        if (
          match &&
          !/^(if|for|while|switch|return)\b/.test(match[2]) &&
          !trimmed.endsWith(';')
        ) {
          inFunction = true;
          funcName = match[2];
          startLine = i + 1;
          braceCount = 0;
          currentChunkLines = [];
        }
      }

      if (inFunction) {
        currentChunkLines.push(line);
        // Đếm ngoặc mở và đóng
        for (const char of line) {
          if (char === '{') braceCount++;
          if (char === '}') braceCount--;
        }

        // Khi ngoặc đóng hết về 0 (kết thúc hàm)
        if (braceCount === 0 && currentChunkLines.some((l) => l.includes('{'))) {
          inFunction = false;
          chunks.push({
            id: `c_func_${funcName}_L${startLine}`,
            name: funcName,
            code: currentChunkLines.join('\n').trim(),
            startLine,
            endLine: i + 1,
            type: 'FUNCTION',
          });
          currentChunkLines = [];
        }
      }
    }

    // Nếu không tách được hàm nào (ví dụ code viết thẳng hoặc lỗi cú pháp), chia fallback
    if (chunks.length === 0) {
      return this.createFallbackChunks(lines);
    }

    return chunks;
  }

  /**
   * Cắt mã nguồn Java (PRO192 / CSD201) theo method
   */
  private static chunkJava(lines: string[], fullCode: string): CodeChunk[] {
    const chunks: CodeChunk[] = [];
    // Regex nhận diện method trong Java:
    // ví dụ: public int calculate(int x) { hoặc private Node search(String id) {
    const javaMethodPattern = /^\s*(?:public|private|protected|static|final|native|synchronized|\s)*\s+[a-zA-Z0-9_<>\[\]]+\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*\)\s*(?:throws\s+[\w\s,]+)?\s*\{?$/;

    let inMethod = false;
    let braceCount = 0;
    let methodName = '';
    let startLine = 0;
    let currentChunkLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!inMethod) {
        const match = trimmed.match(javaMethodPattern);
        if (
          match &&
          !/^(if|for|while|switch|catch)\b/.test(match[1]) &&
          !trimmed.endsWith(';')
        ) {
          inMethod = true;
          methodName = match[1];
          startLine = i + 1;
          braceCount = 0;
          currentChunkLines = [];
        }
      }

      if (inMethod) {
        currentChunkLines.push(line);
        for (const char of line) {
          if (char === '{') braceCount++;
          if (char === '}') braceCount--;
        }

        if (braceCount === 0 && currentChunkLines.some((l) => l.includes('{'))) {
          inMethod = false;
          chunks.push({
            id: `java_method_${methodName}_L${startLine}`,
            name: methodName,
            code: currentChunkLines.join('\n').trim(),
            startLine,
            endLine: i + 1,
            type: 'FUNCTION',
          });
          currentChunkLines = [];
        }
      }
    }

    if (chunks.length === 0) {
      return this.createFallbackChunks(lines);
    }

    return chunks;
  }

  /**
   * Fallback: Chia theo các khối 50 dòng nếu code không phân tách được hàm
   */
  private static createFallbackChunks(lines: string[]): CodeChunk[] {
    const chunks: CodeChunk[] = [];
    const chunkSize = 50;
    const overlap = 10;

    for (let i = 0; i < lines.length; i += chunkSize - overlap) {
      const slice = lines.slice(i, i + chunkSize);
      if (slice.length === 0) break;
      chunks.push({
        id: `block_L${i + 1}_L${i + slice.length}`,
        name: `Block Lines ${i + 1}-${i + slice.length}`,
        code: slice.join('\n').trim(),
        startLine: i + 1,
        endLine: i + slice.length,
        type: 'BLOCK',
      });
      if (i + chunkSize >= lines.length) break;
    }
    return chunks;
  }
}
