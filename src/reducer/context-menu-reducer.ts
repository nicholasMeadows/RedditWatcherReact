import { ContextMenuState } from "../model/state/ContextMenuState.ts";
import { Post } from "../model/Post/Post.ts";
import { Subreddit } from "../model/Subreddit/Subreddit.ts";
import { SubredditLists } from "../model/SubredditList/SubredditLists.ts";
import { SubredditAccountSearchResult } from "../model/SubredditAccountSearchResult.ts";

export enum ContextMenuActionType {
  OPEN_CONTEXT_MENU_FOR_POST = "OPEN_CONTEXT_MENU_FOR_POST",
  OPEN_CONTEXT_MENU_FOR_SIDE_BAR = "OPEN_CONTEXT_MENU_FOR_SIDE_BAR",
  OPEN_CONTEXT_MENU_FOR_SUBREDDIT_LIST = "OPEN_CONTEXT_MENU_FOR_SUBREDDIT_LIST",
  OPEN_CONTEXT_MENU_FOR_SUBREDDIT_LIST_ITEM = "OPEN_CONTEXT_MENU_FOR_SUBREDDIT_LIST_ITEM",
  OPEN_CONTEXT_MENU_FOR_REDDIT_SEARCH_ITEM = "OPEN_CONTEXT_MENU_FOR_REDDIT_SEARCH_ITEM",
  CLOSE_CONTEXT_MENU = "CLOSE_CONTEXT_MENU",
  SET_EXPAND_ADD_TO_LIST = "SET_EXPAND_ADD_TO_LIST",
  SET_EXPAND_REMOVE_TO_LIST = "SET_EXPAND_REMOVE_TO_LIST",
}

export type ContextMenuNoPayloadAction = {
  type: ContextMenuActionType.CLOSE_CONTEXT_MENU;
};

export type ContextMenuBooleanPayloadAction = {
  type:
    | ContextMenuActionType.SET_EXPAND_ADD_TO_LIST
    | ContextMenuActionType.SET_EXPAND_REMOVE_TO_LIST;
  payload: boolean;
};

export type OpenContextMenuForPostAction = {
  type: ContextMenuActionType.OPEN_CONTEXT_MENU_FOR_POST;
  payload: {
    post: Post;
    x: number;
    y: number;
    postRowUuid: string;
  };
};
export type OpenContextMenuForSideBarAction = {
  type: ContextMenuActionType.OPEN_CONTEXT_MENU_FOR_SIDE_BAR;
  payload: {
    subreddit: Subreddit;
    x: number;
    y: number;
  };
};
export type OpenContextMenuForSubredditListAction = {
  type: ContextMenuActionType.OPEN_CONTEXT_MENU_FOR_SUBREDDIT_LIST;
  payload: {
    subredditList: SubredditLists;
    x: number;
    y: number;
  };
};
export type OpenContextMenuForSubredditListItemAction = {
  type: ContextMenuActionType.OPEN_CONTEXT_MENU_FOR_SUBREDDIT_LIST_ITEM;
  payload: {
    subredditListItem: Subreddit;
    x: number;
    y: number;
  };
};
export type OpenContextMenuForRedditSearchItemAction = {
  type: ContextMenuActionType.OPEN_CONTEXT_MENU_FOR_REDDIT_SEARCH_ITEM;
  payload: {
    redditSearchItem: SubredditAccountSearchResult;
    x: number;
    y: number;
  };
};

export default function ContextMenuReducer(
  state: ContextMenuState,
  action:
    | ContextMenuBooleanPayloadAction
    | ContextMenuNoPayloadAction
    | OpenContextMenuForPostAction
    | OpenContextMenuForSideBarAction
    | OpenContextMenuForSubredditListAction
    | OpenContextMenuForSubredditListItemAction
    | OpenContextMenuForRedditSearchItemAction
): ContextMenuState {
  switch (action.type) {
    case ContextMenuActionType.OPEN_CONTEXT_MENU_FOR_POST:
      return openContextMenuForPost(action);
    case ContextMenuActionType.OPEN_CONTEXT_MENU_FOR_SIDE_BAR:
      return openContextMenuForSideBar(action);
    case ContextMenuActionType.OPEN_CONTEXT_MENU_FOR_SUBREDDIT_LIST:
      return openContextMenuForSubredditList(action);
    case ContextMenuActionType.OPEN_CONTEXT_MENU_FOR_SUBREDDIT_LIST_ITEM:
      return openContextMenuForSubredditListItem(action);
    case ContextMenuActionType.OPEN_CONTEXT_MENU_FOR_REDDIT_SEARCH_ITEM:
      return openContextMenuForRedditSearchItem(action);
    case ContextMenuActionType.CLOSE_CONTEXT_MENU:
      return closeContextMenu();
    case ContextMenuActionType.SET_EXPAND_ADD_TO_LIST:
      return setExpandAddToList(state, action);
    case ContextMenuActionType.SET_EXPAND_REMOVE_TO_LIST:
      return setExpandRemoveFromList(state, action);
    default:
      return state;
  }
}

