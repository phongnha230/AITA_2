import {
    compareOutput,
} from "../src/infrastructure/sandbox/comparator/output-comparator";

// ============================================
// AITA - TV5 Docker Sandbox Engine
// Test: Output Comparator
// ============================================

let passed = 0;
let failed = 0;

/**
 * Hàm chạy một test case cho Output Comparator.
 */
function test(
    name: string,
    expectedResult: boolean,
    expectedOutput: string,
    actualOutput: string
): void {
    const result = compareOutput(expectedOutput, actualOutput);

    if (result.matched === expectedResult) {
        console.log(`PASS: ${name}`);
        passed++;
        return;
    }

    console.log(`FAIL: ${name}`);

    if (result.diff) {
        console.log(result.diff);
    }

    failed++;
}

console.log("====================================");
console.log(" AITA OUTPUT COMPARATOR TEST");
console.log("====================================\n");

// ============================================
// TEST 1
// Output giống hoàn toàn
// ============================================

test(
    "Exact output",
    true,
    "10\n20\n30",
    "10\n20\n30"
);

// ============================================
// TEST 2
// Windows CRLF vs Linux LF
// Phải được xem là giống nhau
// ============================================

test(
    "CRLF vs LF",
    true,
    "10\r\n20\r\n30",
    "10\n20\n30"
);

// ============================================
// TEST 3
// Khoảng trắng cuối dòng
// Phải được bỏ qua
// ============================================

test(
    "Trailing spaces",
    true,
    "Hello\nWorld",
    "Hello   \nWorld\t"
);

// ============================================
// TEST 4
// Dòng trống dư ở cuối output
// Phải được bỏ qua
// ============================================

test(
    "Trailing blank lines",
    true,
    "Hello\nWorld",
    "Hello\nWorld\n\n"
);

// ============================================
// TEST 5
// Output khác nhau
// Comparator phải phát hiện được
// ============================================

test(
    "Different output",
    false,
    "10\n20\n30",
    "10\n99\n30"
);

// ============================================
// TEST 6
// Actual output bị thiếu một dòng
// Comparator phải phát hiện được
// ============================================

test(
    "Missing line",
    false,
    "10\n20\n30",
    "10\n20"
);

// ============================================
// TEST SUMMARY
// ============================================

console.log("\n====================================");
console.log(" TEST SUMMARY");
console.log("====================================");

console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total : ${passed + failed}`);

if (failed === 0) {
    console.log("\nAll comparator tests passed.");
} else {
    console.log("\nSome comparator tests failed.");
}