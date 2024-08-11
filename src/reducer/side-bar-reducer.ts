import { SideBarState } from "../model/state/SideBarState.ts";
import { Subreddit } from "../model/Subreddit/Subreddit.ts";

export enum SideBarActionType {
  SET_SIDE_BAR_OPEN = "SET_SIDE_BAR_OPEN",
  SET_OPEN_SIDEBAR_BUTTON_TOP_PERCENT = "SET_OPEN_SIDEBAR_BUTTON_TOP_PERCENT",
  SET_SUBREDDITS_TO_SHOW_IN_SIDEBAR = "SET_SUBREDDITS_TO_SHOW_IN_SIDEBAR",
  SET_MOST_RECENT_SUBREDDIT_GOTTEN = "SET_MOST_RECENT_SUBREDDIT_GOTTEN",
}

export type SetSubredditsToShowInSideBarAction = {
  type: SideBarActionType.SET_SUBREDDITS_TO_SHOW_IN_SIDEBAR;
  payload: {
    subreddits: Array<Subreddit>;
  };
};
export type SetMostRecentSubredditGottenAction = {
  type: SideBarActionType.SET_MOST_RECENT_SUBREDDIT_GOTTEN;
  payload: Subreddit | undefined;
};
export type SideBarActionBooleanPayload = {
  type: SideBarActionType.SET_SIDE_BAR_OPEN;
  payload: boolean;
};
export type SideBarActionNumberPayload = {
  type: SideBarActionType.SET_OPEN_SIDEBAR_BUTTON_TOP_PERCENT;
  payload: number;
};
export default function SideBarReducer(
  state: SideBarState,
  action:
    | SideBarActionBooleanPayload
    | SideBarActionNumberPayload
    | SetSubredditsToShowInSideBarAction
    | SetMostRecentSubredditGottenAction
) {
  switch (action.type) {
    case SideBarActionType.SET_SIDE_BAR_OPEN:
      return setSideBarOpen(state, action);
    case SideBarActionType.SET_OPEN_SIDEBAR_BUTTON_TOP_PERCENT:
      return setOpenSidebarButtonTopPercent(state, action);
    case SideBarActionType.SET_SUBREDDITS_TO_SHOW_IN_SIDEBAR:
      return setSubredditsToShowInSideBar(state, action);
    case SideBarActionType.SET_MOST_RECENT_SUBREDDIT_GOTTEN:
      return setMostRecentSubredditGotten(state, action);
    default:
      return state;
  }
}

const setSideBarOpen = (
  state: SideBarState,
  action: SideBarActionBooleanPayload
): SideBarState => {
  return {
    ...state,
    sideBarOpen: action.payload,
  };
};
const setOpenSidebarButtonTopPercent = (
  state: SideBarState,
  action: SideBarActionNumberPayload
): SideBarState => {
  return {
    ...state,
    openSidebarButtonTopPercent: action.payload,
  };
};
const setSubredditsToShowInSideBar = (
  state: SideBarState,
  action: SetSubredditsToShowInSideBarAction
): SideBarState => {
  return {
    ...state,
    subredditsToShowInSideBar: action.payload.subreddits,
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
