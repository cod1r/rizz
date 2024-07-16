import { useRef, useState, useEffect, useCallback } from "react";
import "./App.css";

function useAudio({ performFourier, submitted, cvs }: { performFourier: boolean, submitted: boolean, cvs: HTMLCanvasElement | null }) {
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
      let arr = new Float32Array(analyserNode.fftSize);
      mediaElementSrc.connect(analyserNode)
      audio.play().then(() => {
        audioContext.resume().then(() => {
          const draw = () => {
            if (!cvs) throw Error("cvs null")
            requestAnimationFrame(draw)
            analyserNode.getFloatTimeDomainData(arr)
            const xStep = cvs.width / arr.length
            const ctx = cvs.getContext("2d")
            if (!ctx) throw Error("ctx null")
            ctx.clearRect(0, 0, cvs.width, cvs.height)
            ctx.beginPath()
            ctx.strokeStyle = "rgb(254 243 199)"
            ctx.moveTo(0, cvs.height / 2)
            for (let i = 0; i < arr.length; ++i) {
              const y = cvs.height / 2 + -arr[i] * cvs.height
              ctx.lineTo(i * xStep, y)
            }
            ctx.stroke()
          }
          if (cvs) {
            requestAnimationFrame(draw)
          }
        })
      })
    }
  }, [performFourier, audio, audioContext, mediaElementSrc, cvs]);

  return audio;
}

function App() {
  const inputFile = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [performFourier, setPerformFourier] = useState(false);

  const audio = useAudio({ performFourier, submitted, cvs: canvasRef.current });
  const handleSubmit = useCallback((e: React.SyntheticEvent<HTMLInputElement>) => {
    setSubmitted(true);
    if (audio !== null) {
      audio.src = URL.createObjectURL(e.currentTarget.files![0]);
    }
  }, [audio])
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
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
          className="hidden"
          onInput={handleSubmit}
          ref={inputFile}
          type="file"
          id="fileInput"
          name="fileInput"
          accept=".mp3,.flac,.wav"
        />
      </div>
      <canvas ref={canvasRef} className="m-1 border-amber-100 border border-solid"></canvas>
    </div>
  );
}

export default App;
