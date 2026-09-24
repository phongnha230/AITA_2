export class OutputComparator {
  /**
   * Chuẩn hóa văn bản:
   * - Đổi \r\n thành \n
   * - Trim khoảng trắng ở đuôi mỗi dòng
   * - Bỏ dòng trống thừa ở đầu và cuối file
   */
  public static normalize(text: string): string {
    if (!text) return "";
    return text
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n")
      .trim();
  }

  /**
   * So sánh nội dung hai chuỗi sau khi đã được chuẩn hóa
   */
  public static compare(actual: string, expected: string): boolean {
    return this.normalize(actual) === this.normalize(expected);
  }
}
