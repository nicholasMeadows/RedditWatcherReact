import { Subreddit } from "../model/Subreddit/Subreddit.ts";
import { Dispatch } from "react";

export enum RedditServiceActions {
  ADD_TO_MASTER_SUBSCRIBED_SUBREDDIT_LIST = "ADD_TO_MASTER_SUBSCRIBED_SUBREDDIT_LIST",
  SET_NSFW_SUBREDDIT_INDEX = "SET_NSFW_SUBREDDIT_INDEX",
  SET_SUBREDDIT_INDEX = "SET_SUBREDDIT_INDEX",
  SET_LAST_POST_ROW_WAS_SORT_ORDER_NEW = "SET_LAST_POST_ROW_WAS_SORT_ORDER_NEW",
}

export type RedditServiceState = {
  masterSubscribedSubredditList: Array<Subreddit>;
  nsfwSubredditIndex: number;
  subredditIndex: number;
  lastPostRowWasSortOrderNew: boolean;
};

export type RedditServiceAddSubredditsToMasterSubscribedList = {
  type: RedditServiceActions.ADD_TO_MASTER_SUBSCRIBED_SUBREDDIT_LIST;
  payload: {
    subreddits: Array<Subreddit>;
  };
};
export type RedditServiceActionNumberPayload = {
  type:
    | RedditServiceActions.SET_NSFW_SUBREDDIT_INDEX
    | RedditServiceActions.SET_SUBREDDIT_INDEX;
  payload: number;
};
export type RedditServiceActionBooleanPayload = {
  type: RedditServiceActions.SET_LAST_POST_ROW_WAS_SORT_ORDER_NEW;
  payload: boolean;
};
export type RedditServiceDispatch = Dispatch<
  | RedditServiceAddSubredditsToMasterSubscribedList
  | RedditServiceActionNumberPayload
  | RedditServiceActionBooleanPayload
>;
export default function RedditServiceReducer(
  state: RedditServiceState,
  action:
    | RedditServiceAddSubredditsToMasterSubscribedList
    | RedditServiceActionNumberPayload
    | RedditServiceActionBooleanPayload
) {
  switch (action.type) {
    case RedditServiceActions.ADD_TO_MASTER_SUBSCRIBED_SUBREDDIT_LIST:
      return addPostsToMasterSubscribedList(state, action);
    case RedditServiceActions.SET_NSFW_SUBREDDIT_INDEX:
      return setNsfwSubredditIndex(state, action);
    case RedditServiceActions.SET_SUBREDDIT_INDEX:
      return setSubredditIndex(state, action);
    case RedditServiceActions.SET_LAST_POST_ROW_WAS_SORT_ORDER_NEW:
      return setLastPostRowWasSortOrderNew(state, action);
    default:
      return state;
  }
}

const addPostsToMasterSubscribedList = (
  state: RedditServiceState,
  action: RedditServiceAddSubredditsToMasterSubscribedList
): RedditServiceState => {
  return {
    ...state,
    masterSubscribedSubredditList: [
      ...state.masterSubscribedSubredditList,
      ...action.payload.subreddits,
    ],
  };
};

const setNsfwSubredditIndex = (
  state: RedditServiceState,
  action: RedditServiceActionNumberPayload
): RedditServiceState => {
  return {
    ...state,
    nsfwSubredditIndex: action.payload,
  };
};
const setSubredditIndex = (
  state: RedditServiceState,
  action: RedditServiceActionNumberPayload
): RedditServiceState => {
  return {
    ...state,
    subredditIndex: action.payload,
  };
};

const setLastPostRowWasSortOrderNew = (
  state: RedditServiceState,
  action: RedditServiceActionBooleanPayload
): RedditServiceState => {
  return {
    ...state,
    lastPostRowWasSortOrderNew: action.payload,
  };
};
