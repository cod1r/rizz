import { useRef, useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getPlaying,
  getLooping,
  getPerformFourier,
  getSubmitted,
  setPerformFourier,
  setSubmitted,
} from "./store";
import { AudioControls } from "./AudioControls";
import { TimeDomainVisual } from "./TimeDomainVisual"
import WavEncoder from "wav-encoder";
import "./App.css";

function useAudio() {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [mediaElementSrc, setMediaElementSource] =
    useState<MediaElementAudioSourceNode | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [offlineAudioContext, setOfflineAudioContext] =
    useState<OfflineAudioContext | null>(null);

  const submitted = useSelector(getSubmitted);
  const performFourier = useSelector(getPerformFourier);
  const playing = useSelector(getPlaying);
  const looping = useSelector(getLooping);

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
    newAudio.addEventListener("canplay", canPlayHandler);
    return () => {
      newAudio.removeEventListener("canplay", canPlayHandler);
      audioContext?.close();
    };
  }, []);

  useEffect(() => {
    if (audio && audioContext && offlineAudioContext) {
      fetch(audio.src)
        .then((res) => res.arrayBuffer())
        .then((arr) => audioContext.decodeAudioData(arr))
        .then(
          (decodedBuffer) =>
            new AudioBufferSourceNode(offlineAudioContext, {
              buffer: decodedBuffer,
            }),
        )
        .then((sourceNode) => {
          sourceNode.start();
          sourceNode.connect(offlineAudioContext.destination);
        });
    }
  }, [audio, audioContext, offlineAudioContext]);

  useEffect(() => {
    if (audio) {
      if (!playing) {
        audio.pause();
      } else {
        audio.play();
      }
    }

    if (audio) {
      audio.loop = looping;
    }
  }, [playing, looping])

  useEffect(() => {
    if (submitted && audio && audioContext) {
      const newMediaElementSrc = audioContext.createMediaElementSource(audio);
      setMediaElementSource(newMediaElementSrc);
      const newAnalyserNode = new AnalyserNode(audioContext)
      setAnalyserNode(newAnalyserNode);
      newMediaElementSrc.connect(newAnalyserNode).connect(audioContext.destination);
      audioContext.resume().catch((e) => console.error(e));
    }
  }, [submitted]);

  useEffect(() => {
    if (
      performFourier &&
      audio &&
      audioContext &&
      mediaElementSrc &&
      analyserNode &&
      offlineAudioContext
    ) {
      //let frequencyData = new Float32Array(analyserNode.frequencyBinCount);
      //setInterval(() => {
      //  analyserNode.getFloatFrequencyData(frequencyData);
      //  console.log(frequencyData);
      //}, 500);
      offlineAudioContext.startRendering().then((buffer) => {
        const input = {
          sampleRate: offlineAudioContext.sampleRate,
          channelData: [
            buffer.getChannelData(0),
            buffer.getChannelData(1)
          ]
        }
        WavEncoder.encode(input).then(encoded => {
          const file = new File([encoded], "output.wav")
          const anchor = document.createElement("a")
          anchor.href = URL.createObjectURL(file)
          anchor.download = "output.wav"
          anchor.click()
        })
      });
    }
  }, [
    performFourier,
    audio,
    audioContext,
    mediaElementSrc,
    offlineAudioContext,
  ]);

  return { audio, analyserNode };
}

function App() {
  const inputFile = useRef<HTMLInputElement>(null);
  const submitted = useSelector(getSubmitted);
  const d = useDispatch();

  const { audio, analyserNode } = useAudio();

  const handleSubmit = useCallback(
    (e: React.SyntheticEvent<HTMLInputElement>) => {
      d(setSubmitted(true));
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
          <AudioControls audio={audio} />
          <button
            className="p-1 text-center m-1 border border-solid border-black-100"
            onClick={() => {
              if (submitted) {
                d(setPerformFourier(true));
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
      <TimeDomainVisual audio={audio} analyserNode={analyserNode} />
    </div>
  );
}

export default App;
