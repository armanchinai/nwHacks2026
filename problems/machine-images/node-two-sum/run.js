const codeB64 = process.env.USER_CODE_B64;

if (!codeB64) {
  console.error("No USER_CODE_B64 provided");
  process.exit(1);
}

let userCode;
try {
  userCode = Buffer.from(codeB64, "base64").toString("utf8");
} catch {
  console.error("Invalid base64");
  process.exit(1);
}

// Load user submission
try {
  eval(userCode);
} catch (err) {
  console.error("Failed to load user code:", err);
  process.exit(1);
}

// Validate function existence
if (typeof twoSum !== "function") {
  console.error("twoSum is not defined or not a function");
  process.exit(1);
}

/**
 * Test cases
 * Each case assumes at least one valid solution exists
 */
const tests = [
  // Basic
  { nums: [2, 7, 11, 15], target: 9 },
  { nums: [3, 2, 4], target: 6 },
  { nums: [3, 3], target: 6 },

  // Negative numbers
  { nums: [-1, -2, -3, -4, -5], target: -8 },

  // Zero handling
  { nums: [0, 4, 3, 0], target: 0 },

  // Large numbers
  { nums: [1000000, 500000, -500000], target: 500000 },

  // Duplicate-heavy
  { nums: [1, 1, 1, 2, 2, 3], target: 4 },

  // Indices not in order
  { nums: [5, 75, 25], target: 100 },

  // Minimal valid input
  { nums: [1, 2], target: 3 },

  // Larger array
  {
    nums: Array.from({ length: 1000 }, (_, i) => i),
    target: 1997 // 998 + 999
  }
];

let failures = 0;

function isValidResult(result, nums, target) {
  if (!Array.isArray(result)) return false;
  if (result.length !== 2) return false;

  const [i, j] = result;

  if (!Number.isInteger(i) || !Number.isInteger(j)) return false;
  if (i === j) return false;
  if (i < 0 || j < 0 || i >= nums.length || j >= nums.length) return false;

  return nums[i] + nums[j] === target;
}

// Run tests
for (let idx = 0; idx < tests.length; idx++) {
  const { nums, target } = tests[idx];

  try {
    const result = twoSum([...nums], target); // defensive copy

    if (!isValidResult(result, nums, target)) {
      failures++;
      console.error(`Test ${idx + 1} failed: invalid result`, result);
    }
  } catch (err) {
    failures++;
    console.error(`Test ${idx + 1} runtime error:`, err);
  }
}

// Exit code = number of failing tests
process.exit(failures);
