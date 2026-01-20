# SpeakCode | nwHacks 2026

### **"Coding is only half the battle."**

In top-tier technical interviews, a passing test suite isn't enough. Engineers are expected to articulate complex logic, justify trade-offs, and maintain composure—all while the clock is ticking. **SpeakCode** is a multimodal practice platform that evaluates not just the code you write, but the way you explain it.

---

## The Challenge

Modern technical screenings have a "Communication Gap." Platforms like LeetCode focus entirely on syntax and Big O, ignoring the **verbal reasoning** that actually gets you the job. Companies look for:

- **Logic Articulation:** The ability to explain _why_ a Hashmap was chosen over a TreeMap.
- **Technical Clarity:** Explaining data structures clearly without losing focus on the implementation.
- **Acoustic Confidence:** Managing pacing, tone, and filler words under high-stress conditions.

---

## How it Works

SpeakCode uses a specialized AI pipeline to analyze your performance across two dimensions simultaneously:

### 1. The Content

- **Whisper Large-v3:** Transcribes your verbal reasoning with high fidelity, even with heavy technical jargon.
- **GPT-4 Intelligence:** Acts as a "Critical Interviewer" to grade your logic, algorithmic accuracy, and code efficiency against FAANG standards.

### 2. The Delivery

- **Signal Processing:** We use `librosa` and `parselmouth` to extract acoustic features like pitch variance (confidence), speech rate (pacing), and filler word density (clarity).

---

## Core Features

- **Live Pressure Simulation:** A minimal, high-stakes IDE designed to mimic real-world technical screenings.
- **Multimodal Feedback:** Get a holistic dashboard showing your **Communication Score** alongside your **Code Correctness**.
- **Logic vs. Syntax Analysis:** Our AI distinguishes between a "syntax error" and a "logic gap," giving you specific feedback on where your explanation failed.
- **Acoustic Metrics:** Visualize your speech patterns to identify where you sound hesitant or rushed.

---

## Technical Architecture

| Layer                 | Technologies                                      |
| --------------------- | ------------------------------------------------- |
| **Frontend**          | React 19, Vite, Tailwind CSS, Monaco Editor       |
| **Backend**           | Python (Flask), Node.js, WebSockets               |
| **AI/ML**             | OpenAI GPT-4, Whisper-1 (Speech-to-Text)          |
| **Signal Processing** | Librosa, Parselmouth (Praat-based pitch analysis) |
| **Infrastructure**    | Docker, Fly.io (Machine-based code execution)     |

---