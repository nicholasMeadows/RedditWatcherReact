import { Post } from "../model/Post/Post.ts";
import UserFrontPagePostSortOrderOptionsEnum from "../model/config/enums/UserFrontPagePostSortOrderOptionsEnum.ts";
import {
  MAX_POSTS_PER_ROW,
  POST_ROW_ROUTE,
} from "../RedditWatcherConstants.ts";
import { PostRow } from "../model/PostRow.ts";
import { v4 as uuidV4 } from "uuid";

export type PostRowsState = {
  getPostRowsPaused: boolean;
  currentPath: string;
  scrollY: number;
  clickedOnPlayPauseButton: boolean;
  postRows: Array<PostRow>;
  postRowsHasAtLeast1PostRow: boolean;
  postCardWidthPercentage: number;
  postRowContentWidthPx: number;
};

export enum PostRowsActionType {
  SET_CURRENT_LOCATION = "SET_CURRENT_LOCATION",
  SET_SCROLL_Y = "SET_SCROLL_Y",
  TOGGLE_CLICKED_ON_PLAY_PAUSE_BUTTON = "TOGGLE_CLICKED_ON_PLAY_PAUSE_BUTTON",
  MOUSE_LEAVE_POST_ROW = "MOUSE_LEAVE_POST_ROW",
  CREATE_POST_ROW_AND_INSERT_AT_BEGINNING = "CREATE_POST_ROW_AND_INSERT_AT_BEGINNING",
  CHECK_GET_POST_ROW_PAUSED_CONDITIONS = "CHECK_GET_POST_ROW_PAUSED_CONDITIONS",
  POST_ROW_REMOVE_AT = "POST_ROW_REMOVE_AT",
  SET_POST_ATTACHMENT_INDEX = "SET_POST_ATTACHMENT_INDEX",
  CLEAR_POST_ROWS = "CLEAR_POST_ROWS",
  ADD_POSTS_TO_FRONT_OF_ROW = "ADD_POSTS_TO_FRONT_OF_ROW",
  SET_POST_CARD_WIDTH_PERCENTAGE = "SET_POST_CARD_WIDTH_PERCENTAGE",
  SET_POST_ROW_CONTENT_WIDTH_PX = "SET_POST_ROW_CONTENT_WIDTH_PX",
  MOUSE_ENTER_POST_ROW = "MOUSE_ENTER_POST_ROW",
  SET_LAST_AUTO_SCROLL_POST_ROW_STATE = "SET_LAST_AUTO_SCROLL_POST_ROW_STATE",
}

export type PostRowsStringPayloadAction = {
  type:
    | PostRowsActionType.SET_CURRENT_LOCATION
    | PostRowsActionType.MOUSE_LEAVE_POST_ROW
    | PostRowsActionType.MOUSE_ENTER_POST_ROW;
  payload: string;
};
export type PostRowsNumberPayloadAction = {
  type:
    | PostRowsActionType.SET_SCROLL_Y
    | PostRowsActionType.POST_ROW_REMOVE_AT
    | PostRowsActionType.SET_POST_ROW_CONTENT_WIDTH_PX;
  payload: number;
};
export type PostRowsNoPayloadAction = {
  type:
    | PostRowsActionType.TOGGLE_CLICKED_ON_PLAY_PAUSE_BUTTON
    | PostRowsActionType.CHECK_GET_POST_ROW_PAUSED_CONDITIONS
    | PostRowsActionType.CLEAR_POST_ROWS;
};

