import { useEffect, useRef } from "react"
import { useSelector } from "react-redux"
import { getPlaying } from "./store"
export function TimeDomainVisual({ audio, analyserNode }: { audio: HTMLAudioElement | null, analyserNode: AnalyserNode | null}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const playing = useSelector(getPlaying)
  useEffect(() => {
    if (audio && analyserNode && playing) {
      audio
        .play()
        .then(() => {
          let arr = new Float32Array(analyserNode.fftSize);
          const cvs = canvasRef.current
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

  }, [playing]);
  return <canvas
        ref={canvasRef}
        className="m-1 border-black-100 border border-solid"
      ></canvas>
}
