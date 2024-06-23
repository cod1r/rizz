import { useRef, useState, useEffect } from "react";
import "./App.css";

function useAudio({ performFourier, submitted }: { performFourier: boolean, submitted: boolean }) {
  const audioContext = useRef<AudioContext | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audio.current = new Audio();
  }, [])

  useEffect(() => {
    if (submitted) {
      audioContext.current = new AudioContext();
      audioContext.current.createMediaElementSource(audio.current!);
    }
  }, [submitted]);

  useEffect(() => {
    if (performFourier) {
      let analyserNode = new AnalyserNode(audioContext.current!);
      let floatArr = new Float32Array(analyserNode.fftSize);
      analyserNode.getFloatFrequencyData(floatArr);
      for (let i = 0; i < floatArr.length; ++i) {
        console.log(floatArr[i])
      }
    }
  }, [performFourier]);

  return audio.current;
}

function App() {
  const inputFile = useRef<HTMLInputElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [performFourier, setPerformFourier] = useState(false);

  const audio = useAudio({ performFourier, submitted });
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
