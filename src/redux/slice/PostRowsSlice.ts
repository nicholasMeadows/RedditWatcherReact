import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Post } from "../../model/Post/Post";
import { PostRowsState } from "../../model/PostRowsState";
import { PostRow } from "../../model/PostRow";
import { v4 as uuidV4 } from "uuid";
import store from "../store";
import UserFrontPagePostSortOrderOptionsEnum from "../../model/config/enums/UserFrontPagePostSortOrderOptionsEnum";

export const createPostRowAndPushToRows = createAsyncThunk(
  "postRows/createPostRowAndPushToRows",
  async (data: Array<Post>) => {
    return createPostRow(data);
  }
);

export const createPostRowAndInsertAtBegining = createAsyncThunk(
  "postRows/createPostRowAndInsertAtBegining",
  async (data: Array<Post>) => {
    return createPostRow(data);
  }
);

const createPostRow = (posts: Array<Post>): PostRow => {
  const postRowUuid = uuidV4();
  const postRow: PostRow = {
    postRowUuid: postRowUuid,
    runningPostsForPostRow: [...posts].map((post) => {
      post.postUuid = `${post.postUuid}-${uuidV4()}`;
      return post;
    }),
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
          postToInsert: Post;
          postToRemoveAt: number;
        };
      }
    ) => {
      const shiftPostRowPostsPayload = action.payload;
      const postRow = state.postRows.find(
        (postRow) => postRow.postRowUuid == shiftPostRowPostsPayload.postRowUuid
      );
      if (postRow != undefined) {
        postRow.posts.unshift(shiftPostRowPostsPayload.postToInsert);
        postRow.posts.splice(shiftPostRowPostsPayload.postToRemoveAt, 1);
      }
    },
    incrementPostAttachment: (
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
        const postToShowIndex = postRow.runningPostsForPostRow.findIndex(
          (post) => post.postUuid == postUuid
        );
        if (post != undefined && postToShowIndex != -1) {
          const currentAttachmentIndex = post.currentAttatchmentIndex;
          if (currentAttachmentIndex == post.attachments.length - 1) {
            post.currentAttatchmentIndex = 0;
          } else {
            post.currentAttatchmentIndex += 1;
          }
          postRow.runningPostsForPostRow[postToShowIndex] = post;
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
        const postToShowIndex = postRow.runningPostsForPostRow.findIndex(
          (post) => post.postUuid == postUuid
        );
        if (post != undefined && postToShowIndex != -1) {
          const currentAttachmentIndex = post.currentAttatchmentIndex;
          if (currentAttachmentIndex == 0) {
            post.currentAttatchmentIndex = post.attachments.length - 1;
          } else {
            post.currentAttatchmentIndex -= 1;
          }
          postRow.runningPostsForPostRow[postToShowIndex] = post;
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
        payload: { postRowUuid: string; postsToShowInRow: number };
      }
    ) => {
      const postRowUuid = action.payload.postRowUuid;
      const postsToShowInRow = parseInt(
        action.payload.postsToShowInRow.toString()
      );

      const postRow = state.postRows.find(
        (row) => row.postRowUuid == postRowUuid
      );
      if (postRow != undefined) {
        const scrollToIndex = postRow.scrollToIndex;
        if (scrollToIndex == 0) {
          const postsToInsert = [...postRow.posts].map((post) => {
            post.postUuid = `${post.postUuid}-${uuidV4()}`;
            return post;
          });
          const scrollToIndexToSet = postsToInsert.length - 1;
          postRow.runningPostsForPostRow = [
            ...postsToInsert,
            ...postRow.runningPostsForPostRow,
          ];
          postRow.scrollToIndex = scrollToIndexToSet;
        } else {
          postRow.scrollToIndex--;
        }

        if (postRow.runningPostsForPostRow.length > postRow.posts.length) {
          if (
            postRow.scrollToIndex + postsToShowInRow <
            postRow.posts.length + 1
          ) {
            postRow.runningPostsForPostRow =
              postRow.runningPostsForPostRow.slice(0, postRow.posts.length);
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
      const postsToShowInRow = parseInt(
        action.payload.postsToShowInRow.toString()
      );

      const postRow = state.postRows.find(
        (row) => row.postRowUuid == postRowUuid
      );
      if (postRow != undefined) {
        const scrollToIndex = postRow.scrollToIndex;
        if (
          scrollToIndex ==
          postRow.runningPostsForPostRow.length - 1 - postsToShowInRow
        ) {
          const postsToAdd = [...postRow.posts].map((post) => {
            post.postUuid = `${post.postUuid}-${uuidV4()}`;
            return post;
          });
          postRow.runningPostsForPostRow = [
            ...postRow.runningPostsForPostRow,
            ...postsToAdd,
          ];
        }
        postRow.scrollToIndex++;
        if (postRow.scrollToIndex == postRow.posts.length) {
          postRow.runningPostsForPostRow.slice(0, postRow.posts.length);
          postRow.scrollToIndex = 0;
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
        createPostRowAndInsertAtBegining.fulfilled,
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
