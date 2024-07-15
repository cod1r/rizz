import { useRef, useState, useEffect, useCallback } from "react";
import "./App.css";

function useAudio({ performFourier, submitted }: { performFourier: boolean, submitted: boolean }) {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    setAudio(new Audio())
    setAudioContext(new AudioContext())
  }, [])

  useEffect(() => {
    if (submitted && audio && audioContext) {
      if (audio === null) throw Error("audio is null")
      audioContext.createMediaElementSource(audio);
    }
  }, [submitted]);

  useEffect(() => {
    if (performFourier && audio && audioContext) {
      if (audioContext === null) throw Error("audio context is null")
      let analyserNode = new AnalyserNode(audioContext);
      let arr = new Uint8Array(analyserNode.fftSize);
      console.log(audio, audio.duration)
    }
  }, [performFourier]);

  return audio;
}

function App() {
  const inputFile = useRef<HTMLInputElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [performFourier, setPerformFourier] = useState(false);

  const audio = useAudio({ performFourier, submitted });
  const handleSubmit = useCallback((e: React.SyntheticEvent<HTMLInputElement>) => {
    setSubmitted(true);
    if (audio !== null) {
      audio.src = URL.createObjectURL(e.currentTarget.files![0]);
    }
  }, [audio])
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div>
        <button
          style={{
            textAlign: "center",
          }}
          onClick={() => {
            if (submitted) {
              setPerformFourier(true)
              return;
            }
            if (inputFile.current === null) return;
            inputFile.current.click();
          }}
        >
          {submitted ? "Perform FT" : "Choose audio file"}
        </button>
        <input
          onInput={handleSubmit}
          ref={inputFile}
          style={{ display: "none" }}
          type="file"
          id="fileInput"
          name="fileInput"
          accept=".mp3,.flac,.wav"
        />
      </div>
    </div>
  );
}

export default App;
