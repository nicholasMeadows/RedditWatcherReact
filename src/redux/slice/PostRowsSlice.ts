import { createSlice } from "@reduxjs/toolkit";
import { PostRow } from "../../model/PostRow.ts";
import {
  MAX_POSTS_PER_ROW,
  POST_ROW_ROUTE,
} from "../../RedditWatcherConstants.ts";
import { Post } from "../../model/Post/Post.ts";
import { v4 as uuidV4 } from "uuid";
import UserFrontPagePostSortOrderOptionsEnum from "../../model/config/enums/UserFrontPagePostSortOrderOptionsEnum.ts";
import store from "../store.ts";

export type PostRowsState = {
  getPostRowsPaused: boolean;
  currentPath: string;
  scrollY: number;
  clickedOnPlayPauseButton: boolean;
  getPostRowsPausedTimeout: NodeJS.Timeout | undefined;
  postRows: Array<PostRow>;
  postRowsHasAtLeast1PostRow: boolean;
  postCardWidthPercentage: number;
  postRowContentWidthPx: number;
};
const initialState: PostRowsState = {
  getPostRowsPaused: false,
  getPostRowsPausedTimeout: undefined,
  currentPath: "",
  scrollY: 0,
  clickedOnPlayPauseButton: false,
  postRowsHasAtLeast1PostRow: false,
  postRows: new Array<PostRow>(),
  postCardWidthPercentage: 0,
  postRowContentWidthPx: 0,
};

const clearGetPostRowPausedTimeout = (state: PostRowsState) => {
  if (state.getPostRowsPausedTimeout != undefined) {
    clearTimeout(state.getPostRowsPausedTimeout);
    state.getPostRowsPausedTimeout = undefined;
  }
};
const createGetPostRowPausedTimeout = () => {
  return setTimeout(() => {
    store.dispatch(checkGetPostRowPausedConditions());
  }, 2000);
};

