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
  const submitted = useSelector(getSubmitted);
  useAnimationFrame(() => {
    if (seekerRef.current) {
      if (!audioElement || !submitted) {
        return;
      }
      seekerRef.current.style.transform = `translateX(${audioElement.volume * 200}px)`;
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
          onDragEnd={(_, info) => {
            if (!audioElement) return;
            const volumeOffset = info.offset.x / 200;
            audioElement.volume += volumeOffset;
          }}
          layout
        ></motion.div>
      </div>
      <div className="m-1 text-center">{audioElement.volume * 100}%</div>
    </div>
  );
}

function AudioSeekerVisual({
  audioElement,
}: {
  audioElement: HTMLAudioElement | null;
}) {
  const seekerRef = useRef<HTMLDivElement | null>(null);
  const submitted = useSelector(getSubmitted);
  useAnimationFrame(() => {
    if (seekerRef.current) {
      if (!audioElement || !submitted) {
        return;
      }
      const ratio = audioElement.currentTime / audioElement.duration;
      seekerRef.current.style.transform = `translateX(${ratio * 200}px)`;
    }
  });
  if (!audioElement) return null;
  const seconds = String(audioElement.currentTime % 60)
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
          onDragEnd={(_, info) => {
            if (!audioElement) return;
            const timeOffset = (info.offset.x / 200) * audioElement.duration;
            console.log(audioElement.currentTime, timeOffset, info.offset.x);
            audioElement.currentTime += timeOffset;
          }}
          layout
        ></motion.div>
      </div>
      <div className="m-1 text-center">
        {audioElement.currentTime / 60}:{seconds.length > 1 ? seconds : `0${seconds}`}
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
