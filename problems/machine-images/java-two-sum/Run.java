import java.io.*;
import java.lang.reflect.*;
import java.nio.file.*;
import java.util.*;
import java.util.Base64;

public class Run {

    static class TestCase {
        int[] nums;
        int target;

        TestCase(int[] nums, int target) {
            this.nums = nums;
            this.target = target;
        }
    }

    public static void main(String[] args) throws Exception {

        // System.exit(69);

        String codeB64 = System.getenv("USER_CODE_B64");
        if (codeB64 == null || codeB64.isEmpty()) {
            System.err.println("No USER_CODE_B64 provided");
            System.exit(3);
        }

        String userCode;
        try {
            userCode = new String(Base64.getDecoder().decode(codeB64));
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid base64");
            System.exit(3);
            return;
        }

        // Write Solution.java
        Path solutionPath = Paths.get("Solution.java");


        // Files.writeString(solutionPath, userCode);
        String wrappedCode = 
"""
import java.util.*;

%s
""".formatted(userCode);

        Files.writeString(solutionPath, wrappedCode);



        // Compile
        Process javac = new ProcessBuilder("javac", "Solution.java")
                .redirectErrorStream(true)
                .start();

        String compileOutput = new String(javac.getInputStream().readAllBytes());
        int compileExit = javac.waitFor();

        if (compileExit != 0) {
            System.err.println("Compilation failed:");
            System.err.println(compileOutput);
            System.exit(2);
        }

        // Load Solution class
        Class<?> solutionClass;
        Object solutionInstance;
        Method twoSumMethod;

        try {
            solutionClass = Class.forName("Solution");
            solutionInstance = solutionClass.getDeclaredConstructor().newInstance();
            twoSumMethod = solutionClass.getMethod("twoSum", int[].class, int.class);
        } catch (Exception e) {
            System.err.println("Failed to load Solution or twoSum method");
            e.printStackTrace();
            System.exit(4);
            return;
        }

        List<TestCase> tests = List.of(
                // Basic
                new TestCase(new int[]{2, 7, 11, 15}, 9),
                new TestCase(new int[]{3, 2, 4}, 6),
                new TestCase(new int[]{3, 3}, 6),

                // Negative numbers
                new TestCase(new int[]{-1, -2, -3, -4, -5}, -8),

                // Zero handling
                new TestCase(new int[]{0, 4, 3, 0}, 0),

                // Large numbers
                new TestCase(new int[]{1_000_000, 500_000, -500_000}, 500_000),

                // Duplicate-heavy
                new TestCase(new int[]{1, 1, 1, 2, 2, 3}, 4),

                // Indices not in order
                new TestCase(new int[]{5, 75, 25}, 100),

                // Minimal valid input
                new TestCase(new int[]{1, 2}, 3)

                
        );

        int failures = 0;

        for (int i = 0; i < tests.size(); i++) {
            TestCase tc = tests.get(i);

            try {
                int[] numsCopy = Arrays.copyOf(tc.nums, tc.nums.length);

                int[] result = (int[]) twoSumMethod.invoke(
                        solutionInstance,
                        numsCopy,
                        tc.target
                );

                if (!isValidResult(result, tc.nums, tc.target)) {
                    failures++;
                    System.err.println("Test " + (i + 1) + " failed: invalid result");
                }

            } catch (Exception e) {
                failures++;
                System.err.println("Test " + (i + 1) + " runtime error:");
                e.printStackTrace();
            }
        }

        // System.exit(69);

        System.exit(failures);
    }

    static boolean isValidResult(int[] result, int[] nums, int target) {
        if (result == null || result.length != 2) return false;

        int i = result[0];
        int j = result[1];

        if (i == j) return false;
        if (i < 0 || j < 0 || i >= nums.length || j >= nums.length) return false;

        return nums[i] + nums[j] == target;
    }
}
