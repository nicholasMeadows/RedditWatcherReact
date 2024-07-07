import { Post } from "../model/Post/Post.ts";
import { MAX_POSTS_PER_ROW } from "../RedditWatcherConstants.ts";
import { PostRow } from "../model/PostRow.ts";
import { v4 as uuidV4 } from "uuid";
import SubredditSortOrderOptionsEnum from "../model/config/enums/SubredditSortOrderOptionsEnum.ts";

export type PostRowsState = {
  currentPath: string;
  scrollY: number;
  playPauseButtonIsPaused: boolean;
  postRows: Array<PostRow>;
  postCardWidthPercentage: number;
  postRowContentWidthPx: number;
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
  SET_POST_CARD_WIDTH_PERCENTAGE = "SET_POST_CARD_WIDTH_PERCENTAGE",
  SET_POST_ROW_CONTENT_WIDTH_PX = "SET_POST_ROW_CONTENT_WIDTH_PX",
  SET_LAST_AUTO_SCROLL_POST_ROW_STATE = "SET_LAST_AUTO_SCROLL_POST_ROW_STATE",
  SET_SCROLL_Y = "SET_SCROLL_Y",
  SET_MOUSE_OVER_A_POST_ROW = "SET_MOUSE_OVER_A_POST_ROW",
}

export type PostRowsStringPayloadAction = {
  type: PostRowsActionType.SET_CURRENT_LOCATION;
  payload: string;
};
export type PostRowsNumberPayloadAction = {
  type:
    | PostRowsActionType.POST_ROW_REMOVE_AT
    | PostRowsActionType.SET_POST_ROW_CONTENT_WIDTH_PX
    | PostRowsActionType.SET_SCROLL_Y;
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
    subredditSortOrderOption: SubredditSortOrderOptionsEnum;
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
  };
};

export type SetPostCardWidthPercentageAction = {
  type: PostRowsActionType.SET_POST_CARD_WIDTH_PERCENTAGE;
  payload: {
    postCardWidthPercentage: number;
    postsToShowInRow: number;
  };
};

export type SetLastAutoScrollPostRowStateAction = {
  type: PostRowsActionType.SET_LAST_AUTO_SCROLL_POST_ROW_STATE;
  payload: {
    postRowUuid: string;
    postsToShow: Array<Post>;
    scrollLeft: number;
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
    | SetPostCardWidthPercentageAction
    | SetLastAutoScrollPostRowStateAction
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
    case PostRowsActionType.SET_POST_CARD_WIDTH_PERCENTAGE:
      return setPostCardWidthPercentage(state, action);
    case PostRowsActionType.SET_POST_ROW_CONTENT_WIDTH_PX:
      return setPostRowContentWidthPx(state, action);
    case PostRowsActionType.SET_LAST_AUTO_SCROLL_POST_ROW_STATE:
      return setLastAutoScrollPostRowState(state, action);
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
      subredditSortOrderOption: SubredditSortOrderOptionsEnum;
    };
  }
): PostRowsState => {
  const postRow = createPostRow(
    action.payload.posts,
    state.postCardWidthPercentage,
    action.payload.subredditSortOrderOption
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
  const updatedPostRows = [...state.postRows];
  const postRow = updatedPostRows.find(
    (postRow) => postRow.postRowUuid == postRowUuid
  );
  if (postRow == undefined) {
    return state;
  }
  const updatedPosts = [...postRow.posts];
  const postUuid = action.payload.postUuid;
  const post = updatedPosts.find((post) => post.postUuid == postUuid);
  if (post == undefined) {
    return state;
  }

  post.currentAttachmentIndex = action.payload.index;
  postRow.posts = updatedPosts;
  return {
    ...state,
    postRows: updatedPostRows,
  };
};
const clearPostRows = (state: PostRowsState): PostRowsState => {
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
    };
  }
): PostRowsState => {
  const postRowUuid = action.payload.postRowUuid;
  const updatedPostRows = [...state.postRows];
  const postRow = updatedPostRows.find(
    (postRow) => postRow.postRowUuid == postRowUuid
  );
  if (postRow == undefined) {
    return state;
  }
  postRow.posts = [...action.payload.posts, ...postRow.posts];
  if (postRow.posts.length > MAX_POSTS_PER_ROW) {
    postRow.posts.splice(MAX_POSTS_PER_ROW - postRow.posts.length);
  }

  return {
    ...state,
    postRows: updatedPostRows,
  };
};
const setPostCardWidthPercentage = (
  state: PostRowsState,
  action: {
    type: string;
    payload: {
      postCardWidthPercentage: number;
      postsToShowInRow: number;
    };
  }
): PostRowsState => {
  return {
    ...state,
    postCardWidthPercentage: action.payload.postCardWidthPercentage,
  };
};
const setPostRowContentWidthPx = (
  state: PostRowsState,
  action: PostRowsNumberPayloadAction
): PostRowsState => {
  return {
    ...state,
    postRowContentWidthPx: action.payload,
  };
};
const setLastAutoScrollPostRowState = (
  state: PostRowsState,
  action: {
    type: string;
    payload: {
      postRowUuid: string;
      postsToShow: Array<Post>;
      scrollLeft: number;
    };
  }
): PostRowsState => {
  const postRowUuid = action.payload.postRowUuid;
  const updatedPostRow = [...state.postRows];
  const postRow = updatedPostRow.find(
    (postRow) => postRow.postRowUuid === postRowUuid
  );
  if (postRow !== undefined) {
    postRow.lastAutoScrollPostRowState = {
      postsToShow: action.payload.postsToShow,
      scrollLeft: action.payload.scrollLeft,
    };
  }
  return {
    ...state,
    postRows: updatedPostRow,
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
  postRowContentWidth: number,
  subredditSortOrderOption: SubredditSortOrderOptionsEnum
): PostRow => {
  const postRowUuid = uuidV4();
  return {
    postRowUuid: postRowUuid,
    posts: posts,
    postRowContentWidthAtCreation: postRowContentWidth,
    lastAutoScrollPostRowState: undefined,
    shouldAutoScroll:
      subredditSortOrderOption !== SubredditSortOrderOptionsEnum.FrontPage,
  };
};
