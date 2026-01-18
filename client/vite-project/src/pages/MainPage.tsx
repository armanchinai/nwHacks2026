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
  description:
    "Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target.\n\n---\n\nExample 1:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]",
  starterCode:
    "import java.util.*;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[] {};\n    }\n}\n",
};

export default function MainPage() {
  let { problemId } = useParams<{ problemId: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("java");
  const [status, setStatus] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    setProblem(MOCK_PROBLEM);
    setCode(MOCK_PROBLEM.starterCode);
    setLanguage(MOCK_PROBLEM.language);
  }, [problemId]);

  useEffect(() => {
    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });
          audioChunksRef.current = [];
          console.log("Session recorded", audioBlob);
        };

        recorder.start();
      } catch (err) {
        console.error("Mic error:", err);
      }
    };

    startRecording();
    return () => {
      if (mediaRecorderRef.current?.state !== "inactive") {
        mediaRecorderRef.current?.stop();
      }
    };
  }, []);

  async function runCode() {
    const activeProblemId = problemId || "java-two-sum";
    setStatus("Compiling...");

    try {
      const res = await fetch(
        `https://problems.fly.dev/run/${activeProblemId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ language, code }),
        },
      );

      const { job_id } = await res.json();
      const ws = new WebSocket(`wss://problems.fly.dev?job_id=${job_id}`);
      wsRef.current = ws;

      ws.onmessage = (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.type === "status") setStatus(msg.state);
        if (msg.type === "result") {
          setStatus(msg.status);
          if (
            msg.status.includes("passing") &&
            mediaRecorderRef.current?.state !== "inactive"
          ) {
            mediaRecorderRef.current?.stop();
          }
          ws.close();
        }
      };
    } catch (err) {
      setStatus("Server Error");
    }
  }

  if (!problem)
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
        Loading Workspace...
      </div>
    );

  return (
    <div className="h-screen w-screen flex flex-col bg-[#020617] text-slate-300 font-sans overflow-hidden">
      <nav className="z-50 flex items-center justify-between w-full px-6 py-4 border-b border-slate-800 bg-[#020617]">
        <Link to="/" className="text-xl font-black tracking-tighter text-white">
          SPEAK<span className="text-cyan-400">CODE</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
              Recording Logic
            </span>
          </div>
          <button className="text-xs font-bold text-slate-500 hover:text-white transition-colors">
            DASHBOARD
          </button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-1/3 p-8 overflow-y-auto border-r border-slate-800 bg-[#020617]">
          <h1 className="text-2xl font-black text-white mb-6 tracking-tight">
            {problem.title}
          </h1>
          <div className="text-slate-400 leading-relaxed text-sm space-y-4">
            {problem.description.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </aside>

        <section className="flex-1 flex flex-col bg-[#010409]">
          <div className="flex-1">
            <Editor
              height="100%"
              theme="vs-dark"
              language={language}
              value={code}
              onChange={(v) => setCode(v ?? "")}
              options={{
                fontSize: 15,
                minimap: { enabled: false },
                padding: { top: 20 },
                fontFamily: "JetBrains Mono, Menlo, monospace",
                backgroundColor: "#010409",
              }}
            />
          </div>

          <div className="flex items-center justify-between px-8 py-6 border-t border-slate-800 bg-[#020617]">
            <div className="text-xs font-bold tracking-widest uppercase">
              {status && (
                <span
                  className={
                    status.includes("passing")
                      ? "text-emerald-400"
                      : "text-cyan-400"
                  }
                >
                  Status: {status}
                </span>
              )}
            </div>
            <button
              onClick={runCode}
              className="px-8 py-3 bg-white text-slate-950 rounded-xl font-black text-sm hover:bg-cyan-400 transition-all active:scale-95 shadow-lg"
            >
              RUN TESTS
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
