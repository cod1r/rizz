import { useRef, useState, useEffect, useCallback } from "react";
import { createMp3Encoder } from "wasm-media-encoders";
import "./App.css";

function useAudio({
  performFourier,
  submitted,
  cvs,
  playAudio,
  loopAudio,
}: {
  performFourier: boolean;
  submitted: boolean;
  cvs: HTMLCanvasElement | null;
  playAudio: boolean;
  loopAudio: boolean;
}) {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [mediaElementSrc, setMediaElementSource] =
    useState<MediaElementAudioSourceNode | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  useEffect(() => {
    setAudio(new Audio());
    setAudioContext(new AudioContext());
  }, []);

  useEffect(() => {
    if (analyserNode && playAudio && audioContext) {
      analyserNode.connect(audioContext.destination);
    }

    if (audio && !playAudio) {
      audio.pause();
    }

    if (audio) {
      audio.loop = loopAudio;
    }
  }, [playAudio, loopAudio]);

  useEffect(() => {
    if (submitted && audio && audioContext) {
      setMediaElementSource(audioContext.createMediaElementSource(audio));
      setAnalyserNode(new AnalyserNode(audioContext));
    }
  }, [submitted]);

  useEffect(() => {
    if (
      performFourier &&
      audio &&
      audioContext &&
      mediaElementSrc &&
      analyserNode
    ) {
      let arr = new Float32Array(analyserNode.fftSize);
      let frequencyData = new Float32Array(analyserNode.frequencyBinCount);
      setInterval(() => {
        console.log(frequencyData);
      }, 500);
      mediaElementSrc.connect(analyserNode);
      audio.play().then(() => {
        audioContext.resume().then(() => {
          const draw = () => {
            if (!cvs) throw Error("cvs null");
            requestAnimationFrame(draw);
            analyserNode.getFloatTimeDomainData(arr);
            analyserNode.getFloatFrequencyData(frequencyData);
            const xStep = cvs.width / arr.length;
            const ctx = cvs.getContext("2d");
            if (!ctx) throw Error("ctx null");
            ctx.clearRect(0, 0, cvs.width, cvs.height);
            ctx.beginPath();
            ctx.strokeStyle = "rgb(254 243 199)";
            ctx.moveTo(0, cvs.height / 2);
            for (let i = 0; i < arr.length; ++i) {
              const y = cvs.height / 2 + -arr[i] * cvs.height;
              ctx.lineTo(i * xStep, y);
            }
            ctx.stroke();
          };
          if (cvs) {
            requestAnimationFrame(draw);
          }
        });
      });
    }
  }, [performFourier, audio, audioContext, mediaElementSrc, cvs]);

  return audio;
}

function App() {
  const inputFile = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [performFourier, setPerformFourier] = useState(false);
  const [playAudio, setPlayAudio] = useState(false);
  const [loopAudio, setLoopAudio] = useState(false);

  const audio = useAudio({
    performFourier,
    submitted,
    cvs: canvasRef.current,
    playAudio,
    loopAudio,
  });
  const handleSubmit = useCallback(
    (e: React.SyntheticEvent<HTMLInputElement>) => {
      setSubmitted(true);
      if (audio !== null) {
        audio.src = URL.createObjectURL(e.currentTarget.files![0]);
      }
    },
    [audio],
  );
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div>
        <div className="flex flex-col">
          <button
            style={{
              textAlign: "center",
            }}
            onClick={() => {
              if (submitted) {
                if (playAudio) {
                  setPlayAudio(false);
                } else {
                  setPlayAudio(true);
                }
              }
            }}
          >
            {submitted ? (audio?.paused ? "Play":"Pause") : "No audio to play"}
          </button>
          <button
            style={{
              textAlign: "center",
            }}
            onClick={() => {
              if (submitted) {
                if (loopAudio) {
                  setLoopAudio(false);
                } else {
                  setLoopAudio(true);
                }
              }
            }}
          >
            {submitted ? (loopAudio ? "Don't loop":"loop") : "No audio to loop"}
          </button>
          <button
            style={{
              textAlign: "center",
            }}
            onClick={() => {
              if (submitted) {
                setPerformFourier(true);
                return;
              }
              if (inputFile.current === null) return;
              inputFile.current.click();
            }}
          >
            {submitted ? "Perform FT" : "Choose audio file"}
          </button>
        </div>
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
      <canvas
        ref={canvasRef}
        className="m-1 border-amber-100 border border-solid"
      ></canvas>
    </div>
  );
}

export default App;
