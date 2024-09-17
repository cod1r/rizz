import { motion, useAnimationFrame } from "framer-motion";
import { useState, useEffect, useMemo, useRef } from "react";
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
  const endPx = useMemo(() => (end / maxValue) * 200, [end])
  const startPx = useMemo(() => (start / maxValue) * 200, [start])
  const seekerStartRef = useRef<HTMLDivElement | null>(null)
  const seekerEndRef = useRef<HTMLDivElement | null>(null)
  const middleSectionRef = useRef<HTMLDivElement | null>(null)
  console.log('start', startPx, 'end', endPx)
  useAnimationFrame(() => {
    if (middleSectionRef.current) {
      if (seekerStartRef.current && seekerEndRef.current) {
      {
        const transform = seekerStartRef.current.style.transform
        const startParseIdx = transform.lastIndexOf("(") + 1
        const endParseIdx = transform.lastIndexOf("p")
        let x = parseInt(transform.slice(startParseIdx, endParseIdx))
        if (isNaN(x)) {
          //console.warn(transform, transform.slice(startParseIdx, endParseIdx))
          x = startPx
        }
        middleSectionRef.current.style.left=`${x}px`
      }
      {
        const transformForEnd = seekerEndRef.current.style.transform
        const startParseIdxForEnd = transformForEnd.lastIndexOf("(") + 1
        const endParseIdxForEnd = transformForEnd.lastIndexOf("p")
        let xForEnd = parseInt(transformForEnd.slice(startParseIdxForEnd, endParseIdxForEnd))
        if (isNaN(xForEnd)) {
          //console.warn(transformForEnd, transformForEnd.slice(startParseIdxForEnd, endParseIdxForEnd))
          xForEnd = 200 - xForEnd - 10
        }
        middleSectionRef.current.style.right=`${200 - xForEnd - 10}px`
      }
      }
    }
  });
  return (
    <div className="h-px relative w-[200px] flex items-center m-2 border border-black-100">
      <motion.div
        initial={{ left: - 10 }}
        ref={seekerStartRef}
        drag="x"
        animate={{ x: startPx }}
        dragConstraints={{ left: 0, right: endPx }}
        dragElastic={false}
        dragMomentum={false}
        className="h-[20px] w-[10px] bg-black rounded relative"
        onDragEnd={(_, info) => {
          const clamped = info.offset.x < 0 ? Math.max(-startPx, info.offset.x) : Math.min(endPx - startPx, info.offset.x)
          const ratio = clamped / 200
          setStart(Math.floor(ratio * maxValue + start))
        }}
      ></motion.div>
      <div ref={middleSectionRef} className="h-px bg-black absolute p-0 m-0"></div>
      <motion.div
        initial={{ left: - 10 }}
        ref={seekerEndRef}
        drag="x"
        animate={{ x: endPx }}
        dragConstraints={{ left: startPx, right: 200 - 10 }}
        dragElastic={false}
        dragMomentum={false}
        className="h-[20px] w-[10px] bg-black rounded relative"
        onDragEnd={(_, info) => {
          const clamped = info.offset.x < 0 ? Math.max(startPx - endPx, info.offset.x) : Math.min(200 - endPx, info.offset.x)
          const ratio = clamped / 200
          setEnd(Math.floor(ratio * maxValue + end))
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
  const [oscillatorStarted, setOscillatorStarted] = useState(false)
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
      if (!oscillatorStarted) {
        oscillatorNode.start();
        setOscillatorStarted(true)
      }
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
  const seconds = offlineAudioContext.length / offlineAudioContext.sampleRate
  return (
    <div>
      <div className="flex justify-center">
        <Interval {...{ start, setStart, end, setEnd, maxValue: seconds }}/>
      </div>
      <div className="flex flex-col">
        <div className="flex flex-col items-center justify-between">
          <label htmlFor="startSeconds">Starting second:</label>
          <input id="startSeconds" className="p-1 m-1 border w-full" type="number" value={start} min={0} max={end} onInput={(e) => {
            setStart(Number(e.currentTarget.value))
          }}/>
        </div>
        <div className="flex flex-col items-center justify-between">
          <label htmlFor="endingSeconds">Ending second:</label>
          <input id="endingSeconds" className="p-1 m-1 border w-full" type="number" value={end} min={start} max={seconds} onInput={(e) => {
            setEnd(Number(e.currentTarget.value))
          }}/>
        </div>
      </div>
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
