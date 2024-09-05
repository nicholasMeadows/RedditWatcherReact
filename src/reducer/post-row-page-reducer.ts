import { PostRow, PostsToShowUuidsObj } from "../model/PostRow.ts";
import {
  MAX_POST_ROWS_TO_SHOW_IN_VIEW,
  MAX_POSTS_PER_ROW,
  MOVE_POST_ROW_SESSION_STORAGE_KEY_SUFFIX,
} from "../RedditWatcherConstants.ts";
import { Post } from "../model/Post/Post.ts";
import SubredditSourceOptionsEnum from "../model/config/enums/SubredditSourceOptionsEnum.ts";
import PostSortOrderOptionsEnum from "../model/config/enums/PostSortOrderOptionsEnum.ts";
import { v4 as uuidV4 } from "uuid";
import { sortPostsByCreate } from "../util/RedditServiceUtil.ts";
import { PostRowPageState } from "../model/state/PostRowsState.ts";

export enum PostRowPageActionType {
  SET_CURRENT_LOCATION = "SET_CURRENT_LOCATION",
  SET_PLAY_PAUSE_BUTTON_IS_CLICKED = "SET_PLAY_PAUSE_BUTTON_IS_CLICKED",
  SET_POST_ATTACHMENT_INDEX = "SET_POST_ATTACHMENT_INDEX",
  CLEAR_POST_ROWS = "CLEAR_POST_ROWS",
  SET_SCROLL_Y = "SET_SCROLL_Y",
  SET_MOUSE_OVER_POST_ROW_UUID = "SET_MOUSE_OVER_POST_ROW_UUID",
  ADD_POST_ROW = "ADD_POST_ROW",
  SET_POSTS_TO_SHOW_UUIDS = "SET_POSTS_TO_SHOW_UUIDS",
  SET_POST_SLIDER_LEFT = "SET_POST_SLIDER_LEFT",
  SET_POST_SLIDER_TRANSITION_TIME = "SET_POST_SLIDER_TRANSITION_TIME",
}

export type PostRowPageStringPayloadAction = {
  type: PostRowPageActionType.SET_CURRENT_LOCATION;
  payload: string;
};
export type PostRowPageNumberPayloadAction = {
  type: PostRowPageActionType.SET_SCROLL_Y;
  payload: number;
};
export type PostRowPageBooleanPayloadAction = {
  type: PostRowPageActionType.SET_PLAY_PAUSE_BUTTON_IS_CLICKED;
  payload: boolean;
};
export type PostRowPageNoPayloadAction = {
  type: PostRowPageActionType.CLEAR_POST_ROWS;
};
export type PostRowPageSetMouseOverPostRowUuidAction = {
  type: PostRowPageActionType.SET_MOUSE_OVER_POST_ROW_UUID;
  payload: string | undefined;
};
export type SetPostAttachmentIndexAction = {
  type: PostRowPageActionType.SET_POST_ATTACHMENT_INDEX;
  payload: { postRowUuid: string; postUuid: string; index: number };
};

export type AddPostRowAction = {
  type: PostRowPageActionType.ADD_POST_ROW;
  payload: {
    posts: Array<Post>;
    gottenWithSubredditSourceOption: SubredditSourceOptionsEnum;
    gottenWithPostSortOrderOption: PostSortOrderOptionsEnum;
  };
};

export type SetPostSliderLeftOrTransitionTimeAction = {
  type:
    | PostRowPageActionType.SET_POST_SLIDER_LEFT
    | PostRowPageActionType.SET_POST_SLIDER_TRANSITION_TIME;
  payload: {
    postRowUuid: string;
    value: number;
  };
};
export type SetPostsToShowUuidsAction = {
  type: PostRowPageActionType.SET_POSTS_TO_SHOW_UUIDS;
  payload: {
    postRowUuid: string;
    postsToShowUuids: Array<PostsToShowUuidsObj>;
  };
};

