import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";

interface Problem {
  id: string;
  title: string;
  description: string;
  starterCode: string;
  language: string;
}

const MOCK_PROBLEM: Problem = {
  id: "java-two-sum",
  title: "Two Sum",
  language: "java",
  description: "Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.\n\n---\n\nExample 1:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\n\nExample 2:\nInput: nums = [3,2,4], target = 6\nOutput: [1,2]\n\nExample 3:\nInput: nums = [3,3], target = 6\nOutput: [0,1]\n\n---\n\nConstraints:\n• 2 <= nums.length <= 10^4\n• -10^9 <= nums[i] <= 10^9\n• -10^9 <= target <= 10^9\n• Only one valid answer exists",
  starterCode: "import java.util.*;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n\n        return new int[] {};\n    }\n}\n"
};

export default function ProblemRunnerPage() {
  var { problemId } = useParams<{ problemId: string }>();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("java");
  const [status, setStatus] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  /* ------------------ LOAD PROBLEM ------------------ */

  useEffect(() => {
    // TEMP: inline mock instead of fetching
    setProblem(MOCK_PROBLEM);
    setCode(MOCK_PROBLEM.starterCode);
    setLanguage(MOCK_PROBLEM.language);
  }, [problemId]);

  /* ------------------ RUN CODE ------------------ */

  async function runCode() {
    if (!problemId) problemId = "java-two-sum" ;

    setStatus("Running test cases...");

    const res = await fetch(`http://localhost:3000/run/${problemId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language, code })
    });

    const { job_id } = await res.json();

    const ws = new WebSocket(`ws://localhost:3000?job_id=${job_id}`);
    wsRef.current = ws;

    ws.onmessage = ev => {
      const msg = JSON.parse(ev.data);

      if (msg.type === "status") {
        setStatus(msg.state);
      }

      if (msg.type === "result") {
        setStatus(msg.status);
        ws.close();
      }
    };

    ws.onerror = () => {
      setStatus("WebSocket error");
    };
  }

  if (!problem) {
    return <div className="p-8 text-white">Loading…</div>;
  }

  return (
    <div className="h-full w-full flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* LEFT PANEL */}
      <aside className="w-1/3 p-6 overflow-y-auto backdrop-blur-xl bg-white/5 border-r border-white/10">
        <h1 className="text-2xl font-bold mb-4">{problem.title}</h1>
        <div className="prose prose-invert max-w-none whitespace-pre-wrap">
          {problem.description}
        </div>
      </aside>

      {/* RIGHT PANEL */}
      <section className="flex-1 flex flex-col">
        {/* EDITOR */}
        <div className="flex-1 backdrop-blur-xl bg-white/5">
          <Editor
            height="100%"
            theme="vs-dark"
            language={language}
            value={code}
            onChange={v => setCode(v ?? "")}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              smoothScrolling: true
            }}
          />
        </div>

        {/* ACTION BAR */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="text-sm text-slate-300">
            {status && (
              <span
                className={
                  status.includes("passing")
                    ? "text-green-400"
                    : status.includes("not")
                    ? "text-red-400"
                    : "text-slate-300"
                }
              >
                {status}
              </span>
            )}
          </div>

          <button
            onClick={runCode}
            className="px-6 py-2 rounded-xl bg-emerald-500/80 hover:bg-emerald-500 text-black font-semibold transition shadow-lg"
          >
            Run Test Cases
          </button>
        </div>
      </section>
    </div>
  );
}
