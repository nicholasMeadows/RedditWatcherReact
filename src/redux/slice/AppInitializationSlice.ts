import { createSlice } from "@reduxjs/toolkit";

export const appInitializationSlice = createSlice({
  name: "appInitializationSlice",
  initialState: {
    text: "Loading...",
  },
  reducers: {
    setText: (state, action) => {
      state.text = action.payload;
    },
  },
});

export const { setText } = appInitializationSlice.actions;
export default appInitializationSlice.reducer;
