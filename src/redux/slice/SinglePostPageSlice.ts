import { createSlice } from "@reduxjs/toolkit";
import { PostRow } from "../../model/PostRow";
import { Post } from "../../model/Post/Post";

type InitialState = {
  postRow: PostRow | undefined;
  postToShow: Post | undefined;
};
const initialState: InitialState = {
  postRow: undefined,
  postToShow: undefined,
};
export const singlePostPageSlice = createSlice({
  name: "singlePostPage",
  initialState: initialState,
  reducers: {
    setPostRowAndCurrentPost: (
      state,
      action: {
        type: string;
        payload: { postRow: PostRow | undefined; postToShow: Post | undefined };
      }
    ) => {
      state.postRow = action.payload.postRow;
      state.postToShow = action.payload.postToShow;
    },
    goToNextPost: (state) => {
      const currentPostShownIndex = findCurrentPostShownIndex(
        state.postRow,
        state.postToShow
      );
      if (currentPostShownIndex > -1 && state.postRow != undefined) {
        if (currentPostShownIndex == state.postRow.posts.length - 1) {
          state.postToShow = state.postRow.posts[0];
        } else {
          state.postToShow = state.postRow.posts[currentPostShownIndex + 1];
        }
      }
    },
    goToPreviousPost: (state) => {
      const currentPostShownIndex = findCurrentPostShownIndex(
        state.postRow,
        state.postToShow
      );
      if (currentPostShownIndex > -1 && state.postRow != undefined) {
        if (currentPostShownIndex == 0) {
          state.postToShow =
            state.postRow.posts[state.postRow.posts.length - 1];
        } else {
          state.postToShow = state.postRow.posts[currentPostShownIndex - 1];
        }
      }
    },
  },
});

const findCurrentPostShownIndex = (
  postRow: PostRow | undefined,
  postToShow: Post | undefined
): number => {
  if (postRow != undefined && postToShow != undefined) {
    return postRow.posts.findIndex(
      (post) => post.postUuid == postToShow.postUuid
    );
  }
  return -1;
};

export const { setPostRowAndCurrentPost, goToNextPost, goToPreviousPost } =
  singlePostPageSlice.actions;
export default singlePostPageSlice.reducer;
