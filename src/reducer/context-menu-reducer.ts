import { SubredditLists } from "../model/SubredditList/SubredditLists.ts";
import { Subreddit } from "../model/Subreddit/Subreddit.ts";
import PostContextMenuEvent from "../model/Events/PostContextMenuEvent.ts";
import CustomContextMenuEvent from "../model/Events/CustomContextMenuEvent.ts";
import { Post } from "../model/Post/Post.ts";
import { SubredditAccountSearchResult } from "../model/SubredditAccountSearchResult.ts";
import SubredditListItemContextMenuEvent from "../model/Events/SubredditListItemContextMenuEvent.ts";
import SubredditListContextMenuEvent from "../model/Events/SubredditListContextMenuEvent.ts";
import SideBarSubredditMenuEvent from "../model/Events/SideBarSubredditMenuEvent.ts";
import { RedditSearchItemContextMenuEvent } from "../model/Events/RedditSearchItemContextMenuEvent.ts";

interface ContextDataObjects {
  post?: Post | undefined;
  subredditAccountSearchResult?: SubredditAccountSearchResult | undefined;
  subredditLists?: SubredditLists | undefined;
  subreddit?: Subreddit | undefined;
}

type ShowButtonControls = {
  showOpenPost: boolean;
  showOpenImageInNewTab: boolean;
  showOpenSubreddit: boolean;
  showCopy: boolean;
  showSkipToSubreddit: boolean;
  showAddToList: boolean;
  expandAddToList: boolean;
  showRemoveFromList: boolean;
  expandRemoveFromList: boolean;
  showUpdateListName: boolean;
  showDeleteList: boolean;
};

export type ContextMenuState = {
  showContextMenu: boolean;
  x: number;
  y: number;
  copyInfo:
    | {
        url: string;
        mediaType: string;
      }
    | undefined;
  updateSubredditListInfo:
    | {
        subredditList: SubredditLists;
      }
    | undefined;
  subreddit: Subreddit | undefined;
  openPostPermaLink: string | undefined;
  openSubredditLink: string | undefined;
  showButtonControls: ShowButtonControls;
};

interface ShowButtonControlsOptional {
  showOpenPost?: boolean | undefined;
  showOpenImageInNewTab?: boolean | undefined;
  showOpenSubreddit?: boolean | undefined;
  showCopy?: boolean | undefined;
  showSkipToSubreddit?: boolean | undefined;
  showAddToList?: boolean | undefined;
  showRemoveFromList?: boolean | undefined;
  showUpdateListName?: boolean | undefined;
  showDeleteList: boolean | undefined;
}

export enum ContextMenuActionType {
  SET_POST_CONTEXT_MENU_EVENT = "SET_POST_CONTEXT_MENU_EVENT",
  SET_SUBREDDIT_LIST_ITEM_CONTEXT_MENU_EVENT = "SET_SUBREDDIT_LIST_ITEM_CONTEXT_MENU_EVENT",
  SET_SUBREDDIT_LIST_CONTEXT_MENU_EVENT = "SET_SUBREDDIT_LIST_CONTEXT_MENU_EVENT",
  SET_SIDE_BAR_SUB_REDDIT_MENU_EVENT = "SET_SIDE_BAR_SUB_REDDIT_MENU_EVENT",
  CLOSE_CONTEXT_MENU = "CLOSE_CONTEXT_MENU",
  SET_REDDIT_SEARCH_ITEM_CONTEXT_MENU_EVENT = "SET_REDDIT_SEARCH_ITEM_CONTEXT_MENU_EVENT",
  SET_EXPAND_ADD_TO_LIST = "SET_EXPAND_ADD_TO_LIST",
  SET_EXPAND_REMOVE_TO_LIST = "SET_EXPAND_REMOVE_TO_LIST",
}

export type SetPostContextMenuAction = {
  type: ContextMenuActionType.SET_POST_CONTEXT_MENU_EVENT;
  payload: {
    event: PostContextMenuEvent;
    showButtonOverride?: ShowButtonControlsOptional | undefined;
  };
};

export type SetSubredditListItemContextMenuAction = {
  type: ContextMenuActionType.SET_SUBREDDIT_LIST_ITEM_CONTEXT_MENU_EVENT;
  payload: {
    event: SubredditListItemContextMenuEvent;
    showButtonOverride?: ShowButtonControlsOptional | undefined;
  };
};

