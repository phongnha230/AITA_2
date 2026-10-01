import java.io.File;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Scanner;

public class Main {

    public static void main(String[] args) {
        try {
            List<Integer> numbers = new ArrayList<>();

            Scanner scanner = new Scanner(
                new File("data.txt")
            );

            while (scanner.hasNextInt()) {
                numbers.add(scanner.nextInt());
            }

            scanner.close();

            // ==============================
            // f1.txt - tổng các phần tử
            // ==============================

            int sum = 0;

            for (int number : numbers) {
                sum += number;
            }

            try (PrintWriter writer =
                     new PrintWriter("f1.txt")) {

                writer.println(sum);
            }

            // ==============================
            // f2.txt - số phần tử
            // ==============================

            try (PrintWriter writer =
                     new PrintWriter("f2.txt")) {

                writer.println(numbers.size());
            }

            // ==============================
            // f3.txt - sắp xếp tăng dần
            // ==============================

            Collections.sort(numbers);

            try (PrintWriter writer =
                     new PrintWriter("f3.txt")) {

                for (int i = 0;
                     i < numbers.size();
                     i++) {

                    if (i > 0) {
                        writer.print(" ");
                    }

                    writer.print(numbers.get(i));
                }

                writer.println();
            }

        } catch (Exception e) {
            e.printStackTrace();
            System.exit(1);
        }
    }
}