const createPostRow = (
  posts: Array<Post>,
  postRowContentWidth: number,
  userFrontPageSortOption: UserFrontPagePostSortOrderOptionsEnum
): PostRow => {
  const postRowUuid = uuidV4();
  const postRow: PostRow = {
    postRowUuid: postRowUuid,
    posts: posts,
    postRowContentWidthAtCreation: postRowContentWidth,
    userFrontPagePostSortOrderOptionAtRowCreation: userFrontPageSortOption,
    mouseOverPostRow: false,
    lastAutoScrollPostRowState: undefined,
  };
  return postRow;
};
export const postRowsSlice = createSlice({
  name: "postRowsSlice",
  initialState: initialState,
  reducers: {
    setCurrentLocation: (state, action: { type: string; payload: string }) => {
      clearGetPostRowPausedTimeout(state);
      state.getPostRowsPausedTimeout = createGetPostRowPausedTimeout();
      state.getPostRowsPaused = true;
      state.currentPath = action.payload;
    },
    setScrollY: (state, action: { type: string; payload: number }) => {
      clearGetPostRowPausedTimeout(state);
      state.getPostRowsPausedTimeout = createGetPostRowPausedTimeout();
      state.getPostRowsPaused = true;
      state.scrollY = action.payload;
    },
    toggleClickedOnPlayPauseButton: (state) => {
      clearGetPostRowPausedTimeout(state);
      state.getPostRowsPausedTimeout = createGetPostRowPausedTimeout();
      state.getPostRowsPaused = true;
      state.clickedOnPlayPauseButton = !state.clickedOnPlayPauseButton;
    },
    mouseLeavePostRow: (state, action: { type: string; payload: string }) => {
      clearGetPostRowPausedTimeout(state);
      const postRow = state.postRows.find(
        (postRow) => postRow.postRowUuid == action.payload
      );
      if (postRow != undefined) {
        postRow.mouseOverPostRow = false;
      }
      state.getPostRowsPausedTimeout = createGetPostRowPausedTimeout();
      state.getPostRowsPaused = true;
    },
    createPostRowAndInsertAtBeginning: (
      state,
      action: {
        type: string;
        payload: {
          posts: Array<Post>;
          postsToShowInRow: number;
          userFrontPagePostSortOrderOption: UserFrontPagePostSortOrderOptionsEnum;
        };
      }
    ) => {
      const postRow = createPostRow(
        action.payload.posts,
        state.postCardWidthPercentage,
        action.payload.userFrontPagePostSortOrderOption
      );
      state.postRows.unshift(postRow);
      state.postRowsHasAtLeast1PostRow = true;
    },
    checkGetPostRowPausedConditions: (state: PostRowsState) => {
      if (state.postRows.length == 0) {
        state.getPostRowsPaused = false;
        return;
      }
      if (state.clickedOnPlayPauseButton) {
        state.getPostRowsPaused = true;
        return;
      }

      const mouseOverPostRow = state.postRows.find(
        (postRow) => postRow.mouseOverPostRow
      );

      state.getPostRowsPaused =
        state.scrollY != 0 ||
        mouseOverPostRow != undefined ||
        state.currentPath != POST_ROW_ROUTE;
    },
    postRowRemoveAt: (state, action: { type: string; payload: number }) => {
      state.postRows.splice(action.payload, 1);
    },
    incrementPostAttachment: (
      state,
      action: {
        type: string;
        payload: { postRowUuid: string; postUuid: string };
      }
    ) => {
      const postRowUuid = action.payload.postRowUuid;
      const postRow = state.postRows.find(
        (row) => row.postRowUuid == postRowUuid
      );
      if (postRow == undefined) {
        return;
      }
      const postUuid = action.payload.postUuid;
      const post = postRow.posts.find((post) => post.postUuid == postUuid);
      if (post != undefined) {
        const currentAttachmentIndex = post.currentAttachmentIndex;
        if (currentAttachmentIndex == post.attachments.length - 1) {
          post.currentAttachmentIndex = 0;
        } else {
          post.currentAttachmentIndex += 1;
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
      const postRow = state.postRows.find(
        (row) => row.postRowUuid == postRowUuid
      );
      if (postRow == undefined) {
        return;
      }
      const postUuid = action.payload.postUuid;
      const post = postRow.posts.find((post) => post.postUuid == postUuid);
      if (post != undefined) {
        const currentAttachmentIndex = post.currentAttachmentIndex;
        if (currentAttachmentIndex == 0) {
          post.currentAttachmentIndex = post.attachments.length - 1;
        } else {
          post.currentAttachmentIndex -= 1;
        }
      }
    },
    jumpToPostAttachment: (
      state,
      action: {
        type: string;
        payload: {
          postRowUuid: string;
          postUuid: string;
          attachmentIndex: number;
        };
      }
    ) => {
      const postRowUuid = action.payload.postRowUuid;
      const postRow = state.postRows.find(
        (postRow) => postRow.postRowUuid == postRowUuid
      );
      if (postRow == undefined) {
        return;
      }
      const postUuid = action.payload.postUuid;
      const post = postRow.posts.find((post) => post.postUuid == postUuid);
      if (post == undefined) {
        return;
      }
      post.currentAttachmentIndex = action.payload.attachmentIndex;
    },
    clearPostRows: (state) => {
      state.postRows = [];
      state.postRowsHasAtLeast1PostRow = false;
    },
    addPostsToFrontOfRow: (
      state,
      action: {
        type: string;
        payload: {
          postRowUuid: string;
          posts: Array<Post>;
          postsToShowInRow: number;
        };
      }
    ) => {
      const postRowUuid = action.payload.postRowUuid;
      const postRow = state.postRows.find(
        (postRow) => postRow.postRowUuid == postRowUuid
      );
      if (postRow == undefined) {
        return;
      }

      postRow.posts = [...action.payload.posts, ...postRow.posts];

      if (postRow.posts.length > MAX_POSTS_PER_ROW) {
        postRow.posts.splice(MAX_POSTS_PER_ROW - postRow.posts.length);
      }
    },
    setPostCardWidthPercentage: (
      state,
      action: {
        type: string;
        payload: {
          postCardWidthPercentage: number;
          postsToShowInRow: number;
        };
      }
    ) => {
      state.postCardWidthPercentage = action.payload.postCardWidthPercentage;
    },
    setPostRowContentWidthPx: (
      state,
      action: { type: string; payload: number }
    ) => {
      state.postRowContentWidthPx = action.payload;
    },
    mouseEnterPostRow: (state, action: { type: string; payload: string }) => {
      const postRowUuid = action.payload;
      const postRow = state.postRows.find(
        (postRow) => postRow.postRowUuid == postRowUuid
      );
      if (postRow == undefined) {
        return;
      }
      postRow.mouseOverPostRow = true;
      clearGetPostRowPausedTimeout(state);
      state.getPostRowsPaused = true;
    },
    setLastAutoScrollPostRowState: (
      state,
      action: {
        type: string;
        payload: {
          postRowUuid: string;
          postsToShow: Array<Post>;
          scrollLeft: number;
        };
      }
    ) => {
      const postRowUuid = action.payload.postRowUuid;
      const postRow = state.postRows.find(
        (postRow) => postRow.postRowUuid === postRowUuid
      );
      if (postRow !== undefined) {
        postRow.lastAutoScrollPostRowState = {
          postsToShow: action.payload.postsToShow,
          scrollLeft: action.payload.scrollLeft,
        };
      }
    },
  },
});
export const {
  setCurrentLocation,
  setScrollY,
  toggleClickedOnPlayPauseButton,
  mouseLeavePostRow,
  createPostRowAndInsertAtBeginning,
  checkGetPostRowPausedConditions,
  postRowRemoveAt,
  incrementPostAttachment,
  decrementPostAttachment,
  jumpToPostAttachment,
  clearPostRows,
  addPostsToFrontOfRow,
  setPostCardWidthPercentage,
  setPostRowContentWidthPx,
  mouseEnterPostRow,
  setLastAutoScrollPostRowState,
} = postRowsSlice.actions;
export default postRowsSlice.reducer;