export type SetSubredditListContextMenuAction = {
  type: ContextMenuActionType.SET_SUBREDDIT_LIST_CONTEXT_MENU_EVENT;
  payload: {
    event: SubredditListContextMenuEvent;
    showButtonOverride?: ShowButtonControlsOptional | undefined;
  };
};

export type SetSideBarSubredditMenuAction = {
  type: ContextMenuActionType.SET_SIDE_BAR_SUB_REDDIT_MENU_EVENT;
  payload: {
    event: SideBarSubredditMenuEvent;
    showButtonOverride?: ShowButtonControlsOptional | undefined;
  };
};

export type CloseContextMenuAction = {
  type: ContextMenuActionType.CLOSE_CONTEXT_MENU;
};
export type SetRedditSearchItemContextMenuAction = {
  type: ContextMenuActionType.SET_REDDIT_SEARCH_ITEM_CONTEXT_MENU_EVENT;
  payload: {
    event: RedditSearchItemContextMenuEvent;
    showButtonOverride?: ShowButtonControlsOptional | undefined;
  };
};

export type SetExpandAddOrRemoveToListAction = {
  type:
    | ContextMenuActionType.SET_EXPAND_ADD_TO_LIST
    | ContextMenuActionType.SET_EXPAND_REMOVE_TO_LIST;
  payload: boolean;
};
export default function ContextMenuReducer(
  state: ContextMenuState,
  action:
    | SetPostContextMenuAction
    | SetSubredditListItemContextMenuAction
    | SetSubredditListContextMenuAction
    | SetSideBarSubredditMenuAction
    | CloseContextMenuAction
    | SetRedditSearchItemContextMenuAction
    | SetExpandAddOrRemoveToListAction
): ContextMenuState {
  switch (action.type) {
    case ContextMenuActionType.SET_POST_CONTEXT_MENU_EVENT:
      return setPostContextMenuEvent(action);
    case ContextMenuActionType.SET_SUBREDDIT_LIST_ITEM_CONTEXT_MENU_EVENT:
      return setSubredditListItemContextMenuEvent(action);
    case ContextMenuActionType.SET_SUBREDDIT_LIST_CONTEXT_MENU_EVENT:
      return setSubredditListContextMenuEvent(action);
    case ContextMenuActionType.SET_SIDE_BAR_SUB_REDDIT_MENU_EVENT:
      return setSideBarSubredditMenuEvent(action);
    case ContextMenuActionType.CLOSE_CONTEXT_MENU:
      return closeContextMenu();
    case ContextMenuActionType.SET_REDDIT_SEARCH_ITEM_CONTEXT_MENU_EVENT:
      return setRedditSearchItemContextMenuEvent(action);
    case ContextMenuActionType.SET_EXPAND_REMOVE_TO_LIST:
      return setExpandRemoveToList(state, action);
    case ContextMenuActionType.SET_EXPAND_ADD_TO_LIST:
      return setExpandAddToList(state, action);
    default:
      return state;
  }
}

const setPostContextMenuEvent = (
  action: SetPostContextMenuAction
): ContextMenuState => {
  const event = action.payload.event;
  const showButtonOverride = action.payload.showButtonOverride;
  const post = event.post;

  return setContextStateFields(event, { post: post }, showButtonOverride);
};

const setSubredditListItemContextMenuEvent = (
  action: SetSubredditListItemContextMenuAction
): ContextMenuState => {
  const event = action.payload.event;
  const showButtonOverride = action.payload.showButtonOverride;
  const subreddit = event.subreddit;
  return setContextStateFields(
    event,
    { subreddit: subreddit },
    showButtonOverride
  );
};

