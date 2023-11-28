import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  pageName: "Home",
  showBackButton: false,
};

export const navigationDrawerSlice = createSlice({
  name: "navigationDrawer",
  initialState: initialState,
  reducers: {
    setPageName: (state, action) => {
      state.pageName = action.payload;
    },
    setShowBackButton: (state, action: { type: string; payload: boolean }) => {
      state.showBackButton = action.payload;
    },
  },
});

export const { setPageName, setShowBackButton } = navigationDrawerSlice.actions;
export default navigationDrawerSlice.reducer;
