import os
from dotenv import load_dotenv
import requests
import json
import librosa
import parselmouth
import numpy as np
import io


# CONSTANTS
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PROMPTS = json.load(open("prompts.json", "r"))


# REQUEST HEADERS
headers = {
    "Authorization": f"Bearer {OPENAI_API_KEY}",
    "Content-Type": "application/json"
}


# PIPELINE FUNCTIONS
def transcript_to_grade(transcript, problem_description):
    prompt_template = PROMPTS.get("transcript-to-grade", "")
    prompt = prompt_template.replace("{transcript}", transcript).replace("{problem_description}", problem_description)

    payload = {
        "model": "gpt-4.1",
        "input": prompt
    }

    response = requests.post(
        "https://api.openai.com/v1/responses",
        json=payload,
        headers=headers
    )

    output_text = response.json()["output"][0]["content"][0]["text"]
    return output_text

def audio_to_transcript(audio_file):
    files = {
        "file": (audio_file.name, audio_file, "audio/mpeg")
    }
    data = {
        "model": "whisper-1"
    }
    response = requests.post(
        "https://api.openai.com/v1/audio/transcriptions",
        headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
        files=files,
        data=data
    )
    transcript = response.json()["text"]
    return transcript


def extract_audio_features(audio_file, transcript_text):
    audio_bytes = audio_file.read()
    audio_buffer = io.BytesIO(audio_bytes)

    y, sr = librosa.load(audio_buffer, sr=16000)

    # Speech Rate
    duration_seconds = librosa.get_duration(y=y, sr=sr)
    word_count = len(transcript_text.split())
    wpm = (word_count / duration_seconds) * 60

    # Pauses
    rms = librosa.feature.rms(y=y)[0]
    frames = range(len(rms))
    times = librosa.frames_to_time(frames, sr=sr)

    silence_threshold = np.mean(rms) * 0.3

    silent_frames = rms < silence_threshold
    silent_times = times[silent_frames]

    pause_duration = len(silent_times) * (times[1] - times[0])
    pause_rate = len(silent_times) / duration_seconds

    # Pitch
    snd = parselmouth.Sound(y.astype(np.float64), sr)
    pitch = snd.to_pitch()

    pitch_values = pitch.selected_array['frequency']
    pitch_values = pitch_values[pitch_values != 0]

    pitch_mean = float(np.mean(pitch_values))
    pitch_std = float(np.std(pitch_values))

    # Energy
    energy_mean = float(np.mean(rms))
    energy_std = float(np.std(rms))

    # Filler words
    fillers = ["um", "uh", "like", "you know", "so", "actually"]
    transcript_lower = transcript_text.lower()

    filler_count = sum(transcript_lower.count(f) for f in fillers)

    return {
        "duration_seconds": duration_seconds,
        "wpm": wpm,
        "pause_duration": pause_duration,
        "pause_rate": pause_rate,
        "pitch_mean": pitch_mean,
        "pitch_std": pitch_std,
        "energy_mean": energy_mean,
        "energy_std": energy_std,
        "filler_count": filler_count
    }

def grade_code(code_snippet, problem_description):
    prompt_template = PROMPTS.get("code-to-grade", "")
    prompt = prompt_template.replace("{code_snippet}", code_snippet).replace("{problem_description}", problem_description)

    payload = {
        "model": "gpt-4.1",
        "input": prompt
    }

    response = requests.post(
        "https://api.openai.com/v1/responses",
        json=payload,
        headers=headers
    )

    output_text = response.json()["output"][0]["content"][0]["text"]
    return output_text

def grade_submission(audio_file, code_snippet, problem_description):
    transcript = audio_to_transcript(audio_file)
    audio_features = normalize_audio_features(extract_audio_features(audio_file, transcript))
    transcript_grade = transcript_to_grade(transcript, problem_description)
    code_grade = grade_code(code_snippet, problem_description)

    final_evaluation = {
        "transcript": transcript,
        "audio_features": audio_features,
        "transcript_grade": transcript_grade,
        "code_grade": code_grade
    }

    return final_evaluation


# HELPERS
def normalize_audio_features(audio_features):
    pitch_score = max(0, min(100, 100 - abs(150 - audio_features["pitch_mean"]) - audio_features["pitch_std"]))
    energy_score = max(0, min(100, 100 - abs(0.1 - audio_features["energy_mean"] * 10) - audio_features["energy_std"] * 10))
    confidence_score = (pitch_score + energy_score) / 2

    wpm_score = max(0, min(100, 100 - abs(130 - audio_features["wpm"])))
    pause_score = max(0, min(100, 100 - audio_features["pause_rate"] * 100))
    filler_score = max(0, min(100, 100 - audio_features["filler_count"] * 10))
    clarity_score = (wpm_score + pause_score + filler_score) / 3

    return {
        "confidence_score": confidence_score,
        "clarity_score": clarity_score
    }


# MAIN
if __name__ == "__main__":
    audio_path = "C:\\Users\\arman\\Downloads\\Leetcode two sum solution explained - coding interviews challenge.mp3"
    transcript = audio_to_transcript(open(audio_path, "rb"))

    features = extract_audio_features(open(audio_path, "rb"), transcript)
    print(features)