const setExpandAddToList = (
  state: ContextMenuState,
  action: ContextMenuBooleanPayloadAction
): ContextMenuState => {
  const updatedShowButtonControls = { ...state.showButtonControls };
  updatedShowButtonControls.expandAddToList = action.payload;
  return {
    ...state,
    showButtonControls: updatedShowButtonControls,
  };
};
const setExpandRemoveFromList = (
  state: ContextMenuState,
  action: ContextMenuBooleanPayloadAction
): ContextMenuState => {
  const updatedShowButtonControls = { ...state.showButtonControls };
  updatedShowButtonControls.expandRemoveFromList = action.payload;
  return {
    ...state,
    showButtonControls: updatedShowButtonControls,
  };
};
const openContextMenuForPost = (
  action: OpenContextMenuForPostAction
): ContextMenuState => {
  const post = action.payload.post;
  const x = action.payload.x;
  const y = action.payload.y;
  const postRowUuid = action.payload.postRowUuid;

  const base = makeBaseContextState(true, x, y);
  base.subreddit = post.subreddit;
  base.copyInfo = {
    url: post.attachments[post.currentAttachmentIndex].url,
    mediaType: post.attachments[post.currentAttachmentIndex].mediaType,
  };
  base.openSubredditLink = buildOpenSubredditLink(
    post.subreddit.isUser,
    post.subreddit.displayName
  );
  base.openPostPermaLink = buildOpenPostPermaLink(post.permaLink);
  setButtonControls(base, { post: post });
  base.menuOpenOnPostRowUuid = postRowUuid;
  return base;
};

const openContextMenuForSideBar = (action: OpenContextMenuForSideBarAction) => {
  const subreddit = action.payload.subreddit;
  const x = action.payload.x;
  const y = action.payload.y;
  const base = makeBaseContextState(true, x, y);
  base.subreddit = subreddit;
  base.openSubredditLink = buildOpenSubredditLink(
    subreddit.isUser,
    subreddit.displayName
  );

  setButtonControls(base, { subreddit: subreddit });
  return base;
};

const openContextMenuForSubredditList = (
  action: OpenContextMenuForSubredditListAction
) => {
  const subredditList = action.payload.subredditList;
  const x = action.payload.x;
  const y = action.payload.y;
  const base = makeBaseContextState(true, x, y);
  base.subredditList = subredditList;
  setButtonControls(base, { subredditList: subredditList });
  return base;
};

const openContextMenuForSubredditListItem = (
  action: OpenContextMenuForSubredditListItemAction
) => {
  const subredditListItem = action.payload.subredditListItem;
  const x = action.payload.x;
  const y = action.payload.y;
  const base = makeBaseContextState(true, x, y);
  base.subreddit = subredditListItem;
  base.openSubredditLink = buildOpenSubredditLink(
    subredditListItem.isUser,
    subredditListItem.displayName
  );
  setButtonControls(base, { subreddit: subredditListItem });
  return base;
};

const openContextMenuForRedditSearchItem = (
  action: OpenContextMenuForRedditSearchItemAction
) => {
  const redditSearchItem = action.payload.redditSearchItem;
  const x = action.payload.x;
  const y = action.payload.y;
  const base = makeBaseContextState(true, x, y);

  base.openSubredditLink = buildOpenSubredditLink(
    redditSearchItem.isUser,
    redditSearchItem.displayName
  );
  base.subreddit = redditSearchItem;
  setButtonControls(base, { searchResultItem: redditSearchItem });
  return base;
};

const closeContextMenu = (): ContextMenuState => {
  return makeBaseContextState(false, 0, 0);
};
const makeBaseContextState = (
  showContextMenu: boolean,
  x: number,
  y: number
): ContextMenuState => {
  return {
    showContextMenu: showContextMenu,
    x: x,
    y: y,
    copyInfo: undefined,
    subredditList: undefined,
    subreddit: undefined,
    openSubredditLink: undefined,
    openPostPermaLink: undefined,
    showButtonControls: {
      showAddToList: false,
      showOpenSubreddit: false,
      showRemoveFromList: false,
      showSkipToSubreddit: false,
      showCopy: false,
      showUpdateListName: false,
      expandAddToList: false,
      showDeleteList: false,
      showOpenPost: false,
      expandRemoveFromList: false,
      showOpenImageInNewTab: false,
    },
    menuOpenOnPostRowUuid: undefined,
  };
};

const buildOpenPostPermaLink = (permaLink: string) => {
  return `https://www.reddit.com${permaLink}`;
};

const buildOpenSubredditLink = (isUser: boolean, displayName: string) => {
  return `https://www.reddit.com/${isUser ? "u" : "r"}/${displayName}`;
};

const setButtonControls = (
  state: ContextMenuState,
  params: {
    post?: Post;
    subreddit?: Subreddit;
    subredditList?: SubredditLists;
    searchResultItem?: SubredditAccountSearchResult;
  }
) => {
  const { post, subreddit, subredditList, searchResultItem } = params;
  if (post != undefined) {
    state.showButtonControls.showOpenPost = true;
    state.showButtonControls.showOpenImageInNewTab = true;
    state.showButtonControls.showOpenSubreddit = true;
    state.showButtonControls.showCopy = true;
    state.showButtonControls.showSkipToSubreddit = true;
    state.showButtonControls.showAddToList = true;
    state.showButtonControls.showRemoveFromList = true;
  }

  if (subreddit != undefined) {
    state.showButtonControls.showOpenSubreddit = true;
    state.showButtonControls.showSkipToSubreddit = true;
    state.showButtonControls.showAddToList = true;
    state.showButtonControls.showRemoveFromList = true;
  }

  if (subredditList != undefined) {
    state.showButtonControls.showUpdateListName = true;
    state.showButtonControls.showDeleteList = true;
  }

  if (searchResultItem) {
    state.showButtonControls.showOpenSubreddit = true;
    state.showButtonControls.showSkipToSubreddit = true;
    state.showButtonControls.showAddToList = true;
    state.showButtonControls.showRemoveFromList = true;
  }
};
