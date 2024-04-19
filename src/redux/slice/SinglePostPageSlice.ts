import { createSlice } from "@reduxjs/toolkit";

type SinglePostPageContextData = {
  postRowUuid: string | undefined;
  postUuid: string | undefined;
};
const initialState: SinglePostPageContextData = {
  postRowUuid: undefined,
  postUuid: undefined,
};
export const singlePostPageSlice = createSlice({
  initialState: initialState,
  name: "singlePostPageSlice",
  reducers: {
    setSinglePostPageUuids: (
      state,
      action: {
        type: string;
        payload: { postRowUuid: string; postUuid: string };
      }
    ) => {
      const postRowUuid = action.payload.postRowUuid;
      const postUuid = action.payload.postUuid;
      state.postRowUuid = postRowUuid;
      state.postUuid = postUuid;
    },
  },
});
export const { setSinglePostPageUuids } = singlePostPageSlice.actions;
export default singlePostPageSlice.reducer;
