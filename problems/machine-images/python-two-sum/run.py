import base64
import importlib.util
import os
import sys
import traceback
from typing import List


class TestCase:
    def __init__(self, nums: List[int], target: int):
        self.nums = nums
        self.target = target


def fail(code: int):
    sys.exit(code)


def main():
    code_b64 = os.getenv("USER_CODE_B64")
    if not code_b64:
        print("No USER_CODE_B64 provided", file=sys.stderr)
        fail(3)
        # code_b64 = "cHJpbnQoMSk="


    try:
        user_code = base64.b64decode(code_b64).decode("utf-8")
    except Exception:
        print("Invalid base64", file=sys.stderr)
        fail(3)

    # Write user submission exactly as-is
    with open("solution.py", "w", encoding="utf-8") as f:
        f.write(user_code)

    # Load module safely
    try:
        spec = importlib.util.spec_from_file_location("solution", "solution.py")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
    except Exception:
        print("Failed to load user code:", file=sys.stderr)
        traceback.print_exc()
        fail(4)

    if not hasattr(module, "twoSum") or not callable(module.twoSum):
        print("twoSum is not defined or not callable", file=sys.stderr)
        fail(4)

    tests = [
        # Basic
        TestCase([2, 7, 11, 15], 9),
        TestCase([3, 2, 4], 6),
        TestCase([3, 3], 6),

        # Negative numbers
        TestCase([-1, -2, -3, -4, -5], -8),

        # Zero handling
        TestCase([0, 4, 3, 0], 0),

        # Large numbers
        TestCase([1_000_000, 500_000, -500_000], 500_000),

        # Duplicate-heavy
        TestCase([1, 1, 1, 2, 2, 3], 4),

        # Indices not in order
        TestCase([5, 75, 25], 100),

        # Minimal valid input
        TestCase([1, 2], 3),

        # Larger array
        TestCase(list(range(1000)), 1997),  # 998 + 999
    ]

    failures = 0

    for idx, tc in enumerate(tests):
        try:
            nums_copy = list(tc.nums)
            result = module.twoSum(nums_copy, tc.target)

            if not is_valid_result(result, tc.nums, tc.target):
                failures += 1
                print(f"Test {idx + 1} failed: invalid result {result}", file=sys.stderr)

        except Exception:
            failures += 1
            print(f"Test {idx + 1} runtime error:", file=sys.stderr)
            traceback.print_exc()

    sys.exit(failures)


def is_valid_result(result, nums, target):
    if not isinstance(result, (list, tuple)):
        return False
    if len(result) != 2:
        return False

    i, j = result

    if not isinstance(i, int) or not isinstance(j, int):
        return False
    if i == j:
        return False
    if i < 0 or j < 0 or i >= len(nums) or j >= len(nums):
        return False

    return nums[i] + nums[j] == target


if __name__ == "__main__":
    main()
