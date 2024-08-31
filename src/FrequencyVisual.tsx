import { useRef, useEffect } from "react";
import { getPlaying } from "./store";
import { useSelector } from "react-redux";
export function FrequencyVisual({
  analyserNode,
}: {
  audio: HTMLAudioElement | null;
  analyserNode: AnalyserNode | null;
}) {
  const cvs = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number>(0)
  const playing = useSelector(getPlaying);
  useEffect(() => {
    if (playing) {
      draw();
    } else {
      cancelAnimationFrame(animationFrameId.current)
    }
  }, [playing]);
  function draw() {
    if (!cvs.current || analyserNode === null) return;
    const canvasCtx = cvs.current.getContext("2d");
    if (!canvasCtx) return;
    //Schedule next redraw
    animationFrameId.current = requestAnimationFrame(draw);

    const floatArray = new Float32Array(analyserNode.frequencyBinCount);
    analyserNode.getFloatFrequencyData(floatArray);

    //Draw black background
    canvasCtx.fillStyle = "rgb(255 255 255)";
    canvasCtx.fillRect(0, 0, cvs.current.width, cvs.current.height);

    //Draw spectrum
    const barWidth = (cvs.current.width / analyserNode.frequencyBinCount) * 2.5;
    let posX = 0;
    for (let i = 0; i < analyserNode.frequencyBinCount; i++) {
      const barHeight = (-floatArray[i] / .8);
      canvasCtx.fillStyle = `rgb(${Math.floor(barHeight + 100)} 50 50)`;
      canvasCtx.fillRect(
        posX,
        cvs.current.height - barHeight / 2,
        barWidth,
        barHeight / 2,
      );
      posX += barWidth + 1;
    }
  }
  return (
    <canvas
      ref={cvs}
      className="m-1 border-black-100 border border-solid"
    ></canvas>
  );
}