const setSubredditListContextMenuEvent = (
  action: SetSubredditListContextMenuAction
): ContextMenuState => {
  const event = action.payload.event;
  const showButtonOverride = action.payload.showButtonOverride;
  const subredditList = event.subredditList;
  return setContextStateFields(
    event,
    { subredditLists: subredditList },
    showButtonOverride
  );
};
const setSideBarSubredditMenuEvent = (action: {
  type: string;
  payload: {
    event: SideBarSubredditMenuEvent;
    showButtonOverride?: ShowButtonControlsOptional | undefined;
  };
}) => {
  const event = action.payload.event;
  const showButtonOverride = action.payload.showButtonOverride;
  const subreddit = event.subreddit;
  return setContextStateFields(
    event,
    { subreddit: subreddit },
    showButtonOverride
  );
};
const closeContextMenu = () => {
  return resetContextMenuFields();
};
const setRedditSearchItemContextMenuEvent = (action: {
  type: string;
  payload: {
    event: RedditSearchItemContextMenuEvent;
    showButtonOverride?: ShowButtonControlsOptional | undefined;
  };
}) => {
  const event = action.payload.event;
  const showButtonOverride = action.payload.showButtonOverride;
  const searchResultItem = event.searchResultItem;
  return setContextStateFields(
    event,
    { subredditAccountSearchResult: searchResultItem },
    showButtonOverride
  );
};
const setExpandAddToList = (
  state: ContextMenuState,
  action: SetExpandAddOrRemoveToListAction
): ContextMenuState => {
  const updatedShowButtonControls = {
    ...state.showButtonControls,
    expandAddToList: action.payload,
    expandRemoveFromList: false,
  };
  return {
    ...state,
    showButtonControls: updatedShowButtonControls,
  };
};
const setExpandRemoveToList = (
  state: ContextMenuState,
  action: SetExpandAddOrRemoveToListAction
): ContextMenuState => {
  const updatedShowButtonControls = {
    ...state.showButtonControls,
    expandRemoveFromList: action.payload,
    expandAddToList: false,
  };
  return {
    ...state,
    showButtonControls: updatedShowButtonControls,
  };
};

