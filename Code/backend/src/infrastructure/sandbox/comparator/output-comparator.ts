/**
 * Result returned after comparing expected output with actual output.
 */
export interface OutputComparisonResult {
    matched: boolean;
    expected: string;
    actual: string;
    normalizedExpected: string;
    normalizedActual: string;
    diff?: string;
}

/**
 * Normalize program output before comparison.
 *
 * Rules:
 * 1. Convert Windows CRLF (\r\n) to Unix LF (\n).
 * 2. Convert remaining CR (\r) to LF (\n).
 * 3. Remove trailing spaces/tabs from each line.
 * 4. Remove unnecessary blank lines at the beginning/end.
 */
export function normalizeOutput(output: string): string {
    if (output == null) {
        return "";
    }

    return output
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .split("\n")
        .map((line) => line.replace(/[ \t]+$/g, ""))
        .join("\n")
        .trim();
}

/**
 * Generate a simple line-by-line diff.
 */
function generateDiff(expected: string, actual: string): string {
    const expectedLines = expected.split("\n");
    const actualLines = actual.split("\n");

    const maxLines = Math.max(
        expectedLines.length,
        actualLines.length
    );

    const differences: string[] = [];

    for (let i = 0; i < maxLines; i++) {
        const expectedLine = expectedLines[i] ?? "<missing>";
        const actualLine = actualLines[i] ?? "<missing>";

        if (expectedLine !== actualLine) {
            differences.push(
                `Line ${i + 1}\n` +
                `Expected: ${expectedLine}\n` +
                `Actual:   ${actualLine}`
            );
        }
    }

    return differences.join("\n\n");
}

/**
 * Compare expected output and actual program output.
 */
export function compareOutput(
    expected: string,
    actual: string
): OutputComparisonResult {

    const normalizedExpected = normalizeOutput(expected);
    const normalizedActual = normalizeOutput(actual);

    const matched = normalizedExpected === normalizedActual;

    return {
        matched,
        expected,
        actual,
        normalizedExpected,
        normalizedActual,
        diff: matched
            ? undefined
            : generateDiff(normalizedExpected, normalizedActual),
    };
}