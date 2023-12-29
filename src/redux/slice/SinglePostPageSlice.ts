import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { SinglePostPageInfo } from "../../model/SinglePostPageInfo";
import store from "../store";

export const goToNexPostInRow = createAsyncThunk(
  "singlePostPage/goToNexPostInRow",
  async () => {
    const currentPostRowAndPostIndex = findCurrentPostRowAndPostIndex();
    if (currentPostRowAndPostIndex != undefined) {
      const { postRow, postIndex } = currentPostRowAndPostIndex;
      let nextPostUuid: string;
      if (postRow.posts.length - 1 == postIndex) {
        nextPostUuid = postRow.posts[0].postUuid;
      } else {
        nextPostUuid = postRow.posts[postIndex + 1].postUuid;
      }
      return nextPostUuid;
    }
  }
);

export const goToPreviousPostInRow = createAsyncThunk(
  "singlePostPage/goToPreviousPostInRow",
  async () => {
    const currentPostRowAndPostIndex = findCurrentPostRowAndPostIndex();
    if (currentPostRowAndPostIndex != undefined) {
      const { postRow, postIndex } = currentPostRowAndPostIndex;
      let previousPostUuid: string;
      if (postIndex == 0) {
        previousPostUuid = postRow.posts[postRow.posts.length - 1].postUuid;
      } else {
        previousPostUuid = postRow.posts[postIndex - 1].postUuid;
      }
      return previousPostUuid;
    }
  }
);

const findCurrentPostRowAndPostIndex = () => {
  const state = store.getState();
  const postRows = state.postRows.postRows;
  const postRow = postRows.find(
    (postRow) => postRow.postRowUuid == state.singlePostPage.postRowUuid
  );
  if (postRow != undefined) {
    const postIndex = postRow.posts.findIndex(
      (post) => post.postUuid == state.singlePostPage.postUuid
    );
    if (postIndex != -1) {
      return { postRow: postRow, postIndex: postIndex };
    }
  }
  return undefined;
};

type InitialState = {
  postRowUuid: string | undefined;
  postUuid: string | undefined;
};

const initialState: InitialState = {
  postRowUuid: undefined,
  postUuid: undefined,
};

export const singlePostPageSlice = createSlice({
  name: "singlePostPage",
  initialState: initialState,
  reducers: {
    setPostAndRowUuid: (
      state,
      action: { type: string; payload: SinglePostPageInfo }
    ) => {
      state.postRowUuid = action.payload.postRowUuid;
      state.postUuid = action.payload.postUuid;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(goToNexPostInRow.fulfilled, (state, action) => {
        const postUuid = action.payload;
        state.postUuid = postUuid;
      })
      .addCase(goToPreviousPostInRow.fulfilled, (state, action) => {
        const postUuid = action.payload;
        state.postUuid = postUuid;
      });
  },
});

export const { setPostAndRowUuid } = singlePostPageSlice.actions;
export default singlePostPageSlice.reducer;
