import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
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
  description: `Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

---

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]

Example 3:
Input: nums = [3,3], target = 6
Output: [0,1]

---

Constraints:
• 2 <= nums.length <= 10^4
• -10^9 <= nums[i] <= 10^9
• -10^9 <= target <= 10^9
• Only one valid answer exists`,
  starterCode:
    "import java.util.*;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n\n        return new int[] {};\n    }\n}\n",
};

export default function MainPage() {
  const { problemId } = useParams<{ problemId: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const [sidebarWidth, setSidebarWidth] = useState(450);
  const [isResizing, setIsResizing] = useState(false);
  const [isFolded, setIsFolded] = useState(false);

  const lastWidth = useRef(450);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    setProblem(MOCK_PROBLEM);
    setCode(MOCK_PROBLEM.starterCode);
  }, [problemId]);

  useEffect(() => {
    const resize = (e: MouseEvent) => {
      if (!isResizing) return;
      if (e.clientX > 300 && e.clientX < window.innerWidth * 0.7) {
        setSidebarWidth(e.clientX);
        lastWidth.current = e.clientX;
      }
    };
    const stopResizing = () => setIsResizing(false);

    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing]);

  async function runCode() {
    // Crucial: The backend expects the exact problem ID for the Fly machine image
    const activeProblemId = problem?.id || "java-two-sum";
    setStatus("Booting Runner...");

    try {
      // Note: Backend uses req.params.problemId and req.body for language/code
      const res = await fetch(
        `https://problems.fly.dev/run/${activeProblemId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ language: "java", code }),
        },
      );

      const { job_id } = await res.json();

      // Connect to WebSocket for real-time status
      const ws = new WebSocket(`wss://problems.fly.dev?job_id=${job_id}`);
      wsRef.current = ws;

      ws.onmessage = (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.type === "status") setStatus(msg.state);
        if (msg.type === "result") {
          setStatus(msg.status);
          ws.close();
        }
      };

      ws.onerror = () => setStatus("WebSocket error");
    } catch (err) {
      console.error(err);
      setStatus("Connection Failed");
    }
  }

  if (!problem) return null;

  return (
    <div className="h-screen w-screen flex flex-col bg-[#020617] text-slate-300 overflow-hidden">
      <nav className="z-50 flex items-center justify-between w-full px-6 py-4 border-b border-slate-800 bg-[#020617]">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-xl font-black text-white tracking-tighter hover:text-cyan-400 transition-colors"
          >
            SPEAK<span className="text-cyan-400">CODE</span>
          </Link>
          <button
            onClick={() => {
              if (isFolded) {
                setSidebarWidth(lastWidth.current);
                setIsFolded(false);
              } else {
                setSidebarWidth(0);
                setIsFolded(true);
              }
            }}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <svg
              className={`w-6 h-6 transition-transform ${isFolded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden relative">
        <aside
          style={{ width: `${sidebarWidth}px` }}
          className={`h-full border-r border-slate-800 bg-[#020617] overflow-y-auto flex-shrink-0 transition-[width] duration-75 ${isFolded ? "border-none" : ""}`}
        >
          {!isFolded && (
            <div className="p-8 min-w-[350px]">
              <h1 className="text-2xl font-black text-white mb-6 tracking-tight">
                {problem.title}
              </h1>
              <div className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                {problem.description}
              </div>
            </div>
          )}
        </aside>

        {!isFolded && (
          <div
            onMouseDown={() => setIsResizing(true)}
            className="w-1 cursor-col-resize hover:bg-cyan-500/50 active:bg-cyan-500 transition-colors z-50 flex-shrink-0"
          />
        )}

        <section className="flex-1 flex flex-col bg-[#010409] relative min-w-0">
          {isResizing && (
            <div className="absolute inset-0 z-[60] cursor-col-resize bg-transparent" />
          )}

          <div className="flex-1">
            <Editor
              height="100%"
              theme="vs-dark"
              language="java"
              value={code}
              onChange={(v) => setCode(v ?? "")}
              options={{
                fontSize: 15,
                minimap: { enabled: false },
                automaticLayout: true,
                padding: { top: 20 },
                fontFamily: "JetBrains Mono, Menlo, monospace",
              }}
            />
          </div>

          <div className="flex items-center justify-between px-8 py-6 border-t border-slate-800 bg-[#020617]">
            <div className="text-xs font-black uppercase tracking-widest text-cyan-500">
              {status ? `System: ${status}` : "System Idle"}
            </div>
            <button
              onClick={runCode}
              className="px-8 py-3 bg-white text-slate-950 rounded-xl font-black text-sm hover:bg-cyan-400 transition-all hover:scale-105 active:scale-95 shadow-xl"
            >
              RUN TEST CASES
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
