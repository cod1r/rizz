import { useDispatch, useSelector } from "react-redux";
import {
  getPlaying,
  getLooping,
  getSubmitted,
  setPlaying,
  setLooping,
} from "./store";
import { useRef } from "react";
import { useAnimationFrame, motion } from "framer-motion";

function VolumeSeekerVisual({
  audioElement,
}: {
  audioElement: HTMLAudioElement | null;
}) {
  const seekerRef = useRef<HTMLDivElement | null>(null);
  const displayRef = useRef<HTMLDivElement | null>(null);
  const submitted = useSelector(getSubmitted);
  useAnimationFrame(() => {
    if (seekerRef.current) {
      if (!audioElement || !submitted) {
        return;
      }
      seekerRef.current.style.transform = `translateX(${audioElement.volume * 200}px)`;
      if (displayRef.current) {
        displayRef.current.innerHTML = `${Math.floor(audioElement.volume * 100)}%`;
      }
    }
  });
  if (!audioElement) return null;
  return (
    <div className="">
      <div className="h-px relative w-[200px] flex items-center m-2 border border-black-100">
        <motion.div
          ref={seekerRef}
          initial={{ x: audioElement.volume * 200 }}
          drag={submitted ? "x" : undefined}
          dragConstraints={{ left: 0, right: 200 }}
          dragElastic={false}
          dragMomentum={false}
          className="h-[20px] w-[10px] bg-black rounded"
          onUpdate={({ x }: { x: number }) => {
            if (!audioElement) return;
            audioElement.volume = x / 200;
          }}
        ></motion.div>
      </div>
      <div className="m-1 text-center" ref={displayRef}></div>
    </div>
  );
}

function AudioSeekerVisual({
  audioElement,
}: {
  audioElement: HTMLAudioElement | null;
}) {
  const seekerRef = useRef<HTMLDivElement | null>(null);
  const displayRef = useRef<HTMLDivElement | null>(null);
  const submitted = useSelector(getSubmitted);
  useAnimationFrame(() => {
    if (seekerRef.current) {
      if (!audioElement || !submitted) {
        return;
      }
      const ratio = audioElement.currentTime / audioElement.duration;
      seekerRef.current.style.transform = `translateX(${ratio * 200}px)`;
      const seconds = String(Math.floor(audioElement.currentTime % 60) % 100);
      if (displayRef.current) {
        displayRef.current.innerHTML = `${Math.floor(audioElement.currentTime / 60)}:${seconds.length > 1 ? seconds : `0${seconds}`}`;
      }
    }
  });
  if (!audioElement) return null;
  return (
    <div className="">
      <div className="h-px relative w-[200px] flex items-center m-2 border border-black-100">
        <motion.div
          ref={seekerRef}
          drag={submitted ? "x" : undefined}
          dragConstraints={{ left: 0, right: 200 }}
          dragElastic={false}
          dragMomentum={false}
          className="h-[20px] w-[10px] bg-black rounded"
          onUpdate={({ x }: { x: number }) => {
            if (!audioElement) return;
            audioElement.currentTime = (x / 200) * audioElement.duration;
          }}
        ></motion.div>
      </div>
      <div ref={displayRef} className="m-1 text-center">
        0:00
      </div>
    </div>
  );
}

export function AudioControls({ audio }: { audio: HTMLAudioElement | null }) {
  const d = useDispatch();
  const playing = useSelector(getPlaying);
  const looping = useSelector(getLooping);
  const submittedAudioFile = useSelector(getSubmitted);
  return (
    <div>
      <div className="flex">
        <button
          className="p-1 text-center m-1 border border-solid border-black-100 w-full"
          onClick={() => {
            if (!submittedAudioFile) return;
            if (playing) {
              d(setPlaying(false));
            } else {
              d(setPlaying(true));
            }
          }}
        >
          {!playing ? "Play" : "Pause"}
        </button>
        <button
          className="p-1 text-center m-1 border border-solid border-black-100 w-full"
          onClick={() => {
            if (!submittedAudioFile) return;
            if (looping) {
              d(setLooping(false));
            } else {
              d(setLooping(true));
            }
          }}
        >
          {looping ? "Don't loop" : "Loop"}
        </button>
      </div>
      <AudioSeekerVisual audioElement={audio} />
      <VolumeSeekerVisual audioElement={audio} />
    </div>
  );
}