const setContextStateFields = (
  event: CustomContextMenuEvent,
  contextDataObjects: ContextDataObjects,
  showButtonControls?: ShowButtonControlsOptional
) => {
  const updatedState = resetContextMenuFields();
  updatedState.showContextMenu = true;
  updatedState.x = event.x;
  updatedState.y = event.y;

  if (contextDataObjects.post != undefined) {
    const post = contextDataObjects.post;
    updatedState.copyInfo = {
      url: post.attachments[post.currentAttachmentIndex].url,
      mediaType: post.attachments[post.currentAttachmentIndex].mediaType,
    };
    updatedState.openPostPermaLink = buildOpenPostPermaLink(post.permaLink);
    updatedState.openSubredditLink = buildOpenSubredditLink(
      post.subreddit.isUser,
      post.subreddit.displayName
    );
    updatedState.subreddit = post.subreddit;

    let showOpenPost = true;
    let showOpenImageInNewTab = true;
    let showOpenSubreddit = true;
    let showCopy = true;
    let showSkipToSubreddit = true;
    let showAddToList = true;
    let showRemoveFromList = true;

    if (showButtonControls != undefined) {
      showOpenPost =
        showButtonControls.showOpenPost == undefined
          ? showOpenPost
          : showButtonControls.showOpenPost;
      showOpenImageInNewTab =
        showButtonControls.showOpenImageInNewTab == undefined
          ? showOpenImageInNewTab
          : showButtonControls.showOpenImageInNewTab;
      showOpenSubreddit =
        showButtonControls.showOpenSubreddit == undefined
          ? showOpenSubreddit
          : showButtonControls.showOpenSubreddit;
      showCopy =
        showButtonControls.showCopy == undefined
          ? showCopy
          : showButtonControls.showCopy;
      showSkipToSubreddit =
        showButtonControls.showSkipToSubreddit == undefined
          ? showSkipToSubreddit
          : showButtonControls.showSkipToSubreddit;
      showAddToList =
        showButtonControls.showAddToList == undefined
          ? showAddToList
          : showButtonControls.showAddToList;
      showRemoveFromList =
        showButtonControls.showRemoveFromList == undefined
          ? showRemoveFromList
          : showButtonControls.showRemoveFromList;
    }
    updatedState.showButtonControls.showOpenPost = showOpenPost;
    updatedState.showButtonControls.showOpenImageInNewTab =
      showOpenImageInNewTab;
    updatedState.showButtonControls.showOpenSubreddit = showOpenSubreddit;
    updatedState.showButtonControls.showCopy = showCopy;
    updatedState.showButtonControls.showSkipToSubreddit = showSkipToSubreddit;
    updatedState.showButtonControls.showAddToList = showAddToList;
    updatedState.showButtonControls.showRemoveFromList = showRemoveFromList;
  }

  if (contextDataObjects.subreddit != undefined) {
    const subreddit = contextDataObjects.subreddit;
    updatedState.subreddit = subreddit;
    updatedState.openSubredditLink = buildOpenSubredditLink(
      subreddit.isUser,
      subreddit.displayName
    );

    let showOpenSubreddit = true;
    let showSkipToSubreddit = true;
    let showAddToList = true;
    let showRemoveFromList = true;
    if (showButtonControls != undefined) {
      showOpenSubreddit =
        showButtonControls.showOpenSubreddit == undefined
          ? showOpenSubreddit
          : showButtonControls.showOpenSubreddit;
      showSkipToSubreddit =
        showButtonControls.showSkipToSubreddit == undefined
          ? showSkipToSubreddit
          : showButtonControls.showSkipToSubreddit;
      showAddToList =
        showButtonControls.showAddToList == undefined
          ? showAddToList
          : showButtonControls.showAddToList;
      showRemoveFromList =
        showButtonControls.showRemoveFromList == undefined
          ? showRemoveFromList
          : showButtonControls.showRemoveFromList;
    }
    updatedState.showButtonControls.showOpenSubreddit = showOpenSubreddit;
    updatedState.showButtonControls.showSkipToSubreddit = showSkipToSubreddit;
    updatedState.showButtonControls.showAddToList = showAddToList;
    updatedState.showButtonControls.showRemoveFromList = showRemoveFromList;
  }

  if (contextDataObjects.subredditLists != undefined) {
    const subredditList = contextDataObjects.subredditLists;
    updatedState.updateSubredditListInfo = {
      subredditList: subredditList,
    };

    let showUpdateListName = true;
    let showDeleteList = true;
    if (showButtonControls != undefined) {
      showUpdateListName =
        showButtonControls.showUpdateListName == undefined
          ? showUpdateListName
          : showButtonControls.showUpdateListName;
      showDeleteList =
        showButtonControls.showDeleteList == undefined
          ? showDeleteList
          : showButtonControls.showDeleteList;
    }
    updatedState.showButtonControls.showUpdateListName = showUpdateListName;
    updatedState.showButtonControls.showDeleteList = showDeleteList;
  }

  if (contextDataObjects.subredditAccountSearchResult) {
    const searchResultItem = contextDataObjects.subredditAccountSearchResult;
    updatedState.openSubredditLink = buildOpenSubredditLink(
      searchResultItem.isUser,
      searchResultItem.displayName
    );
    updatedState.subreddit = searchResultItem;

    let showOpenSubreddit = true;
    let showSkipToSubreddit = true;
    let showAddToList = true;
    let showRemoveFromlist = true;
    if (showButtonControls != undefined) {
      showOpenSubreddit =
        showButtonControls.showOpenSubreddit == undefined
          ? showOpenSubreddit
          : showButtonControls.showOpenSubreddit;
      showSkipToSubreddit =
        showButtonControls.showSkipToSubreddit == undefined
          ? showSkipToSubreddit
          : showButtonControls.showSkipToSubreddit;
      showAddToList =
        showButtonControls.showAddToList == undefined
          ? showAddToList
          : showButtonControls.showAddToList;
      showRemoveFromlist =
        showButtonControls.showRemoveFromList == undefined
          ? showRemoveFromlist
          : showButtonControls.showRemoveFromList;
    }
    updatedState.showButtonControls.showOpenSubreddit = showOpenSubreddit;
    updatedState.showButtonControls.showSkipToSubreddit = showSkipToSubreddit;
    updatedState.showButtonControls.showAddToList = showAddToList;
    updatedState.showButtonControls.showRemoveFromList = showRemoveFromlist;
  }
  return updatedState;
};
const resetContextMenuFields = (): ContextMenuState => {
  return {
    showContextMenu: false,
    x: 0,
    y: 0,
    copyInfo: undefined,
    subreddit: undefined,
    updateSubredditListInfo: undefined,
    openPostPermaLink: undefined,
    openSubredditLink: undefined,
    showButtonControls: {
      showOpenImageInNewTab: false,
      showOpenPost: false,
      showOpenSubreddit: false,
      showCopy: false,
      showSkipToSubreddit: false,
      showAddToList: false,
      expandAddToList: false,
      showRemoveFromList: false,
      expandRemoveFromList: false,
      showUpdateListName: false,
      showDeleteList: false,
    },
  };
};

const buildOpenPostPermaLink = (permaLink: string) => {
  return `https://www.reddit.com${permaLink}`;
};
const buildOpenSubredditLink = (isUser: boolean, displayName: string) => {
  return `https://www.reddit.com/${isUser ? "u" : "r"}/${displayName}`;
};
