import { AssignmentEnv, TestCase } from '../../types/assignment.types';

export interface SampleExamTemplate {
  title: string;
  description: string;
  environment: AssignmentEnv;
  durationMinutes: number;
  pdfFile: { name: string; size: string };
  starterZipFile: { name: string; size: string };
  zipEntries: string[];
  zipFilesContent: Record<string, string>;
  solutionTitle: string;
  expectedComplexity?: string;
  solutionCode: string;
  testCases: TestCase[];
}

export const samplePrf192Template: SampleExamTemplate = {
  title: 'Đề thi Thực hành PE PRF192 - Spring 2025',
  description:
    'Kỳ thi thực hành môn Cơ sở lập trình với C (Programming Fundamentals with C). Gồm các bài toán về Thuật toán số nguyên tố và Xử lý mảng.',
  environment: 'C_GCC',
  durationMinutes: 60,
  pdfFile: { name: 'PRF192_PE_Paper.pdf', size: '3.1 KB' },
  starterZipFile: { name: 'PRF192_Starter_Template.zip', size: '1.2 KB' },
  zipEntries: ['Makefile', 'src/main.c', 'src/solution.c', 'src/solution.h'],
  zipFilesContent: {
    'Makefile': `CC = gcc
CFLAGS = -Wall -Wextra -std=c11 -O2
SRC = src/main.c src/solution.c
TARGET = program

all: $(TARGET)

$(TARGET): $(SRC)
\t$(CC) $(CFLAGS) $(SRC) -o $(TARGET)

clean:
\trm -f $(TARGET)
`,
    'src/solution.h': `#ifndef SOLUTION_H
#define SOLUTION_H

#include <stdbool.h>

bool isPrime(int num);
void solveQuestion1(int n);
void solveQuestion2(int n, int arr[]);

#endif
`,
    'src/solution.c': `#include <stdio.h>
#include <stdbool.h>
#include "solution.h"

// TODO: Sinh viên hiện thực các hàm giải thuật tại đây

bool isPrime(int num) {
    // Viết code tại đây
    return false;
}

void solveQuestion1(int n) {
    // Viết code tại đây
}

void solveQuestion2(int n, int arr[]) {
    // Viết code tại đây
}
`,
    'src/main.c': `#include <stdio.h>
#include "solution.h"

int main() {
    int qId;
    if (scanf("%d", &qId) != 1) return 0;
    if (qId == 1) {
        int n;
        if (scanf("%d", &n) == 1) {
            solveQuestion1(n);
        }
    } else if (qId == 2) {
        int n;
        if (scanf("%d", &n) == 1) {
            int arr[105];
            for (int i = 0; i < n; i++) {
                scanf("%d", &arr[i]);
            }
            solveQuestion2(n, arr);
        }
    }
    return 0;
}
`,
  },
  solutionTitle: 'Bài giải chuẩn PRF192 (Reference Solution - Q1 & Q2)',
  expectedComplexity: 'O(n log n)',
  solutionCode: `// ==========================================
// PRF192 PE REFERENCE SOLUTION - Q1 & Q2
// ==========================================
#include <stdio.h>
#include <stdbool.h>
#include <math.h>

// Helper: Check if a number is prime
bool isPrime(int num) {
    if (num < 2) return false;
    for (int i = 2; i * i <= num; i++) {
        if (num % i == 0) return false;
    }
    return true;
}

// Problem 1: Print primes up to N and count
void solveQuestion1(int n) {
    int count = 0;
    bool first = true;
    for (int i = 2; i <= n; i++) {
        if (isPrime(i)) {
            if (!first) printf(" ");
            printf("%d", i);
            first = false;
            count++;
        }
    }
    printf("\\nTotal primes: %d\\n", count);
}

// Problem 2: Reverse array from 0 to max index
void solveQuestion2(int n, int arr[]) {
    if (n <= 0) return;
    int maxIdx = 0;
    for (int i = 1; i < n; i++) {
        if (arr[i] > arr[maxIdx]) {
            maxIdx = i;
        }
    }
    int left = 0, right = maxIdx;
    while (left < right) {
        int temp = arr[left];
        arr[left] = arr[right];
        arr[right] = temp;
        left++;
        right--;
    }
    for (int i = 0; i < n; i++) {
        printf("%d%s", arr[i], (i == n - 1) ? "" : " ");
    }
    printf("\\n");
}

int main() {
    int qId;
    if (scanf("%d", &qId) != 1) return 0;
    if (qId == 1) {
        int n;
        if (scanf("%d", &n) == 1) {
            solveQuestion1(n);
        }
    } else if (qId == 2) {
        int n;
        if (scanf("%d", &n) == 1) {
            int arr[105];
            for (int i = 0; i < n; i++) {
                scanf("%d", &arr[i]);
            }
            solveQuestion2(n, arr);
        }
    }
    return 0;
}`,
  testCases: [
    {
      orderIndex: 1,
      questionNumber: 'Q1',
      label: 'TC1_Q1_Range10',
      rationaleTag: 'FUNCTIONAL',
      isHidden: false,
      timeLimitMs: 1500,
      memoryLimitKb: 262144,
      points: 1.5,
      comparisonMode: 'STDIO',
      stdinInput: '1\n10',
      expectedStdout: '2 3 5 7\nTotal primes: 4',
    },
    {
      orderIndex: 2,
      questionNumber: 'Q1',
      label: 'TC2_Q1_Range20',
      rationaleTag: 'FUNCTIONAL',
      isHidden: false,
      timeLimitMs: 1500,
      memoryLimitKb: 262144,
      points: 1.5,
      comparisonMode: 'STDIO',
      stdinInput: '1\n20',
      expectedStdout: '2 3 5 7 11 13 17 19\nTotal primes: 8',
    },
    {
      orderIndex: 3,
      questionNumber: 'Q1',
      label: 'TC3_Q1_Hidden_EdgeCase',
      rationaleTag: 'BOUNDARY',
      isHidden: true,
      timeLimitMs: 1500,
      memoryLimitKb: 262144,
      points: 1.0,
      comparisonMode: 'STDIO',
      stdinInput: '1\n2',
      expectedStdout: '2\nTotal primes: 1',
    },
    {
      orderIndex: 4,
      questionNumber: 'Q2',
      label: 'TC4_Q2_Sample1',
      rationaleTag: 'FUNCTIONAL',
      isHidden: false,
      timeLimitMs: 1500,
      memoryLimitKb: 262144,
      points: 1.5,
      comparisonMode: 'STDIO',
      stdinInput: '2\n5\n3 1 9 4 2',
      expectedStdout: '9 1 3 4 2',
    },
    {
      orderIndex: 5,
      questionNumber: 'Q2',
      label: 'TC5_Q2_Hidden_MaxAtEnd',
      rationaleTag: 'BOUNDARY',
      isHidden: true,
      timeLimitMs: 1500,
      memoryLimitKb: 262144,
      points: 1.5,
      comparisonMode: 'STDIO',
      stdinInput: '2\n4\n1 2 3 4',
      expectedStdout: '4 3 2 1',
    },
  ],
};

