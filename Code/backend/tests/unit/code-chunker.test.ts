import { describe, expect, it } from 'vitest';
import { CHUNKER_VERSION, CodeChunker } from '../../src/modules/ai/infrastructure/chunking/code-chunker.js';

describe('CodeChunker', () => {
  it('extracts C functions with symbol and line metadata', () => {
    const chunks = CodeChunker.chunkSourceCode(
      'int add(int a, int b) {\n  return a + b;\n}\n',
      'C_GCC',
      'src/main.c'
    );
    expect(CHUNKER_VERSION).toBe('tree-sitter-v1');
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
});
