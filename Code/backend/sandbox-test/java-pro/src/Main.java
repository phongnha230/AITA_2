import java.util.Scanner;

public class Main {

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        int choice = scanner.nextInt();

        switch (choice) {
            case 1:
                System.out.println("Function 1");
                break;

            case 2:
                System.out.println("Function 2");
                break;

            default:
                System.out.println("Invalid choice");
        }

        scanner.close();
    }
}