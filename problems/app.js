import express from "express";
import { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";
import http from "http";
import fetch from "node-fetch";
import cors from "cors";




/* ------------------ CONFIG ------------------ */

const PORT = 3000;

const MAX_CODE_SIZE = 100_000;
const POLL_INTERVAL_MS = 5000;
const JOB_TIMEOUT_MS = 60_000;

const FLY_APP = "nwhacks-runner";
const FLY_API = "https://api.machines.dev/v1";
const FLY_TOKEN = process.env.FLY_API_TOKEN;
const MACHINE_IMAGE_BASE = "registry.fly.io/nwhacks-runner:";


/* ------------------ APP SETUP ------------------ */

const app = express();

app.use(cors({
    origin: [
        "http://localhost:5173",      // dev frontend (Vite)
        "http://localhost:3000",      // same-origin if needed
        "https://speakcode.fly.dev"      // prod frontend
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(express.json({ limit: "200kb" }));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

/* ------------------ WS JOB MAP ------------------ */

const sockets = new Map(); // jobId -> ws

wss.on("connection", (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const jobId = url.searchParams.get("job_id");

    if (!jobId) {
        ws.close();
        return;
    }

    sockets.set(jobId, ws);

    ws.on("close", () => {
        sockets.delete(jobId);
    });
});

/* ------------------ HELPERS ------------------ */

function send(jobId, msg) {
    const ws = sockets.get(jobId);
    if (ws && ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(msg));
    }
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

/* ------------------ FLY API ------------------ */

async function flyFetch(path, options = {}) {
    const res = await fetch(`${FLY_API}${path}`, {
        ...options,
        headers: {
            Authorization: `Bearer ${FLY_TOKEN}`,
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Fly API ${res.status}: ${text}`);
    }

    return res.json();
}
/**
 * look at me adding jsdocs, maybe ill do all of them who knows
 * @param {*} env # environement variables on machine
 * @param {string} image_version #should name the specific test runner wanted 
 * @returns 
 */
async function createFlyMachine(env, image_version) {
    const body = {
        name: `job-${uuidv4()}`,
        region: "ord",
        config: {
            image: MACHINE_IMAGE_BASE+image_version,
            env,
            restart: { policy: "no" },
            auto_destroy: true,
            guest: {
                cpu_kind: "shared",
                cpus: 1,
                memory_mb: 256
            }
        }
    };

    const machine = await flyFetch(`/apps/${FLY_APP}/machines`, {
        method: "POST",
        body: JSON.stringify(body)
    });

    return machine.id;
}

async function getFlyMachine(machineId) {
    return flyFetch(`/apps/${FLY_APP}/machines/${machineId}`);
}

/* ------------------ ROUTES ------------------ */

app.post("/run/:problemId", async (req, res) => {
    const submit = req.query.submit === "true";
    const { language, code } = req.body;
    const { problemId } = req.params;

    if (!language || !code || code.length > MAX_CODE_SIZE) {
        return res.status(400).json({ error: "Invalid input" });
    }

    const jobId = uuidv4();
    res.json({ job_id: jobId });

    runJob(jobId, problemId, language, code, submit)
        .catch(err => {
            console.error(err);
            send(jobId, { type: "error", message: "internal error" });
        });
});

/* ------------------ JOB RUNNER ------------------ */

function extractExitCode(machine) {
  if (!Array.isArray(machine.events)) return null;

  const exitEvent = [...machine.events]
    .reverse()
    .find(e => e.type === "exit" && e.request?.exit_event);

  return exitEvent?.request.exit_event.exit_code ?? null;
}



async function runJob(jobId, problemId, language, code, submit) {
    send(jobId, { type: "status", state: "started" });

    const machineId = await createFlyMachine({
        USER_CODE_B64: Buffer.from(code).toString("base64"),
        PROBLEM_ID: problemId,
        LANGUAGE: language,
        MODE: submit ? "submit" : "test"
    }, problemId);

    const start = Date.now();

    while (true) {
        await sleep(POLL_INTERVAL_MS);

        const machine = await getFlyMachine(machineId);


        if (machine.state === "stopped" || machine.state === "destroyed") {
            const exitCode = extractExitCode(machine)
            const passed = exitCode === 0;

            console.log(passed ? "all tests passing" : "not passing")
            console.log(machine)

            send(jobId, {
                type: "result",
                status: passed ? "all tests passing" : "not passing",
                exit_code: exitCode
            });

            //   await destroyFlyMachine(machineId);
            return;
        }

        // console.log(machine)


        if (Date.now() - start > JOB_TIMEOUT_MS) {
            send(jobId, {
                type: "result",
                status: "timeout"
            });

            return;
        }
    }
}

/* ------------------ START ------------------ */

server.listen(PORT, () => {
    console.log(`Runner API listening on :${PORT}`);
});
