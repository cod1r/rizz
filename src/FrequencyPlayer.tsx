import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { useAudio } from "./useAudio";
function Interval({
  start,
  end,
  maxValue,
  setStart,
  setEnd,
}: {
  start: number;
  end: number;
  maxValue: number;
  setStart: React.Dispatch<React.SetStateAction<number>>;
  setEnd: React.Dispatch<React.SetStateAction<number>>;
}) {
  // code is 190 because it is 200 - (20 / 2)
  // 20 is the width of the slider
  const endPx = useMemo(() => (end / maxValue) * 190, [end])
  const startPx = useMemo(() => (start / maxValue) * 190, [start])
  console.log('start', startPx, 'end', endPx)
  return (
    <div className="h-px relative w-[200px] flex items-center m-2 border border-black-100">
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: endPx }}
        dragElastic={false}
        dragMomentum={false}
        className="h-[20px] w-[10px] bg-black rounded"
        onDragEnd={(_, info) => {
          const clamped = info.offset.x < 0 ? Math.max(-startPx, info.offset.x) : Math.min(endPx - startPx, info.offset.x)
          const ratio = clamped / 190
          setStart(ratio * maxValue + start)
        }}
      ></motion.div>
      <motion.div
        drag="x"
        dragConstraints={{ left: startPx, right: 200 - 10 }}
        dragElastic={false}
        dragMomentum={false}
        className="h-[20px] w-[10px] bg-black rounded"
        onDragEnd={(_, info) => {
          const clamped = info.offset.x < 0 ? Math.max(startPx - endPx, info.offset.x) : Math.min(200 - 10 - endPx, info.offset.x)
          const ratio = clamped / 190
          setEnd(ratio * maxValue + end)
        }}
      ></motion.div>
    </div>
  );
}
export function FrequencyPlayer({
  offlineAudioContext,
}: {
  offlineAudioContext: OfflineAudioContext | undefined | null;
}) {
  const { audioContext, oscillatorNode } = useAudio();
  const sampleRate = offlineAudioContext?.sampleRate;
  const [connected, setConnected] = useState(false);
  const [currentFrequency, setCurrentFrequency] = useState(0);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [start, setStart] = useState(0)
  const [end, setEnd] = useState(0)
  useEffect(() => {
    if (oscillatorNode) {
      oscillatorNode.frequency.setValueAtTime(
        currentFrequency,
        oscillatorNode.context.currentTime,
      );
    }
  }, [oscillatorNode, currentFrequency]);
  useEffect(() => {
    if (oscillatorNode) {
      oscillatorNode.disconnect();
      oscillatorNode.start();
    }
  }, [oscillatorNode]);
  useEffect(() => {
    if (offlineAudioContext) {
      offlineAudioContext.startRendering().then((ab) => {
        setAudioBuffer(ab);
      });
    }
  }, [offlineAudioContext]);
  if (!sampleRate) return null;
  return (
    <div>
      <Interval {...{ start, setStart, end, setEnd, maxValue: offlineAudioContext.length / offlineAudioContext.sampleRate }}/>
      <div className="flex">
        <button
          className="border border-black-100 p-2 w-full"
          onClick={() => {
            if (oscillatorNode && audioContext) {
              if (!connected) {
                oscillatorNode.connect(oscillatorNode.context.destination);
                setConnected(true);
              } else {
                oscillatorNode.disconnect();
                setConnected(false);
              }
            }
          }}
        >
          {connected ? "disconnect" : "connect"}
        </button>
      </div>
      <div className="flex items-center justify-center">
        <input
          className="m-1"
          type="range"
          min={0}
          max={sampleRate / 2}
          onInput={(e) => {
            //if (oscillatorNode) {
            //  const frequency = Number(e.currentTarget.value)
            //  if (listOfFrequencies.includes(frequency)) {
            //    setCurrentFrequency(frequency)
            //    oscillatorNode.frequency.setValueAtTime(
            //      frequency,
            //      oscillatorNode.context.currentTime,
            //    );
            //  } else {
            //    setCurrentFrequency(0)
            //  }
            //}
          }}
        />
        {currentFrequency}
      </div>
    </div>
  );
}
