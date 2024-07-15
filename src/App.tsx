import { useRef, useState, useEffect, useCallback } from "react";
import "./App.css";

function useAudio({ performFourier, submitted }: { performFourier: boolean, submitted: boolean }) {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [mediaElementSrc, setMediaElementSource] = useState<MediaElementAudioSourceNode | null>(null)

  useEffect(() => {
    setAudio(new Audio())
    setAudioContext(new AudioContext())
  }, [])

  useEffect(() => {
    if (submitted && audio && audioContext) {
      setMediaElementSource(audioContext.createMediaElementSource(audio))
    }
  }, [submitted]);

  useEffect(() => {
    if (performFourier && audio && audioContext && mediaElementSrc) {
      let analyserNode = new AnalyserNode(audioContext);
      let arr = new Float32Array(analyserNode.frequencyBinCount);
      mediaElementSrc.connect(analyserNode)
      audio.play().then(() => {
        audioContext.resume().then(() => {
          setInterval(() => {
            console.log(audioContext.currentTime)
            analyserNode.getFloatFrequencyData(arr)
            for (let i = 0; i < arr.length; ++i) {
              console.log(arr[i])
            }
          }, 1000)
        })
      })
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
