import { Subreddit } from "../model/Subreddit/Subreddit.ts";
import { SubredditLists } from "../model/SubredditList/SubredditLists.ts";
import { Dispatch } from "react";
import { SIDE_BAR_SUBREDDIT_LIST_FILTER_NOT_SELECTED } from "../RedditWatcherConstants.ts";

export enum SideBarActionType {
  SET_SUBREDDITS_TO_SHOW_IN_SIDEBAR = "SET_SUBREDDITS_TO_SHOW_IN_SIDEBAR",
  SET_LIST_TO_FILTER_BY_UUID = "SET_LIST_TO_FILTER_BY_UUID",
  SET_SEARCH_INPUT = "SET_SEARCH_INPUT",
  SUBREDDIT_LISTS_UPDATED = "SUBREDDIT_LISTS_UPDATED",
  SET_MOUSE_OVER_SUBREDDIT_LIST = "SET_MOUSE_OVER_SUBREDDIT_LIST",
  SET_OPEN_SIDEBAR_BUTTON_TOP_PERCENT = "SET_OPEN_SIDEBAR_BUTTON_TOP_PERCENT",
  SET_MOST_RECENT_SUBREDDIT_GOTTEN = "SET_MOST_RECENT_SUBREDDIT_GOTTEN",
  SET_SECONDS_TILL_GETTING_NEXT_POSTS = "SET_SECONDS_TILL_GETTING_NEXT_POSTS",
}

export type SideBarState = {
  subredditsToShowInSideBar: Array<Subreddit>;
  subredditsToShow: Array<Subreddit>;
  mostRecentSubredditGotten: Subreddit | undefined;
  availableSubredditListsForFilter: Array<SubredditLists>;
  listToFilterByUuid: string;
  searchInput: string;
  sideBarOpen: boolean;
  openSidebarButtonTopPercent: number;
  mouseOverSubredditList: boolean;
  secondsTillGettingNextPosts: number;
};
type SideBarUpdateFieldsObj = {
  subredditsToShowInSideBar: Array<Subreddit>;
  listsToShowInDropDown: Array<SubredditLists>;
  listToFilterByUuid: string;
  subredditsToShow: Array<Subreddit>;
  searchInput: string;
};
export type SetSubredditsToShowInSideBarAction = {
  type: SideBarActionType.SET_SUBREDDITS_TO_SHOW_IN_SIDEBAR;
  payload: {
    subreddits: Array<Subreddit>;
    subredditLists: Array<SubredditLists>;
  };
};
export type SetListToFilterByUuidAction = {
  type: SideBarActionType.SET_LIST_TO_FILTER_BY_UUID;
  payload: {
    listUuid: string;
    subredditLists: Array<SubredditLists>;
  };
};

export type SetSearchInputAction = {
  type: SideBarActionType.SET_SEARCH_INPUT;
  payload: {
    searchInput: string;
    subredditLists: Array<SubredditLists>;
  };
};
export type SubredditListsUpdatedAction = {
  type: SideBarActionType.SUBREDDIT_LISTS_UPDATED;
  payload: Array<SubredditLists>;
};

export type SetMouseOverSubredditListAction = {
  type: SideBarActionType.SET_MOUSE_OVER_SUBREDDIT_LIST;
  payload: boolean;
};

export type SetOpenNumberPayloadAction = {
  type:
    | SideBarActionType.SET_OPEN_SIDEBAR_BUTTON_TOP_PERCENT
    | SideBarActionType.SET_SECONDS_TILL_GETTING_NEXT_POSTS;
  payload: number;
};
export type SetMostRecentSubredditGottenAction = {
  type: SideBarActionType.SET_MOST_RECENT_SUBREDDIT_GOTTEN;
  payload: Subreddit | undefined;
};

export type SideBarDispatch = Dispatch<
  | SetSubredditsToShowInSideBarAction
  | SetListToFilterByUuidAction
  | SetSearchInputAction
  | SubredditListsUpdatedAction
  | SetMouseOverSubredditListAction
  | SetOpenNumberPayloadAction
  | SetMostRecentSubredditGottenAction
