from pydub import AudioSegment
import torch
import io


def audio_to_text(audio_file, processor, model, chunk_seconds=20):
    audio_bytes = audio_file.read()

    audio_segment = AudioSegment.from_file(io.BytesIO(audio_bytes))
    audio_segment = audio_segment.set_frame_rate(16000).set_channels(1)

    transcript_parts = []

    # Split into chunks
    for i in range(0, len(audio_segment), chunk_seconds * 1000):
        chunk = audio_segment[i:i + chunk_seconds * 1000]
        samples = chunk.get_array_of_samples()
        audio_tensor = torch.tensor(samples).float() / 32768.0

        input_features = processor(
            audio_tensor,
            sampling_rate=16000,
            return_tensors="pt"
        ).input_features

        # Move features to GPU
        input_features = input_features.to("cuda")

        predicted_ids = model.generate(input_features)
        text = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]

        transcript_parts.append(text)

    transcript = " ".join(transcript_parts)
    print(transcript)
    return transcript


if __name__ == "__main__":
    audio_file = open("sample_audio.mp3", "rb")