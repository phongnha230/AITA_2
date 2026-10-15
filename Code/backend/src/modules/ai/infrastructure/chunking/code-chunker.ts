import Parser from 'tree-sitter';
import C from 'tree-sitter-c';
import Java from 'tree-sitter-java';

export const CHUNKER_VERSION = 'tree-sitter-v2-algorithm-spec';

export interface CodeChunk {
  id: string;
  name: string;
  file: string;
  code: string;
  startLine: number;
  endLine: number;
  type: 'FUNCTION' | 'CLASS' | 'BLOCK' | 'SPECIFICATION';
}

const findIdentifier = (node: Parser.SyntaxNode): string | null => {
  const directName = node.childForFieldName('name');
  if (directName) return directName.text;
  for (const child of node.namedChildren) {
    const result = findIdentifier(child);
    if (result) return result;
  }
  return node.type === 'identifier' ? node.text : null;
};

const fallbackChunks = (sourceCode: string, file: string): CodeChunk[] => {
  const lines = sourceCode.split('\n');
  const chunks: CodeChunk[] = [];
  const chunkSize = 50;
  const overlap = 10;
  for (let index = 0; index < lines.length; index += chunkSize - overlap) {
    const slice = lines.slice(index, index + chunkSize);
    if (slice.length === 0) break;
    chunks.push({
      id: `block_L${index + 1}_L${index + slice.length}`,
      name: `Block Lines ${index + 1}-${index + slice.length}`,
      file,
      code: slice.join('\n').trim(),
      startLine: index + 1,
      endLine: index + slice.length,
      type: 'BLOCK',
    });
    if (index + chunkSize >= lines.length) break;
  }
  return chunks;
};

export class CodeChunker {
  public static chunkSourceCode(
    sourceCode: string,
    language: 'C_GCC' | 'JAVA_JDK' | string,
    file = language === 'JAVA_JDK' ? 'Solution.java' : 'solution.c'
  ): CodeChunk[] {
    if (!sourceCode.trim()) return [];

    const parser = new Parser();
    const isJava = language === 'JAVA_JDK';
    parser.setLanguage(isJava ? Java : C);
    const tree = parser.parse(sourceCode);
    const targetTypes = isJava
      ? new Set(['method_declaration', 'constructor_declaration'])
      : new Set(['function_definition']);
    const chunks: CodeChunk[] = [];

    const visit = (node: Parser.SyntaxNode): void => {
      if (targetTypes.has(node.type)) {
        const name = findIdentifier(node) ?? `anonymous_${node.startPosition.row + 1}`;
        const startLine = node.startPosition.row + 1;
        const endLine = node.endPosition.row + 1;
        chunks.push({
          id: `${isJava ? 'java' : 'c'}_${name}_L${startLine}`,
          name,
          file,
          code: sourceCode.slice(node.startIndex, node.endIndex),
          startLine,
          endLine,
          type: 'FUNCTION',
        });
        return;
      }
      for (const child of node.namedChildren) visit(child);
    };

    visit(tree.rootNode);
    return chunks.length > 0 ? chunks : fallbackChunks(sourceCode, file);
  }
}