export default function PostRowPageReducer(
  state: PostRowPageState,
  action:
    | PostRowPageStringPayloadAction
    | PostRowPageNumberPayloadAction
    | PostRowPageNoPayloadAction
    | SetPostAttachmentIndexAction
    | PostRowPageBooleanPayloadAction
    | AddPostRowAction
    | PostRowPageSetMouseOverPostRowUuidAction
    | SetPostSliderLeftOrTransitionTimeAction
    | SetPostsToShowUuidsAction
) {
  switch (action.type) {
    case PostRowPageActionType.SET_CURRENT_LOCATION:
      return setCurrentLocation(state, action);
    case PostRowPageActionType.SET_PLAY_PAUSE_BUTTON_IS_CLICKED:
      return setPlayPauseButtonIsClicked(state, action);
    case PostRowPageActionType.SET_POST_ATTACHMENT_INDEX:
      return setPostAttachmentIndex(state, action);
    case PostRowPageActionType.CLEAR_POST_ROWS:
      return clearPostRows(state);
    case PostRowPageActionType.SET_SCROLL_Y:
      return setScrollY(state, action);
    case PostRowPageActionType.SET_MOUSE_OVER_POST_ROW_UUID:
      return setMouseOverPostRowUuid(state, action);
    case PostRowPageActionType.ADD_POST_ROW:
      return addPostRow(state, action);
    case PostRowPageActionType.SET_POSTS_TO_SHOW_UUIDS:
      return setPostsToShowUuids(state, action);
    case PostRowPageActionType.SET_POST_SLIDER_LEFT:
      return setPostSliderLeft(state, action);
    case PostRowPageActionType.SET_POST_SLIDER_TRANSITION_TIME:
      return setPostSliderTransitionTime(state, action);
    default:
      return state;
  }
}
const setCurrentLocation = (
  state: PostRowPageState,
  action: PostRowPageStringPayloadAction
): PostRowPageState => {
  return {
    ...state,
    currentPath: action.payload,
  };
};

const setPostAttachmentIndex = (
  state: PostRowPageState,
  action: {
    type: string;
    payload: { postRowUuid: string; postUuid: string; index: number };
  }
): PostRowPageState => {
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
const clearPostRows = (state: PostRowPageState): PostRowPageState => {
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
  state: PostRowPageState,
  action: PostRowPageNumberPayloadAction
): PostRowPageState => {
  return {
    ...state,
    scrollY: action.payload,
  };
};
const setPlayPauseButtonIsClicked = (
  state: PostRowPageState,
  action: PostRowPageBooleanPayloadAction
): PostRowPageState => {
  return {
    ...state,
    playPauseButtonIsClicked: action.payload,
  };
};
const setMouseOverPostRowUuid = (
  state: PostRowPageState,
  action: PostRowPageSetMouseOverPostRowUuidAction
): PostRowPageState => {
  return {
    ...state,
    mouseOverPostRowUuid: action.payload,
  };
};
const addPostRow = (
  state: PostRowPageState,
  action: AddPostRowAction
): PostRowPageState => {
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

  const updatedPostRows = [...state.postRows];
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
    updatedPostRows.push(postRow);
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

      updatedPostRows[0] = createPostRow(
        updatedPosts,
        gottenWithSubredditSourceOption,
        gottenWithPostSortOrderOption
      );
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
      updatedPostRows.unshift(postRow);
    }
  }

  if (updatedPostRows.length > MAX_POST_ROWS_TO_SHOW_IN_VIEW) {
    updatedPostRows.splice(MAX_POST_ROWS_TO_SHOW_IN_VIEW);
  }
  return {
    ...state,
    postRows: updatedPostRows,
  };
};

const setPostsToShowUuids = (
  state: PostRowPageState,
  action: SetPostsToShowUuidsAction
): PostRowPageState => {
  const postRowUuid = action.payload.postRowUuid;
  const updatedPostRows = [...state.postRows];
  const postRow = updatedPostRows.find(
    (postRow) => postRow.postRowUuid === postRowUuid
  );
  if (postRow === undefined) {
    return state;
  }
  postRow.postsToShowUuids = action.payload.postsToShowUuids;
  return {
    ...state,
    postRows: updatedPostRows,
  };
};
const setPostSliderLeft = (
  state: PostRowPageState,
  action: SetPostSliderLeftOrTransitionTimeAction
): PostRowPageState => {
  const postRowUuid = action.payload.postRowUuid;
  const updatedPostRows = [...state.postRows];
  const postRow = updatedPostRows.find(
    (postRow) => postRow.postRowUuid === postRowUuid
  );
  if (postRow === undefined) {
    return state;
  }
  postRow.postSliderLeft = action.payload.value;
  return {
    ...state,
    postRows: updatedPostRows,
  };
};
const setPostSliderTransitionTime = (
  state: PostRowPageState,
  action: SetPostSliderLeftOrTransitionTimeAction
): PostRowPageState => {
  const postRowUuid = action.payload.postRowUuid;
  const updatedPostRows = [...state.postRows];
  const postRow = updatedPostRows.find(
    (postRow) => postRow.postRowUuid === postRowUuid
  );
  if (postRow === undefined) {
    return state;
  }
  postRow.postSliderLeftTransitionTime = action.payload.value;
  return {
    ...state,
    postRows: updatedPostRows,
  };
};

const trimPostsToMaxLength = (posts: Array<Post>) => {
  if (posts.length > MAX_POSTS_PER_ROW) {
    posts.splice(MAX_POSTS_PER_ROW - 1);
  }
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
    gottenWithSubredditSourceOption: gottenWithSubredditSourceOption,
    gottenWithPostSortOrderOption: gottenWithPostSortOrderOption,
    postSliderLeftTransitionTime: 0,
    postSliderLeft: 0,
    postsToShowUuids: [],
  };
};
