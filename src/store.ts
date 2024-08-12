import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit"

interface AudioControls {
  playing: boolean,
  looping: boolean
}

const audioControlsInitialState = {
  playing: false,
  looping: false
} satisfies AudioControls as AudioControls

const audioControlsSlice = createSlice({
  name: "Audio Controls Slice",
  initialState: audioControlsInitialState,
  reducers: {
    setPlaying: (state, action: PayloadAction<boolean>) => {
      state.playing = action.payload
    },
    setLooping: (state, action: PayloadAction<boolean>) => {
      state.looping = action.payload
    }
  }
})

interface AppInfo {
  performFourier: boolean
  submitted: boolean
}

const appInfoInitialState = {
  performFourier: false,
  submitted: false,
} satisfies AppInfo as AppInfo

const appInfoSlice = createSlice({
  name: "App Info Slice",
  initialState: appInfoInitialState,
  reducers: {
    setPerformFourier: (state, action: PayloadAction<boolean>) => {
      state.performFourier = action.payload
    },
    setSubmitted: (state, action: PayloadAction<boolean>) => {
      state.submitted = action.payload
    }
  }
})

export const store = configureStore({
  reducer: {
    audioControls: audioControlsSlice.reducer,
    appInfo: appInfoSlice.reducer
  }
})