import { Post } from "../model/Post/Post.ts";
import { PostRow } from "../model/PostRow.ts";
import { v4 as uuidV4 } from "uuid";
import SubredditSourceOptionsEnum from "../model/config/enums/SubredditSourceOptionsEnum.ts";
import { MOVE_POST_ROW_SESSION_STORAGE_KEY_SUFFIX } from "../RedditWatcherConstants.ts";

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
  CREATE_POST_ROW_AND_INSERT_AT_BEGINNING = "CREATE_POST_ROW_AND_INSERT_AT_BEGINNING",
  POST_ROW_REMOVE_AT = "POST_ROW_REMOVE_AT",
  SET_POST_ATTACHMENT_INDEX = "SET_POST_ATTACHMENT_INDEX",
  CLEAR_POST_ROWS = "CLEAR_POST_ROWS",
  ADD_POSTS_TO_FRONT_OF_ROW = "ADD_POSTS_TO_FRONT_OF_ROW",
  SET_SCROLL_Y = "SET_SCROLL_Y",
  SET_MOUSE_OVER_A_POST_ROW = "SET_MOUSE_OVER_A_POST_ROW",
}

export type PostRowsStringPayloadAction = {
  type: PostRowsActionType.SET_CURRENT_LOCATION;
  payload: string;
};
export type PostRowsNumberPayloadAction = {
  type: PostRowsActionType.POST_ROW_REMOVE_AT | PostRowsActionType.SET_SCROLL_Y;
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

export type CreatePostRowAndInsertAtBeginningAction = {
  type: PostRowsActionType.CREATE_POST_ROW_AND_INSERT_AT_BEGINNING;
  payload: {
    posts: Array<Post>;
    postsToShowInRow: number;
    subredditSourceOption: SubredditSourceOptionsEnum;
  };
};

export type SetPostAttachmentIndexAction = {
  type: PostRowsActionType.SET_POST_ATTACHMENT_INDEX;
  payload: { postRowUuid: string; postUuid: string; index: number };
};

export type AddPostsToFrontOfRowAction = {
  type: PostRowsActionType.ADD_POSTS_TO_FRONT_OF_ROW;
  payload: {
    postRowUuid: string;
    posts: Array<Post>;
    postsToShowInRow: number;
    subredditSourceOption: SubredditSourceOptionsEnum;
  };
};

export default function PostRowsReducer(
  state: PostRowsState,
  action:
    | PostRowsStringPayloadAction
    | PostRowsNumberPayloadAction
    | PostRowsNoPayloadAction
    | CreatePostRowAndInsertAtBeginningAction
    | SetPostAttachmentIndexAction
    | AddPostsToFrontOfRowAction
    | PostRowsBooleanPayloadAction
) {
  switch (action.type) {
    case PostRowsActionType.SET_CURRENT_LOCATION:
      return setCurrentLocation(state, action);
    case PostRowsActionType.TOGGLE_PLAY_PAUSE_BUTTON:
      return togglePlayPauseButton(state);
    case PostRowsActionType.CREATE_POST_ROW_AND_INSERT_AT_BEGINNING:
      return createPostRowAndInsertAtBeginning(state, action);
    case PostRowsActionType.POST_ROW_REMOVE_AT:
      return postRowRemoveAt(state, action);
    case PostRowsActionType.SET_POST_ATTACHMENT_INDEX:
      return setPostAttachmentIndex(state, action);
    case PostRowsActionType.CLEAR_POST_ROWS:
      return clearPostRows(state);
    case PostRowsActionType.ADD_POSTS_TO_FRONT_OF_ROW:
      return addPostsToFrontOfRow(state, action);
    case PostRowsActionType.SET_SCROLL_Y:
      return setScrollY(state, action);
    case PostRowsActionType.SET_MOUSE_OVER_A_POST_ROW:
      return setMouseOverAPostRow(state, action);
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

const createPostRowAndInsertAtBeginning = (
  state: PostRowsState,
  action: {
    type: string;
    payload: {
      posts: Array<Post>;
      postsToShowInRow: number;
      subredditSourceOption: SubredditSourceOptionsEnum;
    };
  }
): PostRowsState => {
  const postRow = createPostRow(
    action.payload.posts,
    action.payload.subredditSourceOption
  );
  const updatedPostRows = [...state.postRows];
  updatedPostRows.unshift(postRow);
  return {
    ...state,
    postRows: updatedPostRows,
  };
};
const postRowRemoveAt = (
  state: PostRowsState,
  action: PostRowsNumberPayloadAction
): PostRowsState => {
  sessionStorage.removeItem(
    `${
      state.postRows[action.payload].postRowUuid
    }${MOVE_POST_ROW_SESSION_STORAGE_KEY_SUFFIX}`
  );
  const updatedPostRows = [...state.postRows];
  updatedPostRows.splice(action.payload, 1);
  return {
    ...state,
    postRows: updatedPostRows,
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
const addPostsToFrontOfRow = (
  state: PostRowsState,
  action: {
    type: string;
    payload: {
      postRowUuid: string;
      posts: Array<Post>;
      postsToShowInRow: number;
      subredditSourceOption: SubredditSourceOptionsEnum;
    };
  }
): PostRowsState => {
  const postRowUuid = action.payload.postRowUuid;
  const postRowsDeepCopy: PostRow[] = JSON.parse(
    JSON.stringify(state.postRows)
  );
  const postRowIndex = postRowsDeepCopy.findIndex(
    (postRow) => postRow.postRowUuid === postRowUuid
  );
  if (postRowIndex === -1) {
    return state;
  }
  postRowsDeepCopy[postRowIndex] = createPostRow(
    [...action.payload.posts, ...state.postRows[postRowIndex].posts],
    action.payload.subredditSourceOption
  );
  return {
    ...state,
    postRows: postRowsDeepCopy,
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

const shouldPause = (
  scrollY: number,
  playPauseButtonIsPaused: boolean,
  mouseOverAPostRow: boolean
) => {
  return scrollY !== 0 || playPauseButtonIsPaused || mouseOverAPostRow;
};
const createPostRow = (
  posts: Array<Post>,
  subredditSourceOption: SubredditSourceOptionsEnum
): PostRow => {
  const postRowUuid = uuidV4();
  return {
    postRowUuid: postRowUuid,
    posts: posts,
    shouldAutoScroll:
      subredditSourceOption !== SubredditSourceOptionsEnum.FrontPage,
  };
};
