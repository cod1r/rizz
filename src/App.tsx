import { useRef, useState, useEffect, useCallback } from "react";
import { createMp3Encoder } from "wasm-media-encoders";
import { motion } from "framer-motion"
import "./App.css";

function AudioSeekerVisual({ audioElement } : { audioElement: HTMLAudioElement | null }) {
  const [translateX, setTranslateX] = useState(0)
  useEffect(() => {
    setTranslateX(audioElement?.currentTime ?? 0 / 200)
  }, [audioElement, translateX, audioElement?.currentTime])
  return (
    <div className="h-px relative w-[200px] flex items-center m-2 border border-black-100">
      <div className="absolute">
        <motion.div
          drag="x"
          animate={{ x: translateX }}
          dragConstraints={{left: 0, right: 200}}
          dragElastic={false}
          dragMomentum={false}
          className="h-[20px] w-[10px] bg-black rounded"
          onDrag={(_, info) => {
            if (!audioElement) return
            const ratio = info.offset.x / 200
            audioElement.currentTime = ratio * audioElement.duration
          }}
        ></motion.div>
      </div>
    </div>
  );
}

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
  const [offlineAudioContext, setOfflineAudioContext] =
    useState<OfflineAudioContext | null>(null);

  useEffect(() => {
    const newAudio = new Audio();
    setAudio(newAudio);
    const newAudioContext = new AudioContext();
    setAudioContext(newAudioContext);
    function canPlayHandler() {
      const offlineAudioContext = new OfflineAudioContext({
        numberOfChannels: 2,
        length: newAudioContext.sampleRate * newAudio.duration,
        sampleRate: newAudioContext.sampleRate,
      });
      setOfflineAudioContext(offlineAudioContext);
    }
    newAudio.addEventListener("canplay", canPlayHandler)
    return () => {
      newAudio.removeEventListener("canplay", canPlayHandler)
      audioContext?.close();
    };
  }, []);

  useEffect(() => {
    if (audio && analyserNode && playAudio && audioContext && mediaElementSrc) {
      mediaElementSrc.connect(analyserNode).connect(audioContext.destination);
      audio
        .play()
        .then(() => {
          let arr = new Float32Array(analyserNode.fftSize);
          const draw = () => {
            if (!cvs) throw Error("cvs null");
            requestAnimationFrame(draw);
            analyserNode.getFloatTimeDomainData(arr);
            const xStep = cvs.width / arr.length;
            const ctx = cvs.getContext("2d");
            if (!ctx) throw Error("ctx null");
            ctx.clearRect(0, 0, cvs.width, cvs.height);
            ctx.beginPath();
            ctx.strokeStyle = "black";
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
        })
        .catch((e) => console.error(e));
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
      audioContext.resume().catch((e) => console.error(e));
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
      let frequencyData = new Float32Array(analyserNode.frequencyBinCount);
      setInterval(() => {
        analyserNode.getFloatFrequencyData(frequencyData);
        console.log(frequencyData);
      }, 500);
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
      <div className="min-w-fit">
        <div className="flex flex-col">
          <button
            className="p-1 text-center m-1 border border-solid border-black-100"
            onClick={() => {
              if (submitted) {
                if (playAudio) {
                  setPlayAudio(false);
                } else {
                  setPlayAudio(true);
                }
              }
            }}
            disabled={!submitted}
          >
            {submitted ? (!playAudio ? "Play" : "Pause") : "No audio to play"}
          </button>
          <button
            className="p-1 text-center m-1 border border-solid border-black-100"
            onClick={() => {
              if (submitted) {
                if (loopAudio) {
                  setLoopAudio(false);
                } else {
                  setLoopAudio(true);
                }
              }
            }}
            disabled={!submitted}
          >
            {submitted
              ? loopAudio
                ? "Don't loop"
                : "Loop"
              : "No audio to loop"}
          </button>
          <button
            className="p-1 text-center m-1 border border-solid border-black-100"
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
        <AudioSeekerVisual audioElement={audio}/>
      </div>
      <canvas
        ref={canvasRef}
        className="m-1 border-black-100 border border-solid"
      ></canvas>
    </div>
  );
}

export default App;
