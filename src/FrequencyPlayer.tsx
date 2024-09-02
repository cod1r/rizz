import { useState, useEffect } from "react"
import { useAudio } from "./useAudio";
export function FrequencyPlayer({ offlineAudioContext }: { offlineAudioContext: OfflineAudioContext | undefined | null }) {
  const { audioContext, oscillatorNode } = useAudio();
  const sampleRate = offlineAudioContext?.sampleRate
  const [connected, setConnected] = useState(false)
  const [currentFrequency, setCurrentFrequency] = useState(0)
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null)
  useEffect(() => {
    if (oscillatorNode) {
      oscillatorNode.start()
    }
  }, [oscillatorNode])
  useEffect(() => {
    if (offlineAudioContext) {
      offlineAudioContext.startRendering().then(ab => {
        setAudioBuffer(ab)
      })
    }
  }, [offlineAudioContext])
  if (!sampleRate) return null;
  return (
    <div>
      <div className="flex">
        <button
          className="border border-black-100 p-2 w-full"
          onClick={() => {
            if (oscillatorNode && audioContext) {
              if (audioContext.state === "suspended") {
                audioContext.resume().catch(e => console.error(e))
              }
              if (!connected) {
                oscillatorNode.connect(oscillatorNode.context.destination);
                setConnected(true)
              } else {
                oscillatorNode.disconnect();
                setConnected(false)
              }
            }
          }}
        >
          {connected ? "disconnect" : "connect"}
        </button>
      </div>
      <div>
      <input
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
