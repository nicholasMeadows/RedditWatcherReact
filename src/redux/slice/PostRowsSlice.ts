import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { v4 as uuidV4 } from "uuid";
import { Post } from "../../model/Post/Post";
import { PostRow } from "../../model/PostRow";
import { PostRowsState } from "../../model/PostRowsState";
import { MAX_POSTS_PER_ROW } from "../../RedditWatcherConstants.ts";
import store from "../store.ts";

export const createPostRowAndPushToRows = createAsyncThunk(
  "postRows/createPostRowAndPushToRows",
  async (data: Array<Post>) => {
    return createPostRow(data);
  }
);

export const createPostRowAndInsertAtBeginning = createAsyncThunk(
  "postRows/createPostRowAndInsertAtBegining",
  async (data: Array<Post>) => {
    return createPostRow(data);
  }
);

export const incrementPostRowForward = createAsyncThunk(
  "postRows/incrementPostRowForward",
  async (postRow: PostRow) => {
    const state = store.getState();
    const postsToShowInRow = state.appConfig.postsToShowInRow;
    const scrollToIndex = postRow.scrollToIndex;
    const incrementObj = {
      postRowUuid: postRow.postRowUuid,
      scrollToIndex: postRow.scrollToIndex,
      shiftFirstPostToEnd: false,
    };
    if (scrollToIndex + postsToShowInRow <= postRow.posts.length - 1) {
      incrementObj.scrollToIndex += 1;
    } else {
      incrementObj.shiftFirstPostToEnd = true;
    }
    return incrementObj;
  }
);
export const incrementPostRowBackward = createAsyncThunk(
  "postRows/incrementPostRowBackward",
  async (postRow: PostRow) => {
    const scrollToIndex = postRow.scrollToIndex;
    const incrementObj = {
      postRowUuid: postRow.postRowUuid,
      scrollToIndex: scrollToIndex,
      shiftLastPostToFront: false,
    };
    if (scrollToIndex - 1 >= 0) {
      incrementObj.scrollToIndex -= 1;
    } else {
      incrementObj.shiftLastPostToFront = true;
    }
    return incrementObj;
  }
);
const createPostRow = (posts: Array<Post>): PostRow => {
  const postRowUuid = uuidV4();
  return {
    postRowUuid: postRowUuid,
    posts: posts,
    scrollToIndex: 0,
  };
};

const setPostRowsHasAtLeast1PostRow = (state: PostRowsState) => {
  if (!state.postRowsHasAtLeast1PostRow) {
    state.postRowsHasAtLeast1PostRow = true;
  }
};

