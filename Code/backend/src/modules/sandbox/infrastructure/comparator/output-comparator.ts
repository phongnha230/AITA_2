export class OutputComparator {
  /**
   * Chuẩn hóa văn bản:
   * - Đổi \r\n thành \n
   * - Trim khoảng trắng ở đuôi mỗi dòng
   * - Bỏ dòng trống thừa ở đầu và cuối file
   */
  public static normalize(text: string): string {
    if (!text) return '';
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .split('\n')
      .map((line) => line.trimEnd())
      .join('\n')
      .trim();
  }

  /**
   * Trích xuất phần nội dung sau dòng/từ khóa "OUTPUT:" (nếu có trong console output của đề thi FPT)
   */
  public static extractOutput(text: string): string {
    if (!text) return '';
    const match = text.match(/OUTPUT:\s*([\s\S]*)$/i);
    return match ? match[1] : text;
  }

  /**
   * So sánh nội dung hai chuỗi sau khi đã được chuẩn hóa.
   * Hỗ trợ tự động:
   * 1. So sánh trực tiếp chuỗi chuẩn hóa.
   * 2. Bóc tách phần kết quả sau nhãn "OUTPUT:" của bài thi PE.
   * 3. So sánh token-by-token (không phụ thuộc số lượng dấu cách thừa hay dòng trống ở giữa/đầu file).
   * 4. So sánh bao dung khoảng trắng giữa các cặp ngoặc (e.g. CSD / PRO danh sách).
   */
  public static compare(actual: string, expected: string): boolean {
    const normActual = this.normalize(actual);
    const normExpected = this.normalize(expected);
    if (normActual === normExpected) return true;

    // So sánh sau khi bóc tách nhãn OUTPUT:
    const extActual = this.normalize(this.extractOutput(actual));
    if (extActual === normExpected) return true;

    // So sánh Token-by-Token
    const actTokens = normActual.split(/\s+/).filter(Boolean);
    const expTokens = normExpected.split(/\s+/).filter(Boolean);
    if (actTokens.length > 0 && actTokens.length === expTokens.length) {
      if (actTokens.every((tok, idx) => tok === expTokens[idx])) return true;
    }

    const extTokens = extActual.split(/\s+/).filter(Boolean);
    if (extTokens.length > 0 && extTokens.length === expTokens.length) {
      if (extTokens.every((tok, idx) => tok === expTokens[idx])) return true;
    }

    // So sánh chuẩn hóa cặp ngoặc (bỏ khoảng cách giữa các phần tử dạng "(A, 1) (B, 2)" vs "(A, 1)(B, 2)")
    const stripParenSpaces = (s: string) =>
      s
        .replace(/\)\s*\(/g, ')(')
        .replace(/\s+/g, ' ')
        .trim();
    if (stripParenSpaces(normActual) === stripParenSpaces(normExpected)) return true;
    if (stripParenSpaces(extActual) === stripParenSpaces(normExpected)) return true;

    return false;
  }
}
