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

function LinearMeter({
  label,
  value,
  max = 100,
}: {
  label: string;
  value: number;
  max?: number;
}) {
  const percent = Math.min((value / max) * 100, 100);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs uppercase tracking-widest text-slate-400">
        <span>{label}</span>
        <span>{Math.round(value)}</span>
      </div>

      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-cyan-400 transition-all duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}


function CircularMeter({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(value, 0), 100);
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="56"
            cy="56"
            r={radius}
            strokeWidth="10"
            className="text-slate-700"
            stroke="currentColor"
            fill="none"
          />
          <circle
            cx="56"
            cy="56"
            r={radius}
            strokeWidth="10"
            strokeLinecap="round"
            className="text-cyan-400 transition-all duration-700"
            stroke="currentColor"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-black text-white">
            {Math.round(progress)}
          </span>
        </div>
      </div>

      <span className="text-xs uppercase tracking-widest text-slate-400">
        {label}
      </span>
    </div>
  );
}


export default function ProblemRunnerPage() {

  const [isGrading, setIsGrading] = useState(false);


  const codeRef = useRef("");



  const { problemId } = useParams<{ problemId: string }>();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("java");
  const [status, setStatus] = useState<string | null>(null);

  const [sidebarWidth, setSidebarWidth] = useState(450);
  const [isResizing, setIsResizing] = useState(false);
  const [isFolded, setIsFolded] = useState(false);

  const lastWidth = useRef(450);
  const wsRef = useRef<WebSocket | null>(null);

  /* ------------------ AUDIO RECORDING ------------------ */
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // score meters
  // interface CodeGrade {
  //   convention_score: number;
  //   correctness_score: number;
  //   efficiency_score: number;
  // }
  
  interface GradeResult {
  code_grade: {
    convention_score: number;
    correctness_score: number;
    efficiency_score: number;
  };
  audio_grade: {
    clarity_score: number;
    confidence_score: number;
    speed: number;
  };
  transcript_grade: {
    accuracy_score: number;
    coherence_score: number;
    complexity_score: number;
    confidence_score: number;
    terminology_score: number;
  };
}




  // const [gradeResult, setGradeResult] = useState<CodeGrade | null>(null);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null);

  



  // 
  useEffect(() => {
    codeRef.current = code;
  }, [code]);



  /* ------------------ LOAD PROBLEM ------------------ */
  useEffect(() => {
    setProblem(MOCK_PROBLEM);
    setCode(MOCK_PROBLEM.starterCode);
    setLanguage(MOCK_PROBLEM.language);
  }, [problemId]);

  /* ------------------ AUTO RECORD ------------------ */
  useEffect(() => {
    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = e => audioChunksRef.current.push(e.data);

        // recorder.onstop = () => {
        //   const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        //   audioChunksRef.current = [];
        //   console.log("Recording finished:", audioBlob);
        //   // lets make an api request, include the problem description, the code they wrote, and the audio recording, this request is going to 
        //   // https://ai-audio-microservice/grade 
        // };

        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          audioChunksRef.current = [];

          try {
            setIsGrading(true);

            const formData = new FormData();
            formData.append("file", audioBlob, "explanation.webm");
            formData.append("problem_description", MOCK_PROBLEM.description ?? "");
            // formData.append("code_snippet", code);
            formData.append("code_snippet", codeRef.current); // use the ref cuz full stack developer gang

            // console.log("code snippet who?", code)

            const res = await fetch("http://<audio-service-url>grade", {
              method: "POST",
              body: formData,
            });

            const result = await res.json();
            console.log("Grade response:", result);

            // const result = await res.json();

            const codeGrade = result?.message?.code_grade;
            if (codeGrade) {
              setGradeResult({
  code_grade: result.message.code_grade,
  audio_grade: result.message.audio_grade,
  transcript_grade: result.message.transcript_grade,
});
              setShowGradeModal(true);
            }


          } catch (err) {
            console.error("Grading request failed:", err);
          } finally {
            setIsGrading(false);
          }
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

  /* ------------------ SIDEBAR RESIZE ------------------ */
  useEffect(() => {
    const resize = (e: MouseEvent) => {
      if (!isResizing) return;
      if (e.clientX > 300 && e.clientX < window.innerWidth * 0.7) {
        setSidebarWidth(e.clientX);
        lastWidth.current = e.clientX;
      }
    };
    const stop = () => setIsResizing(false);

    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stop);
    }

    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stop);
    };
  }, [isResizing]);

  /* ------------------ RUN CODE ------------------ */
  async function runCode() {
    const activeId = problem?.id || "java-two-sum";
    setStatus("Booting Runner...");

    const res = await fetch(`https://<problems-service-url>/run/${activeId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language, code }),
    });

    const { job_id } = await res.json();

    const ws = new WebSocket(`wss://<problem-service-url>?job_id=${job_id}`);
    wsRef.current = ws;

    ws.onmessage = ev => {
      const msg = JSON.parse(ev.data);

      if (msg.type === "status") setStatus(msg.state);

      if (msg.type === "result") {
        setStatus(msg.status);

        if (msg.status.includes("passing")) {
          if (mediaRecorderRef.current?.state !== "inactive") {
            mediaRecorderRef.current?.stop();
          }
        }
        ws.close();
      }
    };

    ws.onerror = () => setStatus("WebSocket error");
  }

  if (!problem) return null;

  return (

    <div className="h-screen w-screen flex flex-col bg-[#020617] text-slate-300 overflow-hidden">
      {isGrading && (

        <div className="min-h-screen flex items-center justify-center text-center">
          <div role="status">
            <svg
              aria-hidden="true"
              className="inline w-8 h-8 text-neutral-tertiary animate-spin fill-brand"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        </div>


      )}

      {/* HEADER */} {(<div className={isGrading ? "hidden" : ""}>

        <nav className="z-50 flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#020617]">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="text-xl font-black text-white tracking-tighter hover:text-cyan-400"
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
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-400"
            >
              <svg
                className={`w-6 h-6 transition-transform ${isFolded ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </nav>
        {/* MAIN */}
        <div className="flex-1 flex overflow-hidden">
          {/* SIDEBAR */}
          <aside
            style={{ width: sidebarWidth }}
            className={`border-r border-slate-800 bg-[#020617] overflow-y-auto transition-[width] duration-75 ${isFolded ? "border-none" : ""}`}
          >
            {!isFolded && (
              <div className="p-8 min-w-[350px]">
                <h1 className="text-2xl font-black text-white mb-6">
                  {problem.title}
                </h1>
                <div className="text-sm leading-relaxed whitespace-pre-wrap text-slate-400">
                  {problem.description}
                </div>
              </div>
            )}
          </aside>

          {!isFolded && (
            <div
              onMouseDown={() => setIsResizing(true)}
              className="w-1 cursor-col-resize hover:bg-cyan-500/50"
            />
          )}

          {/* EDITOR */}
          <section className="flex-1 flex flex-col bg-[#010409] min-w-0">
            <div className="flex-1">
              <Editor
                height="100%"
                theme="vs-dark"
                language={language}
                value={code}
                onChange={v => setCode(v ?? "")}
                options={{
                  fontSize: 15,
                  minimap: { enabled: false },
                  automaticLayout: true,
                  padding: { top: 20 },
                  fontFamily: "JetBrains Mono, Menlo, monospace",
                }}
              />
            </div>

            {/* ACTION BAR */}
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

      </div>)}

     {showGradeModal && gradeResult && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <div className="bg-[#020617] border border-slate-800 rounded-2xl p-10 w-[720px] shadow-2xl max-h-[90vh] overflow-y-auto">

      <h2 className="text-2xl font-black text-white mb-10 text-center">
        Evaluation Report
      </h2>

      {/* CODE SECTION */}
      <section className="mb-12">
        <h3 className="text-sm font-black uppercase tracking-widest text-cyan-400 mb-6">
          Code Quality
        </h3>

        <div className="flex justify-between">
          <CircularMeter
            value={gradeResult.code_grade.correctness_score}
            label="Correctness"
          />
          <CircularMeter
            value={gradeResult.code_grade.efficiency_score}
            label="Efficiency"
          />
          <CircularMeter
            value={gradeResult.code_grade.convention_score}
            label="Conventions"
          />
        </div>
      </section>

      {/* AUDIO SECTION */}
      <section className="mb-12">
        <h3 className="text-sm font-black uppercase tracking-widest text-cyan-400 mb-6">
          Speech Delivery
        </h3>

        <div className="space-y-4">
          <LinearMeter
            label="Clarity"
            value={gradeResult.audio_grade.clarity_score}
          />
          <LinearMeter
            label="Confidence"
            value={gradeResult.audio_grade.confidence_score}
          />
          <LinearMeter
            label="Speaking Speed"
            value={gradeResult.audio_grade.speed}
            max={5}
          />
        </div>
      </section>

      {/* TRANSCRIPT SECTION */}
      <section className="mb-12">
        <h3 className="text-sm font-black uppercase tracking-widest text-cyan-400 mb-6">
          Explanation Quality
        </h3>

        <div className="space-y-4 opacity-80">
          <LinearMeter
            label="Accuracy"
            value={gradeResult.transcript_grade.accuracy_score}
          />
          <LinearMeter
            label="Coherence"
            value={gradeResult.transcript_grade.coherence_score}
          />
          <LinearMeter
            label="Complexity"
            value={gradeResult.transcript_grade.complexity_score}
          />
          <LinearMeter
            label="Terminology"
            value={gradeResult.transcript_grade.terminology_score}
          />
          <LinearMeter
            label="Knowledgeability"
            value={gradeResult.transcript_grade.confidence_score}
          />
        </div>
      </section>

      <div className="flex justify-center">
        <button
          onClick={() => setShowGradeModal(false)}
          className="px-8 py-3 rounded-xl bg-white text-slate-950 font-black text-sm hover:bg-cyan-400 transition-all"
        >
          CLOSE
        </button>
      </div>
    </div>
  </div>
)}




    </div>
  );
}
