import { Subreddit } from "../model/Subreddit/Subreddit.ts";
import { RedditServiceState } from "../model/state/RedditServiceState.ts";
import { RedditAuthenticationStatus } from "../model/RedditAuthenticationState.ts";
import { SubredditQueueItem } from "../model/Subreddit/SubredditQueueItem.ts";

export enum RedditServiceActions {
  ADD_TO_MASTER_SUBSCRIBED_SUBREDDIT_LIST = "ADD_TO_MASTER_SUBSCRIBED_SUBREDDIT_LIST",
  SET_NSFW_SUBREDDIT_INDEX = "SET_NSFW_SUBREDDIT_INDEX",
  SET_SUBREDDIT_INDEX = "SET_SUBREDDIT_INDEX",
  SET_REDDIT_AUTHENTICATION_STATUS = "SET_REDDIT_AUTHENTICATION_STATUS",
  SET_SUBREDDIT_QUEUE = "SET_SUBREDDIT_QUEUE",
  SET_SECONDS_TILL_GETTING_NEXT_POSTS = "SET_SECONDS_TILL_GETTING_NEXT_POSTS",
}

export type RedditServiceAddSubredditsToMasterSubscribedList = {
  type: RedditServiceActions.ADD_TO_MASTER_SUBSCRIBED_SUBREDDIT_LIST;
  payload: {
    subreddits: Array<Subreddit>;
  };
};
export type RedditServiceActionNumberPayload = {
  type:
    | RedditServiceActions.SET_NSFW_SUBREDDIT_INDEX
    | RedditServiceActions.SET_SUBREDDIT_INDEX
    | RedditServiceActions.SET_SECONDS_TILL_GETTING_NEXT_POSTS;
  payload: number;
};
export type RedditServiceSetAuthenticationStatus = {
  type: RedditServiceActions.SET_REDDIT_AUTHENTICATION_STATUS;
  payload: {
    authenticationStatus: RedditAuthenticationStatus;
  };
};

export type SetSubredditQueueAction = {
  type: RedditServiceActions.SET_SUBREDDIT_QUEUE;
  payload: Array<SubredditQueueItem>;
};
export default function RedditServiceReducer(
  state: RedditServiceState,
  action:
    | RedditServiceAddSubredditsToMasterSubscribedList
    | RedditServiceActionNumberPayload
    | RedditServiceSetAuthenticationStatus
    | SetSubredditQueueAction
) {
  switch (action.type) {
    case RedditServiceActions.ADD_TO_MASTER_SUBSCRIBED_SUBREDDIT_LIST:
      return addPostsToMasterSubscribedList(state, action);
    case RedditServiceActions.SET_NSFW_SUBREDDIT_INDEX:
      return setNsfwSubredditIndex(state, action);
    case RedditServiceActions.SET_SUBREDDIT_INDEX:
      return setSubredditIndex(state, action);
    case RedditServiceActions.SET_REDDIT_AUTHENTICATION_STATUS:
      return setRedditAuthenticationStatus(state, action);
    case RedditServiceActions.SET_SUBREDDIT_QUEUE:
      return setSubredditQueue(state, action);
    case RedditServiceActions.SET_SECONDS_TILL_GETTING_NEXT_POSTS:
      return setSecondsTillGettingNextPosts(state, action);
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
const setRedditAuthenticationStatus = (
  state: RedditServiceState,
  action: RedditServiceSetAuthenticationStatus
): RedditServiceState => {
  return {
    ...state,
    redditAuthenticationStatus: action.payload.authenticationStatus,
  };
};

const setSubredditQueue = (
  state: RedditServiceState,
  action: SetSubredditQueueAction
): RedditServiceState => {
  return {
    ...state,
    subredditQueue: action.payload,
  };
};
const setSecondsTillGettingNextPosts = (
  state: RedditServiceState,
  action: RedditServiceActionNumberPayload
): RedditServiceState => {
  return {
    ...state,
    secondsTillGettingNextPosts: action.payload,
  };
};