export type CreatePostRowAndInsertAtBeginningAction = {
  type: PostRowsActionType.CREATE_POST_ROW_AND_INSERT_AT_BEGINNING;
  payload: {
    posts: Array<Post>;
    postsToShowInRow: number;
    userFrontPagePostSortOrderOption: UserFrontPagePostSortOrderOptionsEnum;
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
) {
  switch (action.type) {
    case PostRowsActionType.SET_CURRENT_LOCATION:
      return setCurrentLocation(state, action);
    case PostRowsActionType.SET_SCROLL_Y:
      return setScrollY(state, action);
    case PostRowsActionType.TOGGLE_CLICKED_ON_PLAY_PAUSE_BUTTON:
      return toggleClickedOnPlayPauseButton(state);
    case PostRowsActionType.MOUSE_LEAVE_POST_ROW:
      return mouseLeavePostRow(state, action);
    case PostRowsActionType.CREATE_POST_ROW_AND_INSERT_AT_BEGINNING:
      return createPostRowAndInsertAtBeginning(state, action);
    case PostRowsActionType.CHECK_GET_POST_ROW_PAUSED_CONDITIONS:
      return checkGetPostRowPausedConditions(state);
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
    case PostRowsActionType.MOUSE_ENTER_POST_ROW:
      return mouseEnterPostRow(state, action);
    case PostRowsActionType.SET_LAST_AUTO_SCROLL_POST_ROW_STATE:
      return setLastAutoScrollPostRowState(state, action);
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
    getPostRowsPaused: checkGetPostRowPausedConditions(state).getPostRowsPaused,
    currentPath: action.payload,
  };
};
const setScrollY = (
  state: PostRowsState,
  action: PostRowsNumberPayloadAction
): PostRowsState => {
  return {
    ...state,
    getPostRowsPaused: checkGetPostRowPausedConditions(state).getPostRowsPaused,
    scrollY: action.payload,
  };
};
const toggleClickedOnPlayPauseButton = (
  state: PostRowsState
): PostRowsState => {
  return {
    ...state,
    getPostRowsPaused: checkGetPostRowPausedConditions(state).getPostRowsPaused,
    clickedOnPlayPauseButton: !state.clickedOnPlayPauseButton,
  };
};
const mouseLeavePostRow = (
  state: PostRowsState,
  action: PostRowsStringPayloadAction
): PostRowsState => {
  const updatedPostRows = [...state.postRows];
  const postRow = updatedPostRows.find(
    (postRow) => postRow.postRowUuid == action.payload
  );
  if (postRow != undefined) {
    postRow.mouseOverPostRow = false;
  }
  return {
    ...state,
    getPostRowsPaused: checkGetPostRowPausedConditions(state).getPostRowsPaused,
    postRows: updatedPostRows,
  };
};
const createPostRowAndInsertAtBeginning = (
  state: PostRowsState,
  action: {
    type: string;
    payload: {
      posts: Array<Post>;
      postsToShowInRow: number;
      userFrontPagePostSortOrderOption: UserFrontPagePostSortOrderOptionsEnum;
    };
  }
): PostRowsState => {
  const postRow = createPostRow(
    action.payload.posts,
    state.postCardWidthPercentage,
    action.payload.userFrontPagePostSortOrderOption
  );
  const updatedPostRows = [...state.postRows];
  updatedPostRows.unshift(postRow);
  return {
    ...state,
    postRows: updatedPostRows,
    postRowsHasAtLeast1PostRow: true,
  };
};
const checkGetPostRowPausedConditions = (
  state: PostRowsState
): PostRowsState => {
  if (state.postRows.length == 0) {
    return {
      ...state,
      getPostRowsPaused: false,
    };
  }
  if (state.clickedOnPlayPauseButton) {
    return {
      ...state,
      getPostRowsPaused: true,
    };
  }

  const mouseOverPostRow = state.postRows.find(
    (postRow) => postRow.mouseOverPostRow
  );
  return {
    ...state,
    getPostRowsPaused:
      state.scrollY != 0 ||
      mouseOverPostRow != undefined ||
      state.currentPath != POST_ROW_ROUTE,
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
    postRowsHasAtLeast1PostRow: false,
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
const mouseEnterPostRow = (
  state: PostRowsState,
  action: PostRowsStringPayloadAction
): PostRowsState => {
  const postRowUuid = action.payload;
  const updatedPostRow = [...state.postRows];
  const postRow = updatedPostRow.find(
    (postRow) => postRow.postRowUuid == postRowUuid
  );
  if (postRow == undefined) {
    return state;
  }
  postRow.mouseOverPostRow = true;
  return {
    ...state,
    postRows: updatedPostRow,
    getPostRowsPaused: checkGetPostRowPausedConditions(state).getPostRowsPaused,
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
const createPostRow = (
  posts: Array<Post>,
  postRowContentWidth: number,
  userFrontPageSortOption: UserFrontPagePostSortOrderOptionsEnum
): PostRow => {
  const postRowUuid = uuidV4();
  return {
    postRowUuid: postRowUuid,
    posts: posts,
    postRowContentWidthAtCreation: postRowContentWidth,
    userFrontPagePostSortOrderOptionAtRowCreation: userFrontPageSortOption,
    mouseOverPostRow: false,
    lastAutoScrollPostRowState: undefined,
  };
};
