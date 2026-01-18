import os
from dotenv import load_dotenv
import requests
import json
import librosa
import parselmouth
import numpy as np


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

def audio_to_text(audio_file):
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


def extract_audio_features(audio_path, transcript_text):
    y, sr = librosa.load(audio_path, sr=16000)

    # ----------------------------
    # 1. Speech Rate (wpm)
    # ----------------------------
    duration_seconds = librosa.get_duration(y=y, sr=sr)
    word_count = len(transcript_text.split())
    wpm = (word_count / duration_seconds) * 60

    # ----------------------------
    # 2. Pauses (silence detection)
    # ----------------------------
    # Use RMS energy to find silent segments
    rms = librosa.feature.rms(y=y)[0]
    frames = range(len(rms))
    times = librosa.frames_to_time(frames, sr=sr)

    # Silence threshold (tweak if needed)
    silence_threshold = np.mean(rms) * 0.3

    silent_frames = rms < silence_threshold
    silent_times = times[silent_frames]

    # Pause duration estimate
    pause_duration = len(silent_times) * (times[1] - times[0])
    pause_rate = len(silent_times) / duration_seconds

    # ----------------------------
    # 3. Pitch (Praat via parselmouth)
    # ----------------------------
    snd = parselmouth.Sound(audio_path)
    pitch = snd.to_pitch()

    pitch_values = pitch.selected_array['frequency']
    pitch_values = pitch_values[pitch_values != 0]  # remove zeros

    pitch_mean = float(np.mean(pitch_values))
    pitch_std = float(np.std(pitch_values))

    # ----------------------------
    # 4. Energy
    # ----------------------------
    energy_mean = float(np.mean(rms))
    energy_std = float(np.std(rms))

    # ----------------------------
    # 5. Filled Pauses
    # ----------------------------
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


# MAIN
if __name__ == "__main__":
    pass