>;
export default function SideBarReducer(
  state: SideBarState,
  action:
    | SetSubredditsToShowInSideBarAction
    | SetListToFilterByUuidAction
    | SetSearchInputAction
    | SubredditListsUpdatedAction
    | SetMouseOverSubredditListAction
    | SetOpenNumberPayloadAction
    | SetMostRecentSubredditGottenAction
) {
  switch (action.type) {
    case SideBarActionType.SET_SUBREDDITS_TO_SHOW_IN_SIDEBAR:
      return setSubredditsToShowInSideBar(state, action);
    case SideBarActionType.SET_LIST_TO_FILTER_BY_UUID:
      return setListToFilterByUuid(state, action);
    case SideBarActionType.SET_SEARCH_INPUT:
      return setSearchInput(state, action);
    case SideBarActionType.SUBREDDIT_LISTS_UPDATED:
      return subredditListsUpdated(state, action);
    case SideBarActionType.SET_MOUSE_OVER_SUBREDDIT_LIST:
      return setMouseOverSubredditList(state, action);
    case SideBarActionType.SET_OPEN_SIDEBAR_BUTTON_TOP_PERCENT:
      return setOpenSidebarButtonTopPercent(state, action);
    case SideBarActionType.SET_SECONDS_TILL_GETTING_NEXT_POSTS:
      return setSecondsTillGettingNextPosts(state, action);
    case SideBarActionType.SET_MOST_RECENT_SUBREDDIT_GOTTEN:
      return setMostRecentSubredditGotten(state, action);
    default:
      return state;
  }
}
const setSubredditsToShowInSideBar = (
  state: SideBarState,
  action: SetSubredditsToShowInSideBarAction
): SideBarState => {
  const subredditLists = action.payload.subredditLists;
  const subreddits = action.payload.subreddits;
  const listToFilterByUuid = state.listToFilterByUuid;
  const searchInput = state.searchInput;
  const filtered = filterSubredditsToShow(
    subredditLists,
    subreddits,
    listToFilterByUuid,
    searchInput
  );
  return applySideBarFields(state, filtered);
};
const setListToFilterByUuid = (
  state: SideBarState,
  action: SetListToFilterByUuidAction
): SideBarState => {
  const subredditLists = action.payload.subredditLists;
  const listUuid = action.payload.listUuid;
  const subredditsToShowInSideBar = state.subredditsToShowInSideBar;
  const searchInput = state.searchInput;
  const filtered = filterSubredditsToShow(
    subredditLists,
    subredditsToShowInSideBar,
    listUuid,
    searchInput
  );
  return applySideBarFields(state, filtered);
};
const setSearchInput = (
  state: SideBarState,
  action: SetSearchInputAction
): SideBarState => {
  const searchInput = action.payload.searchInput;
  const subredditLists = action.payload.subredditLists;
  const subredditsToShowInSideBar = state.subredditsToShowInSideBar;
  const listToFilterByUuid = state.listToFilterByUuid;
  const filtered = filterSubredditsToShow(
    subredditLists,
    subredditsToShowInSideBar,
    listToFilterByUuid,
    searchInput
  );
  return applySideBarFields(state, filtered);
};
const subredditListsUpdated = (
  state: SideBarState,
  action: SubredditListsUpdatedAction
): SideBarState => {
  const subredditLists = action.payload;
  const subredditsToShowInSideBar = state.subredditsToShowInSideBar;
  const listToFilterByUuid = state.listToFilterByUuid;
  const searchInput = state.searchInput;
  const filtered = filterSubredditsToShow(
    subredditLists,
    subredditsToShowInSideBar,
    listToFilterByUuid,
    searchInput
  );
  return applySideBarFields(state, filtered);
};
const setMouseOverSubredditList = (
  state: SideBarState,
  action: { type: string; payload: boolean }
): SideBarState => {
  return {
    ...state,
    mouseOverSubredditList: action.payload,
  };
};
const setOpenSidebarButtonTopPercent = (
  state: SideBarState,
  action: { type: string; payload: number }
): SideBarState => {
  return {
    ...state,
    openSidebarButtonTopPercent: action.payload,
  };
};
const setMostRecentSubredditGotten = (
  state: SideBarState,
  action: { type: string; payload: Subreddit | undefined }
): SideBarState => {
  return {
    ...state,
    mostRecentSubredditGotten: action.payload,
  };
};
const setSecondsTillGettingNextPosts = (
  state: SideBarState,
  action: { type: string; payload: number }
): SideBarState => {
  return {
    ...state,
    secondsTillGettingNextPosts: action.payload,
  };
};

const filterSubredditsToShow = (
  allSubredditLists: Array<SubredditLists>,
  subredditsToShowInSideBar: Array<Subreddit>,
  listToFilterByUuid: string,
  searchInput: string
): SideBarUpdateFieldsObj => {
  let filteredSubredditsToShowInSideBar = [...subredditsToShowInSideBar];
  if (searchInput != "") {
    filteredSubredditsToShowInSideBar = subredditsToShowInSideBar.filter(
      (subreddit) =>
        subreddit.displayName.toLowerCase().includes(searchInput.toLowerCase())
    );
  }

  const subredditListsToShowInDropDown = new Array<SubredditLists>();
  for (const list of allSubredditLists) {
    for (const subreddit of subredditsToShowInSideBar) {
      const found = list.subreddits.find(
        (subredditFromList) =>
          subredditFromList.subredditUuid == subreddit.subredditUuid
      );
      if (found != undefined) {
        subredditListsToShowInDropDown.push(list);
        break;
      }
    }
  }

  const foundList = subredditListsToShowInDropDown.find(
    (list) => list.subredditListUuid == listToFilterByUuid
  );
  let listToFilterByUuidToSet: string;
  if (foundList == undefined) {
    listToFilterByUuidToSet = SIDE_BAR_SUBREDDIT_LIST_FILTER_NOT_SELECTED;
  } else {
    listToFilterByUuidToSet = listToFilterByUuid;
    filteredSubredditsToShowInSideBar =
      filteredSubredditsToShowInSideBar.filter((subreddit) => {
        const index = foundList.subreddits.findIndex(
          (subredditFromList) =>
            subredditFromList.subredditUuid == subreddit.subredditUuid
        );
        return index >= 0;
      });
  }

  return {
    subredditsToShowInSideBar: subredditsToShowInSideBar,
    listsToShowInDropDown: subredditListsToShowInDropDown,
    listToFilterByUuid: listToFilterByUuidToSet,
    subredditsToShow: filteredSubredditsToShowInSideBar,
    searchInput: searchInput,
  };
};
const applySideBarFields = (
  state: SideBarState,
  updatedFields: SideBarUpdateFieldsObj
): SideBarState => {
  return {
    ...state,
    listToFilterByUuid: updatedFields.listToFilterByUuid,
    availableSubredditListsForFilter: updatedFields.listsToShowInDropDown,
    searchInput: updatedFields.searchInput,
    subredditsToShow: updatedFields.subredditsToShow,
    subredditsToShowInSideBar: updatedFields.subredditsToShowInSideBar,
  };
};
