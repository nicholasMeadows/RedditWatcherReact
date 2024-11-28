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
  ADD_ITEM_TO_SUBREDDIT_QUEUE = "ADD_ITEM_TO_SUBREDDIT_QUEUE",
  REMOVE_SUBREDDIT_QUEUE_ITEM = "REMOVE_SUBREDDIT_QUEUE_ITEM",
  MOVE_SUBREDDIT_QUEUE_ITEM_FORWARD = "MOVE_SUBREDDIT_QUEUE_ITEM_FORWARD",
  MOVE_SUBREDDIT_QUEUE_ITEM_BACKWARD = "MOVE_SUBREDDIT_QUEUE_ITEM_BACKWARD",
  SET_SECONDS_TILL_GETTING_NEXT_POSTS = "SET_SECONDS_TILL_GETTING_NEXT_POSTS",
  SET_CURRENTLY_GETTING_POSTS = "SET_CURRENTLY_GETTING_POSTS"
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

export type AddItemToSubredditQueueAction = {
  type: RedditServiceActions.ADD_ITEM_TO_SUBREDDIT_QUEUE;
  payload: Subreddit;
};

export type RemoveSubredditQueueItemActionAction = {
  type: RedditServiceActions.REMOVE_SUBREDDIT_QUEUE_ITEM;
  payload: SubredditQueueItem;
};

export type MoveSubredditQueueItemAction = {
  type:
    | RedditServiceActions.MOVE_SUBREDDIT_QUEUE_ITEM_BACKWARD
    | RedditServiceActions.MOVE_SUBREDDIT_QUEUE_ITEM_FORWARD;
  payload: SubredditQueueItem;
};

export type SetIsGettingPostsAction = {
  type: RedditServiceActions.SET_CURRENTLY_GETTING_POSTS;
  payload: boolean;
}
export default function RedditServiceReducer(
  state: RedditServiceState,
  action:
    | RedditServiceAddSubredditsToMasterSubscribedList
    | RedditServiceActionNumberPayload
    | RedditServiceSetAuthenticationStatus
    | AddItemToSubredditQueueAction
    | RemoveSubredditQueueItemActionAction
    | MoveSubredditQueueItemAction
  | SetIsGettingPostsAction
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
    case RedditServiceActions.ADD_ITEM_TO_SUBREDDIT_QUEUE:
      return addItemToSubredditQueue(state, action);
    case RedditServiceActions.SET_SECONDS_TILL_GETTING_NEXT_POSTS:
      return setSecondsTillGettingNextPosts(state, action);
    case RedditServiceActions.REMOVE_SUBREDDIT_QUEUE_ITEM:
      return removeSubredditQueueItem(state, action);
    case RedditServiceActions.MOVE_SUBREDDIT_QUEUE_ITEM_FORWARD:
      return moveSubredditQueueItemForward(state, action);
    case RedditServiceActions.MOVE_SUBREDDIT_QUEUE_ITEM_BACKWARD:
      return moveSubredditQueueItemBackwards(state, action);
    case RedditServiceActions.SET_CURRENTLY_GETTING_POSTS: return setGettingPosts(state, action);
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

const addItemToSubredditQueue = (
  state: RedditServiceState,
  action: AddItemToSubredditQueueAction
): RedditServiceState => {
  const queueItem: SubredditQueueItem = {
    ...action.payload,
    subredditQueueItemUuid: uuidV4(),
  };
  const updatedQueue = [...state.subredditQueue];
  updatedQueue.push(queueItem);
  return {
    ...state,
    subredditQueue: updatedQueue,
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

const removeSubredditQueueItem = (
  state: RedditServiceState,
  action: RemoveSubredditQueueItemActionAction
): RedditServiceState => {
  const updatedQueue = [...state.subredditQueue];
  const indexToRemove = updatedQueue.findIndex(
    (queueItem) =>
      queueItem.subredditQueueItemUuid === action.payload.subredditQueueItemUuid
  );
  if (indexToRemove === -1) {
    return state;
  }
  updatedQueue.splice(indexToRemove, 1);
  return {
    ...state,
    subredditQueue: updatedQueue,
  };
};

const moveSubredditQueueItemForward = (
  state: RedditServiceState,
  action: MoveSubredditQueueItemAction
): RedditServiceState => {
  const queueItem = action.payload;
  const updatedQueue = [...state.subredditQueue];
  const foundIndex = updatedQueue.findIndex(
    (item) => item.subredditQueueItemUuid === queueItem.subredditQueueItemUuid
  );
  if (foundIndex === -1) {
    return state;
  }

  const queueItemToMove = updatedQueue[foundIndex];
  updatedQueue[foundIndex] = updatedQueue[foundIndex - 1];
  updatedQueue[foundIndex - 1] = queueItemToMove;
  return {
    ...state,
    subredditQueue: updatedQueue,
  };
};

const moveSubredditQueueItemBackwards = (
  state: RedditServiceState,
  action: MoveSubredditQueueItemAction
): RedditServiceState => {
  const queueItem = action.payload;
  const updatedQueue = [...state.subredditQueue];
  const foundIndex = updatedQueue.findIndex(
    (item) => item.subredditQueueItemUuid === queueItem.subredditQueueItemUuid
  );

  if (foundIndex === -1 || foundIndex >= updatedQueue.length) {
    return state;
  }
  const queueItemToMove = updatedQueue[foundIndex];
  updatedQueue[foundIndex] = updatedQueue[foundIndex + 1];
  updatedQueue[foundIndex + 1] = queueItemToMove;
  return {
    ...state,
    subredditQueue: updatedQueue,
  };
};
const setGettingPosts = (
    state: RedditServiceState,
    action: SetIsGettingPostsAction
): RedditServiceState => {
  return {
    ...state,
    isGettingPosts: action.payload
  };
};