import { createSlice } from "@reduxjs/toolkit";

type InitialState = {
  currentTimerValue: number;
};

const initialState: InitialState = {
  currentTimerValue: 0,
};

export const nextPostCountdownTimerSlice = createSlice({
  name: "nextPostCountdownTimer",
  initialState: initialState,
  reducers: {
    decreaseTimerValue: (state, action: { type: string; payload: number }) => {
      if (state.currentTimerValue > 0) {
        state.currentTimerValue -= action.payload;
      }
    },
    setTimerValue: (state, action: { type: string; payload: number }) => {
      state.currentTimerValue = action.payload;
    },
  },
});

export const { decreaseTimerValue, setTimerValue } =
  nextPostCountdownTimerSlice.actions;
export default nextPostCountdownTimerSlice.reducer;
