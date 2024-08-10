import { PostRow } from "../model/PostRow.ts";
import {
  MAX_POSTS_PER_ROW,
  MOVE_POST_ROW_SESSION_STORAGE_KEY_SUFFIX,
} from "../RedditWatcherConstants.ts";
import { Post } from "../model/Post/Post.ts";
import SubredditSourceOptionsEnum from "../model/config/enums/SubredditSourceOptionsEnum.ts";
import PostSortOrderOptionsEnum from "../model/config/enums/PostSortOrderOptionsEnum.ts";
import { v4 as uuidV4 } from "uuid";
import { sortPostsByCreate } from "../util/RedditServiceUtil.ts";

export type PostRowsState = {
  currentPath: string;
  scrollY: number;
  playPauseButtonIsPaused: boolean;
  postRows: Array<PostRow>;
  pauseGetPostsLoop: boolean;
  mouseOverAPostRow: boolean;
};

export enum PostRowsActionType {
  SET_CURRENT_LOCATION = "SET_CURRENT_LOCATION",
  TOGGLE_PLAY_PAUSE_BUTTON = "TOGGLE_PLAY_PAUSE_BUTTON",
  SET_POST_ATTACHMENT_INDEX = "SET_POST_ATTACHMENT_INDEX",
  CLEAR_POST_ROWS = "CLEAR_POST_ROWS",
  SET_SCROLL_Y = "SET_SCROLL_Y",
  SET_MOUSE_OVER_A_POST_ROW = "SET_MOUSE_OVER_A_POST_ROW",
  ADD_POST_ROW = "ADD_POST_ROW",
}

export type PostRowsStringPayloadAction = {
  type: PostRowsActionType.SET_CURRENT_LOCATION;
  payload: string;
};
export type PostRowsNumberPayloadAction = {
  type: PostRowsActionType.SET_SCROLL_Y;
  payload: number;
};
export type PostRowsBooleanPayloadAction = {
  type: PostRowsActionType.SET_MOUSE_OVER_A_POST_ROW;
  payload: boolean;
};
export type PostRowsNoPayloadAction = {
  type:
    | PostRowsActionType.TOGGLE_PLAY_PAUSE_BUTTON
    | PostRowsActionType.CLEAR_POST_ROWS;
};

export type SetPostAttachmentIndexAction = {
  type: PostRowsActionType.SET_POST_ATTACHMENT_INDEX;
  payload: { postRowUuid: string; postUuid: string; index: number };
};

export type AddPostRowAction = {
  type: PostRowsActionType.ADD_POST_ROW;
  payload: {
    posts: Array<Post>;
    gottenWithSubredditSourceOption: SubredditSourceOptionsEnum;
    gottenWithPostSortOrderOption: PostSortOrderOptionsEnum;
  };
};
export default function PostRowsReducer(
  state: PostRowsState,
  action:
    | PostRowsStringPayloadAction
    | PostRowsNumberPayloadAction
    | PostRowsNoPayloadAction
    | SetPostAttachmentIndexAction
    | PostRowsBooleanPayloadAction
    | AddPostRowAction
) {
  switch (action.type) {
    case PostRowsActionType.SET_CURRENT_LOCATION:
      return setCurrentLocation(state, action);
    case PostRowsActionType.TOGGLE_PLAY_PAUSE_BUTTON:
      return togglePlayPauseButton(state);
    case PostRowsActionType.SET_POST_ATTACHMENT_INDEX:
      return setPostAttachmentIndex(state, action);
    case PostRowsActionType.CLEAR_POST_ROWS:
      return clearPostRows(state);
    case PostRowsActionType.SET_SCROLL_Y:
      return setScrollY(state, action);
    case PostRowsActionType.SET_MOUSE_OVER_A_POST_ROW:
      return setMouseOverAPostRow(state, action);
    case PostRowsActionType.ADD_POST_ROW:
      return addPostRow(state, action);
    default:
      return state;
  }
}
const setCurrentLocation = (
  state: PostRowsState,
  action: PostRowsStringPayloadAction
): PostRowsState => {
  return {
    ...state,
    currentPath: action.payload,
  };
};

const setPostAttachmentIndex = (
  state: PostRowsState,
  action: {
    type: string;
    payload: { postRowUuid: string; postUuid: string; index: number };
  }
): PostRowsState => {
  const postRowUuid = action.payload.postRowUuid;
  const postRowIndex = state.postRows.findIndex(
    (postRow) => postRow.postRowUuid === postRowUuid
  );
  if (postRowIndex === -1) {
    return state;
  }
  const postRowsCopy = [...state.postRows];
  const postRow = postRowsCopy[postRowIndex];

  const postUuid = action.payload.postUuid;
  const postIndex = postRow.posts.findIndex(
    (post) => post.postUuid === postUuid
  );
  if (postIndex === -1) {
    return state;
  }
  postRow.posts[postIndex] = {
    ...postRow.posts[postIndex],
    currentAttachmentIndex: action.payload.index,
  };

  return {
    ...state,
    postRows: postRowsCopy,
  };
};
const clearPostRows = (state: PostRowsState): PostRowsState => {
  state.postRows.forEach((postRow) => {
    sessionStorage.removeItem(
      `${postRow.postRowUuid}${MOVE_POST_ROW_SESSION_STORAGE_KEY_SUFFIX}`
    );
  });
  return {
    ...state,
    postRows: [],
  };
};

