import { Subreddit } from "../model/Subreddit/Subreddit.ts";
import { RedditServiceState } from "../model/state/RedditServiceState.ts";
import { RedditAuthenticationStatus } from "../model/RedditAuthenticationState.ts";
import { SubredditQueueItem } from "../model/Subreddit/SubredditQueueItem.ts";
import { v4 as uuidV4 } from "uuid";

export enum RedditServiceActions {
  ADD_TO_MASTER_SUBSCRIBED_SUBREDDIT_LIST = "ADD_TO_MASTER_SUBSCRIBED_SUBREDDIT_LIST",
  SET_NSFW_SUBREDDIT_INDEX = "SET_NSFW_SUBREDDIT_INDEX",
  SET_SUBREDDIT_INDEX = "SET_SUBREDDIT_INDEX",
  SET_REDDIT_AUTHENTICATION_STATUS = "SET_REDDIT_AUTHENTICATION_STATUS",
  ADD_SUBREDDIT_TO_QUEUE = "ADD_SUBREDDIT_TO_QUEUE",
  MOVE_SUBREDDIT_QUEUE_ITEM_FORWARD = "MOVE_SUBREDDIT_QUEUE_ITEM_FORWARD",
  MOVE_SUBREDDIT_QUEUE_ITEM_BACKWARD = "MOVE_SUBREDDIT_QUEUE_ITEM_BACKWARD",
  REMOVE_SUBREDDIT_QUEUE_ITEM = "REMOVE_SUBREDDIT_QUEUE_ITEM",
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
    | RedditServiceActions.SET_SUBREDDIT_INDEX;
  payload: number;
};
export type RedditServiceSetAuthenticationStatus = {
  type: RedditServiceActions.SET_REDDIT_AUTHENTICATION_STATUS;
  payload: {
    authenticationStatus: RedditAuthenticationStatus;
  };
};

export type SubredditQueueAction = {
  type:
    | RedditServiceActions.ADD_SUBREDDIT_TO_QUEUE
    | RedditServiceActions.REMOVE_SUBREDDIT_QUEUE_ITEM
    | RedditServiceActions.MOVE_SUBREDDIT_QUEUE_ITEM_FORWARD
    | RedditServiceActions.MOVE_SUBREDDIT_QUEUE_ITEM_BACKWARD;
  payload: Subreddit;
};

export default function RedditServiceReducer(
  state: RedditServiceState,
  action:
    | RedditServiceAddSubredditsToMasterSubscribedList
    | RedditServiceActionNumberPayload
    | RedditServiceSetAuthenticationStatus
    | SubredditQueueAction
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
    case RedditServiceActions.ADD_SUBREDDIT_TO_QUEUE:
      return addSubredditToQueue(state, action);
    case RedditServiceActions.MOVE_SUBREDDIT_QUEUE_ITEM_FORWARD:
      return moveSubredditQueueItemForward(state, action);
    case RedditServiceActions.MOVE_SUBREDDIT_QUEUE_ITEM_BACKWARD:
      return moveSubredditQueueItemBack(state, action);
    case RedditServiceActions.REMOVE_SUBREDDIT_QUEUE_ITEM:
      return removeSubredditQueueItem(state, action);
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

const addSubredditToQueue = (
  state: RedditServiceState,
  action: SubredditQueueAction
): RedditServiceState => {
  const subreddit = { ...action.payload };
  if (
    subreddit.displayNamePrefixed.startsWith("u/") &&
    !subreddit.displayName.startsWith("u_")
  ) {
    subreddit.displayName = "u_" + subreddit.displayName;
  }

  const queueItem: SubredditQueueItem = {
    ...subreddit,
    subredditQueueItemUuid: uuidV4(),
  };

  return {
    ...state,
    subredditQueue: [...state.subredditQueue, queueItem],
  };
};

const moveSubredditQueueItemForward = (
  state: RedditServiceState,
  action: SubredditQueueAction
): RedditServiceState => {
  const updatedQueue = [...state.subredditQueue];
  const subreddit = action.payload;
  const foundIndex = updatedQueue.findIndex(
    (item) => item.subredditUuid === subreddit.subredditUuid
  );
  if (foundIndex > 0) {
    updatedQueue[foundIndex] = updatedQueue.splice(
      foundIndex - 1,
      1,
      updatedQueue[foundIndex]
    )[0];
  }
  return {
    ...state,
    subredditQueue: updatedQueue,
  };
};
const moveSubredditQueueItemBack = (
  state: RedditServiceState,
  action: SubredditQueueAction
): RedditServiceState => {
  const updatedQueue = [...state.subredditQueue];

  const subreddit = action.payload;
  const foundIndex = updatedQueue.findIndex(
    (item) => item.subredditUuid === subreddit.subredditUuid
  );
  if (foundIndex != -1 && foundIndex != updatedQueue.length - 1) {
    updatedQueue[foundIndex] = updatedQueue.splice(
      foundIndex + 1,
      1,
      updatedQueue[foundIndex]
    )[0];
  }
  return {
    ...state,
    subredditQueue: updatedQueue,
  };
};
const removeSubredditQueueItem = (
  state: RedditServiceState,
  action: SubredditQueueAction
): RedditServiceState => {
  const subreddit = action.payload;
  const updatedQueue = state.subredditQueue.filter(
    (item) => item.subredditUuid !== subreddit.subredditUuid
  );
  return {
    ...state,
    subredditQueue: updatedQueue,
  };
};
