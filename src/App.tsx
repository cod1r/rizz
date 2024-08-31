import { useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getSubmitted,
  setPerformFourier,
  setSubmitted,
} from "./store";
import { AudioControls } from "./AudioControls";
import { TimeDomainVisual } from "./TimeDomainVisual"
import { FrequencyVisual } from "./FrequencyVisual"
import { useAudio } from "./useAudio"
import "./App.css";

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
      <FrequencyVisual audio={audio} analyserNode={analyserNode} />
    </div>
  );
}

export default App;
