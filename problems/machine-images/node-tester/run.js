const fs = require("fs");

const codeB64 = process.env.USER_CODE_B64;

if (!codeB64) {
  console.error("No USER_CODE_B64 provided");
  process.exit(1);
}

let code;
try {
  code = Buffer.from(codeB64, "base64").toString("utf8");
} catch {
  console.error("Invalid base64");
  process.exit(1);
}

try {
  // Execute user code
  eval(code);
} catch (err) {
  console.error("Runtime error:", err);
  process.exit(1);
}
