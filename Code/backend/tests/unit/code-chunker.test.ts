import { describe, expect, it } from 'vitest';
import { CHUNKER_VERSION, CodeChunker } from '../../src/modules/ai/infrastructure/chunking/code-chunker.js';

describe('CodeChunker', () => {
  it('extracts C functions with symbol and line metadata', () => {
    const chunks = CodeChunker.chunkSourceCode(
      'int add(int a, int b) {\n  return a + b;\n}\n',
      'C_GCC',
      'src/main.c'
    );
    expect(CHUNKER_VERSION).toBe('tree-sitter-v2-algorithm-spec');
    expect(chunks[0]).toMatchObject({ name: 'add', file: 'src/main.c', startLine: 1, endLine: 3 });
  });

  it('extracts Java methods', () => {
    const chunks = CodeChunker.chunkSourceCode(
      'class Main { int solve(int value) { return value + 1; } }',
      'JAVA_JDK',
      'Main.java'
    );
    expect(chunks.some((chunk) => chunk.name === 'solve')).toBe(true);
  });

  it('returns no chunks for empty source and falls back to overlapping line blocks', () => {
    expect(CodeChunker.chunkSourceCode('   ', 'C_GCC')).toEqual([]);
    const source = Array.from({ length: 75 }, (_, index) => `// line ${index + 1}`).join('\n');
    const chunks = CodeChunker.chunkSourceCode(source, 'C_GCC', 'comments.c');
    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toMatchObject({ type: 'BLOCK', startLine: 1, endLine: 50 });
    expect(chunks[1]).toMatchObject({ type: 'BLOCK', startLine: 41, endLine: 75 });
  });

  it('uses default file names when file parameter is omitted', () => {
    const javaChunks = CodeChunker.chunkSourceCode('class Main { void run() {} }', 'JAVA_JDK');
    expect(javaChunks[0].file).toBe('Solution.java');

    const cChunks = CodeChunker.chunkSourceCode('void run() {}', 'C_GCC');
    expect(cChunks[0].file).toBe('solution.c');
  });
});
