import { useRef, useState, useEffect } from "react";
import "./App.css";

function useAudio(performFourier: boolean) {
  const audioContext = useRef<AudioContext | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioContext.current = new AudioContext();
    audio.current = new Audio();
    audioContext.current.createMediaElementSource(audio.current);
  }, []);

  useEffect(() => {
    if (performFourier) {
    }
  }, [performFourier]);

  return audio.current;
}

function App() {
  const inputFile = useRef<HTMLInputElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [performFourier, setPerformFourier] = useState(false);

  const audio = useAudio(performFourier);
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
          onInput={(e) => {
            setSubmitted(true);
            if (audio !== null) {
              audio.src = URL.createObjectURL(e.currentTarget.files![0]);
            }
          }}
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