export const samplePro192Template: SampleExamTemplate = {
  title: 'Kỳ thi Thực hành PE PRO192 / CSD201 - Spring 2025',
  description: `Đề thi thực hành môn Lập trình Hướng đối tượng Java & Cấu trúc dữ liệu. 
Sinh viên được cấp Skeleton Starter Code chứa Interface ICar và class Car.
Yêu cầu hoàn thành các phương thức:
- Câu 1 (f1): Đếm số lượng xe có giá >= 500.
- Câu 2 (f2): Sắp xếp danh sách xe theo rate tăng dần, nếu bằng nhau thì theo price giảm dần (Độ phức tạp kỳ vọng O(n log n)).
- Câu 3 (f3): Ghi danh sách xe ra file đầu ra f1.txt (File I/O).`,
  environment: 'JAVA_JDK',
  durationMinutes: 90,
  pdfFile: { name: 'PE_PRO192_CSD201_SP25_FinalExam.pdf', size: '384 KB' },
  starterZipFile: { name: 'PRO192_StarterCode_Skeleton.zip', size: '128 KB' },
  zipEntries: ['src/Car.java', 'src/ICar.java', 'src/Main.java', 'src/MyCar.java'],
  zipFilesContent: {
    'src/ICar.java': `package src;\nimport java.util.List;\n\npublic interface ICar {\n    int f1(List<Car> list);\n    void f2(List<Car> list);\n    void f3(List<Car> list, String outputFile);\n}`,
    'src/Car.java': `package src;\n\npublic class Car {\n    private String name;\n    private double price;\n    private int rate;\n    public Car(String name, double price, int rate) {\n        this.name = name;\n        this.price = price;\n        this.rate = rate;\n    }\n    public String getName() { return name; }\n    public double getPrice() { return price; }\n    public int getRate() { return rate; }\n}`,
    'src/MyCar.java': `package src;\nimport java.util.List;\n\n// TODO: Sinh viên triển khai các phương thức f1, f2, f3 vào đây\npublic class MyCar implements ICar {\n    @Override\n    public int f1(List<Car> list) {\n        return 0;\n    }\n    @Override\n    public void f2(List<Car> list) {}\n    @Override\n    public void f3(List<Car> list, String outputFile) {}\n}`,
  },
  solutionTitle: 'Bài giải mẫu chuẩn PRO192 / CSD201 - OOP Java Reference',
  expectedComplexity: 'O(n log n)',
  solutionCode: `// ==========================================
// PRO192 & CSD201 PE REFERENCE SOLUTION
// Big-O Target: O(n log n)
// ==========================================
package src;

import java.util.*;
import java.io.*;

public class MyCar implements ICar {
    // Câu 1: Đếm số lượng xe có price >= 500
    @Override
    public int f1(List<Car> list) {
        if (list == null) return 0;
        int count = 0;
        for (Car c : list) {
            if (c.getPrice() >= 500) count++;
        }
        return count;
    }

    // Câu 2: Sắp xếp danh sách xe theo rate tăng dần, price giảm dần
    // Độ phức tạp thuật toán: O(n log n)
    @Override
    public void f2(List<Car> list) {
        if (list == null || list.size() <= 1) return;
        Collections.sort(list, new Comparator<Car>() {
            @Override
            public int compare(Car o1, Car o2) {
                if (o1.getRate() != o2.getRate()) {
                    return Integer.compare(o1.getRate(), o2.getRate());
                }
                return Double.compare(o2.getPrice(), o1.getPrice());
            }
        });
    }

    // Câu 3: Ghi kết quả ra file f1.txt (File I/O)
    @Override
    public void f3(List<Car> list, String outputFile) {
        if (list == null) return;
        try (PrintWriter pw = new PrintWriter(new FileWriter(outputFile))) {
            for (Car c : list) {
                pw.println(c.getName() + " - " + c.getPrice());
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}`,
  testCases: [
    {
      orderIndex: 1,
      questionNumber: 'Q1',
      label: 'TC1_Q1_CountPriceThreshold',
      rationaleTag: 'FUNCTIONAL',
      isHidden: false,
      timeLimitMs: 2000,
      memoryLimitKb: 262144,
      points: 2.0,
      comparisonMode: 'STDIO',
      stdinInput: '1\\n4\\nAudi 600 5\\nBMW 400 4\\nToyota 750 5\\nKia 300 2',
      expectedStdout: 'OUTPUT: 2',
    },
    {
      orderIndex: 2,
      questionNumber: 'Q2',
      label: 'TC2_Q2_SortRateAndPrice',
      rationaleTag: 'PERFORMANCE',
      isHidden: false,
      timeLimitMs: 2000,
      memoryLimitKb: 262144,
      points: 2.0,
      comparisonMode: 'STDIO',
      stdinInput: '2\\n3\\nCarA 100 2\\nCarB 200 1\\nCarC 300 2',
      expectedStdout: 'CarB 200.0\\nCarC 300.0\\nCarA 100.0',
    },
    {
      orderIndex: 3,
      questionNumber: 'Q3',
      label: 'TC3_Q3_FileIO_f1_txt',
      rationaleTag: 'BOUNDARY',
      isHidden: false,
      timeLimitMs: 2000,
      memoryLimitKb: 262144,
      points: 1.5,
      comparisonMode: 'FILE_TO_FILE',
      inputFileName: 'data.txt',
      inputFileContent: 'Ferrari 1200 5\\nLamborghini 1500 5',
      expectedFileName: 'f1.txt',
      expectedFileContent: 'Ferrari - 1200.0\\nLamborghini - 1500.0',
    },
    {
      orderIndex: 4,
      questionNumber: 'Q2',
      label: 'TC4_Q2_Hidden_EmptyList',
      rationaleTag: 'EDGE',
      isHidden: true,
      timeLimitMs: 1500,
      memoryLimitKb: 262144,
      points: 1.5,
      comparisonMode: 'STDIO',
      stdinInput: '2\\n0',
      expectedStdout: 'EMPTY_LIST',
    },
  ],
};