const setScrollY = (
  state: PostRowsState,
  action: PostRowsNumberPayloadAction
) => {
  return {
    ...state,
    scrollY: action.payload,
    pauseGetPostsLoop: shouldPause(
      action.payload,
      state.playPauseButtonIsPaused,
      state.mouseOverAPostRow
    ),
  };
};
const togglePlayPauseButton = (state: PostRowsState): PostRowsState => {
  return {
    ...state,
    playPauseButtonIsPaused: !state.playPauseButtonIsPaused,
    pauseGetPostsLoop: shouldPause(
      state.scrollY,
      !state.playPauseButtonIsPaused,
      state.mouseOverAPostRow
    ),
  };
};
const setMouseOverAPostRow = (
  state: PostRowsState,
  action: PostRowsBooleanPayloadAction
): PostRowsState => {
  return {
    ...state,
    mouseOverAPostRow: action.payload,
    pauseGetPostsLoop: shouldPause(
      state.scrollY,
      state.playPauseButtonIsPaused,
      action.payload
    ),
  };
};

const addPostRow = (
  state: PostRowsState,
  action: AddPostRowAction
): PostRowsState => {
  const posts = [...action.payload.posts];
  if (posts.length === 0) {
    return state;
  }

  const gottenWithSubredditSourceOption =
    action.payload.gottenWithSubredditSourceOption;
  const gottenWithPostSortOrderOption =
    action.payload.gottenWithPostSortOrderOption;
  const isFrontPageAndNew =
    gottenWithPostSortOrderOption === PostSortOrderOptionsEnum.New &&
    gottenWithSubredditSourceOption === SubredditSourceOptionsEnum.FrontPage;
  const postRows = state.postRows;

  if (postRows.length === 0) {
    if (isFrontPageAndNew) {
      sortPostsByCreate(posts);
    }
    trimPostsToMaxLength(posts);
    const postRow = createPostRow(
      posts,
      gottenWithSubredditSourceOption,
      gottenWithPostSortOrderOption
    );
    return {
      ...state,
      postRows: [postRow],
    };
  } else {
    const mostRecentPostRow = postRows[0];
    const mostRecentPostRowPostNewAndFrontPage =
      mostRecentPostRow.gottenWithPostSortOrderOption ===
        PostSortOrderOptionsEnum.New &&
      mostRecentPostRow.gottenWithSubredditSourceOption ===
        SubredditSourceOptionsEnum.FrontPage;

    if (isFrontPageAndNew && mostRecentPostRowPostNewAndFrontPage) {
      sortPostsByCreate(posts);
      const postsToAddToViewModel = posts.filter((post) => {
        return post.created > mostRecentPostRow.posts[0].created;
      });
      const updatedPosts = [...postsToAddToViewModel, ...posts];
      trimPostsToMaxLength(updatedPosts);

      const updatedPostRows = [...state.postRows];
      updatedPostRows[0] = createPostRow(
        updatedPosts,
        gottenWithSubredditSourceOption,
        gottenWithPostSortOrderOption
      );
      return {
        ...state,
        postRows: updatedPostRows,
      };
    } else {
      if (isFrontPageAndNew) {
        sortPostsByCreate(posts);
      }
      trimPostsToMaxLength(posts);
      const postRow = createPostRow(
        posts,
        gottenWithSubredditSourceOption,
        gottenWithPostSortOrderOption
      );
      return {
        ...state,
        postRows: [postRow, ...state.postRows],
      };
    }
  }
};

const trimPostsToMaxLength = (posts: Array<Post>) => {
  if (posts.length > MAX_POSTS_PER_ROW) {
    posts.splice(MAX_POSTS_PER_ROW - 1);
  }
};
const shouldPause = (
  scrollY: number,
  playPauseButtonIsPaused: boolean,
  mouseOverAPostRow: boolean
) => {
  return scrollY !== 0 || playPauseButtonIsPaused || mouseOverAPostRow;
};
const createPostRow = (
  posts: Array<Post>,
  gottenWithSubredditSourceOption: SubredditSourceOptionsEnum,
  gottenWithPostSortOrderOption: PostSortOrderOptionsEnum
): PostRow => {
  const postRowUuid = uuidV4();
  return {
    postRowUuid: postRowUuid,
    posts: posts,
    shouldAutoScroll:
      gottenWithSubredditSourceOption !== SubredditSourceOptionsEnum.FrontPage,
    gottenWithSubredditSourceOption: gottenWithSubredditSourceOption,
    gottenWithPostSortOrderOption: gottenWithPostSortOrderOption,
  };
};
