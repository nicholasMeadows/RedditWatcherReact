import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Post } from "../../model/Post/Post";
import { SinglePostPageInfo } from "../../model/SinglePostPageInfo";
import store from "../store";

export const setPostAndRowUuid = createAsyncThunk(
  "singlePostPage/setPostAndRowUuid",
  async (singlePostPageInfo: SinglePostPageInfo) => {
    const { postUuid, postRowUuid } = singlePostPageInfo;
    const postRows = store.getState().postRows.postRows;

    const postRow = postRows.find(
      (postRow) => postRow.postRowUuid == postRowUuid
    );
    if (postRow != undefined) {
      const post = postRow.posts.find((post) => post.postUuid == postUuid);
      if (post != undefined) {
        return {
          ...singlePostPageInfo,
          post: post,
        };
      }
    }
  }
);

export const goToNexPostInRow = createAsyncThunk(
  "singlePostPage/goToNexPostInRow",
  async () => {
    const currentPostRowAndPostIndex = findCurrentPostRowAndPostIndex();
    if (currentPostRowAndPostIndex != undefined) {
      const { postRow, postIndex } = currentPostRowAndPostIndex;
      let postToReturn: Post;
      if (postRow.posts.length - 1 == postIndex) {
        postToReturn = postRow.posts[0];
      } else {
        postToReturn = postRow.posts[postIndex + 1];
      }
      return postToReturn;
    }
  }
);

export const goToPreviousPostInRow = createAsyncThunk(
  "singlePostPage/goToPreviousPostInRow",
  async () => {
    const currentPostRowAndPostIndex = findCurrentPostRowAndPostIndex();
    if (currentPostRowAndPostIndex != undefined) {
      const { postRow, postIndex } = currentPostRowAndPostIndex;
      let postToReturn: Post;
      if (postIndex == 0) {
        postToReturn = postRow.posts[postRow.posts.length - 1];
      } else {
        postToReturn = postRow.posts[postIndex - 1];
      }
      return postToReturn;
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
  post: Post | undefined;
};

const initialState: InitialState = {
  postRowUuid: undefined,
  postUuid: undefined,
  post: undefined,
};

export const singlePostPageSlice = createSlice({
  name: "singlePostPage",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(setPostAndRowUuid.fulfilled, (state, action) => {
        state.postRowUuid = action.payload?.postRowUuid;
        state.postUuid = action.payload?.postUuid;
        state.post = action.payload?.post;
      })
      .addCase(goToNexPostInRow.fulfilled, (state, action) => {
        const post = action.payload;
        state.postUuid = post?.postUuid;
        state.post = post;
      })
      .addCase(goToPreviousPostInRow.fulfilled, (state, action) => {
        const post = action.payload;
        state.postUuid = post?.postUuid;
        state.post = post;
      });
  },
});

// export const {} = singlePostPageSlice.actions;
export default singlePostPageSlice.reducer;
