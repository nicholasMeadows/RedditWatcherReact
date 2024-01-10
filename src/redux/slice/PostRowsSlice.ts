import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { v4 as uuidV4 } from "uuid";
import { Post } from "../../model/Post/Post";
import { PostRow } from "../../model/PostRow";
import { PostRowsState } from "../../model/PostRowsState";
import UserFrontPagePostSortOrderOptionsEnum from "../../model/config/enums/UserFrontPagePostSortOrderOptionsEnum";
import store from "../store";
import { MAX_POSTS_PER_ROW } from "../../RedditWatcherConstants.ts";

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

const createPostRow = (posts: Array<Post>): PostRow => {
  const postRowUuid = uuidV4();
  const postRow: PostRow = {
    postRowUuid: postRowUuid,
    posts: posts,
    scrollToIndex: 0,
    incrementPostInterval: createIncrementPostInterval(postRowUuid),
  };
  return postRow;
};

const createIncrementPostInterval = (postRowUuid: string): NodeJS.Timeout => {
  return setInterval(() => {
    const state = store.getState();
    if (
      state.appConfig.userFrontPagePostSortOrderOption ==
      UserFrontPagePostSortOrderOptionsEnum.NotSelected
    ) {
      const postsToShowInRow = store.getState().appConfig.postsToShowInRow;
      const postRow = store
        .getState()
        .postRows.postRows.find((row) => row.postRowUuid == postRowUuid);
      if (postRow != undefined && postRow.posts.length > postsToShowInRow) {
        store.dispatch(
          postRowRightButtonClicked({
            postRowUuid: postRow.postRowUuid,
            postsToShowInRow: postsToShowInRow,
          })
        );
      }
    }
  }, 6000);
};

const setPostRowsHasAtLeast1PostRow = (state: PostRowsState) => {
  if (!state.postRowsHasAtLeast1PostRow) {
    state.postRowsHasAtLeast1PostRow = true;
  }
};

const initialState: PostRowsState = {
  scrollY: 0,
  postRowsHasAtLeast1PostRow: false,
  postRows: new Array<PostRow>(),
  mouseOverPostRowUuid: undefined,
};
export const postRowsSlice = createSlice({
  name: "postRows",
  initialState: initialState,
  reducers: {
    setScrollY: (state, action) => {
      state.scrollY = action.payload;
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
        clearInterval(foundPostRow.incrementPostInterval);
      }
    },
    mouseLeavePostRow: (state) => {
      const foundPostRow = state.postRows.find(
        (postRow) => postRow.postRowUuid == state.mouseOverPostRowUuid
      );
      if (foundPostRow != undefined) {
        foundPostRow.incrementPostInterval = createIncrementPostInterval(
          foundPostRow.postRowUuid
        );
        state.mouseOverPostRowUuid = undefined;
      }
    },
    postRowLeftButtonClicked: (
      state,
      action: {
        type: string;
        payload: { postRowUuid: string };
      }
    ) => {
      const postRowUuid = action.payload.postRowUuid;
      const postRow = state.postRows.find(
        (row) => row.postRowUuid == postRowUuid
      );
      if (postRow != undefined) {
        const scrollToIndex = postRow.scrollToIndex;
        if (scrollToIndex - 1 >= 0) {
          postRow.scrollToIndex -= 1;
        } else {
          const removedPost = postRow.posts.pop();
          if (removedPost != undefined) {
            postRow.posts.unshift(removedPost);
          }
        }
      }
    },
    postRowRightButtonClicked: (
      state,
      action: {
        type: string;
        payload: { postRowUuid: string; postsToShowInRow: number };
      }
    ) => {
      const postRowUuid = action.payload.postRowUuid;
      const postRow = state.postRows.find(
        (row) => row.postRowUuid == postRowUuid
      );
      if (postRow != undefined) {
        const postsToShowInRow = parseInt(
          action.payload.postsToShowInRow.toString()
        );

        const scrollToIndex = postRow.scrollToIndex;
        if (scrollToIndex + postsToShowInRow <= postRow.posts.length - 1) {
          postRow.scrollToIndex += 1;
        } else {
          const removedPosts = postRow.posts.shift();
          if (removedPosts != undefined) {
            postRow.posts.push(removedPosts);
          }
        }
      }
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
      );
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
  postRowLeftButtonClicked,
  postRowRightButtonClicked,
  setPostRowScrollToIndex,
  clearPostRows,
} = postRowsSlice.actions;
export default postRowsSlice.reducer;