const setGetPostRowsPaused = (
  state: PostRowsState,
  scrollY: number,
  mouseOverPostRowUuid: string | undefined,
  clickedOnPlayPauseButton: boolean
) => {
  if (clickedOnPlayPauseButton) {
    state.getPostRowsPaused = true;
    return;
  }
  state.getPostRowsPaused = scrollY != 0 || mouseOverPostRowUuid != undefined;
};
const initialState: PostRowsState = {
  scrollY: 0,
  postRowsHasAtLeast1PostRow: false,
  postRows: new Array<PostRow>(),
  mouseOverPostRowUuid: undefined,
  clickedOnPlayPauseButton: false,
  getPostRowsPaused: false,
};
export const postRowsSlice = createSlice({
  name: "postRows",
  initialState: initialState,
  reducers: {
    setScrollY: (state, action) => {
      state.scrollY = action.payload;
      setGetPostRowsPaused(
        state,
        action.payload,
        state.mouseOverPostRowUuid,
        state.clickedOnPlayPauseButton
      );
    },
    postRowRemoveAt: (state, action: { type: string; payload: number }) => {
      state.postRows.splice(action.payload, 1);
    },
    shiftPostRowPosts: (
      state,
      action: {
        type: string;
        payload: {
          postRowUuid: string;
          postsToInsert: Array<Post>;
        };
      }
    ) => {
      const shiftPostRowPostsPayload = action.payload;
      const postRow = state.postRows.find(
        (postRow) => postRow.postRowUuid == shiftPostRowPostsPayload.postRowUuid
      );
      if (postRow != undefined) {
        const postsToInsert = action.payload.postsToInsert;
        postsToInsert.reverse();
        postsToInsert.forEach((post) => {
          postRow.posts.unshift(post);
        });

        if (postRow.posts.length > MAX_POSTS_PER_ROW) {
          postRow.posts.splice(MAX_POSTS_PER_ROW - postRow.posts.length);
        }
      }
    },
    incrementPostAttachment: (
      state,
      action: {
        type: string;
        payload: { postRowUuid: string; postUuid: string };
      }
    ) => {
      console.log("inside incrementPostAttachment");
      const postRowUuid = action.payload.postRowUuid;
      const postUuid = action.payload.postUuid;
      const postRow = state.postRows.find(
        (row) => row.postRowUuid == postRowUuid
      );
      if (postRow != undefined) {
        const post = postRow.posts.find((post) => post.postUuid == postUuid);
        if (post != undefined) {
          const currentAttachmentIndex = post.currentAttachmentIndex;
          if (currentAttachmentIndex == post.attachments.length - 1) {
            post.currentAttachmentIndex = 0;
          } else {
            post.currentAttachmentIndex += 1;
          }
        }
      }
    },
    decrementPostAttachment: (
      state,
      action: {
        type: string;
        payload: { postRowUuid: string; postUuid: string };
      }
    ) => {
      const postRowUuid = action.payload.postRowUuid;
      const postUuid = action.payload.postUuid;
      const postRow = state.postRows.find(
        (row) => row.postRowUuid == postRowUuid
      );
      if (postRow != undefined) {
        const post = postRow.posts.find((post) => post.postUuid == postUuid);
        if (post != undefined) {
          const currentAttachmentIndex = post.currentAttachmentIndex;
          if (currentAttachmentIndex == 0) {
            post.currentAttachmentIndex = post.attachments.length - 1;
          } else {
            post.currentAttachmentIndex -= 1;
          }
        }
      }
    },
    mouseEnterPostRow: (state, action: { type: string; payload: string }) => {
      const foundPostRow = state.postRows.find(
        (postRow) => postRow.postRowUuid == action.payload
      );
      if (foundPostRow != undefined) {
        state.mouseOverPostRowUuid = action.payload;
      }
      setGetPostRowsPaused(
        state,
        state.scrollY,
        action.payload,
        state.clickedOnPlayPauseButton
      );
    },
    mouseLeavePostRow: (state) => {
      const foundPostRow = state.postRows.find(
        (postRow) => postRow.postRowUuid == state.mouseOverPostRowUuid
      );
      if (foundPostRow != undefined) {
        state.mouseOverPostRowUuid = undefined;
      }
      setGetPostRowsPaused(
        state,
        state.scrollY,
        undefined,
        state.clickedOnPlayPauseButton
      );
    },
    setPostRowScrollToIndex: (
      state,
      action: {
        type: string;
        payload: { postRowUuid: string; scrollToIndex: number };
      }
    ) => {
      const foundPostRow = state.postRows.find(
        (postRow) => postRow.postRowUuid == action.payload.postRowUuid
      );
      if (foundPostRow != undefined) {
        foundPostRow.scrollToIndex = action.payload.scrollToIndex;
      }
    },
    clearPostRows: (state) => {
      state.postRows = [];
      state.postRowsHasAtLeast1PostRow = false;
    },
    toggleClickedOnPlayPauseButton: (state) => {
      state.clickedOnPlayPauseButton = !state.clickedOnPlayPauseButton;
      setGetPostRowsPaused(
        state,
        state.scrollY,
        state.mouseOverPostRowUuid,
        state.clickedOnPlayPauseButton
      );
    },
  },
  extraReducers(builder) {
    builder
      .addCase(
        createPostRowAndPushToRows.fulfilled,
        (state, action: { type: string; payload: PostRow }) => {
          setPostRowsHasAtLeast1PostRow(state);
          state.postRows.push(action.payload);
        }
      )
      .addCase(
        createPostRowAndInsertAtBeginning.fulfilled,
        (state, action: { type: string; payload: PostRow }) => {
          setPostRowsHasAtLeast1PostRow(state);
          state.postRows.unshift(action.payload);
        }
      )
      .addCase(incrementPostRowForward.fulfilled, (state, action) => {
        const postRowUuid = action.payload.postRowUuid;
        const foundPostRow = state.postRows.find(
          (row) => row.postRowUuid == postRowUuid
        );
        if (foundPostRow != undefined) {
          foundPostRow.scrollToIndex = action.payload.scrollToIndex;

          if (action.payload.shiftFirstPostToEnd) {
            const removedPosts = foundPostRow.posts.shift();
            if (removedPosts != undefined) {
              foundPostRow.posts.push(removedPosts);
            }
          }
        }
      })
      .addCase(incrementPostRowBackward.fulfilled, (state, action) => {
        const postRowUuid = action.payload.postRowUuid;
        const foundPostRow = state.postRows.find(
          (row) => row.postRowUuid == postRowUuid
        );
        if (foundPostRow != undefined) {
          foundPostRow.scrollToIndex = action.payload.scrollToIndex;

          if (action.payload.shiftLastPostToFront) {
            const removedPost = foundPostRow.posts.pop();
            if (removedPost != undefined) {
              foundPostRow.posts.unshift(removedPost);
            }
          }
        }
      });
  },
});

export const {
  setScrollY,
  postRowRemoveAt,
  shiftPostRowPosts,
  incrementPostAttachment,
  decrementPostAttachment,
  mouseEnterPostRow,
  mouseLeavePostRow,
  setPostRowScrollToIndex,
  clearPostRows,
  toggleClickedOnPlayPauseButton,
} = postRowsSlice.actions;
export default postRowsSlice.reducer;
