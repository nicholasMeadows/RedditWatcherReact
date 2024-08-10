import { Subreddit } from "../model/Subreddit/Subreddit.ts";
import { SubredditQueueItem } from "../model/Subreddit/SubredditQueueItem.ts";
import { v4 as uuidV4 } from "uuid";
import { SubredditQueueState } from "../model/state/SubredditQueueState.ts";

export enum SubredditQueueActionType {
  ADD_SUBREDDIT_TO_QUEUE = "ADD_SUBREDDIT_TO_QUEUE",
  MOVE_SUBREDDIT_QUEUE_ITEM_FORWARD = "MOVE_SUBREDDIT_QUEUE_ITEM_FORWARD",
  MOVE_SUBREDDIT_QUEUE_ITEM_BACKWARD = "MOVE_SUBREDDIT_QUEUE_ITEM_BACKWARD",
  REMOVE_SUBREDDIT_QUEUE_ITEM = "REMOVE_SUBREDDIT_QUEUE_ITEM",
}

export type SubredditQueueAction = {
  type: SubredditQueueActionType;
  payload: Subreddit;
};

export default function SubredditQueueReducer(
  state: SubredditQueueState,
  action: SubredditQueueAction
) {
  switch (action.type) {
    case SubredditQueueActionType.ADD_SUBREDDIT_TO_QUEUE:
      return addSubredditToQueue(state, action);
    case SubredditQueueActionType.MOVE_SUBREDDIT_QUEUE_ITEM_FORWARD:
      return moveSubredditQueueItemForward(state, action);
    case SubredditQueueActionType.MOVE_SUBREDDIT_QUEUE_ITEM_BACKWARD:
      return moveSubredditQueueItemBack(state, action);
    case SubredditQueueActionType.REMOVE_SUBREDDIT_QUEUE_ITEM:
      return removeSubredditQueueItem(state, action);
    default:
      return state;
  }
}

const addSubredditToQueue = (
  state: SubredditQueueState,
  action: SubredditQueueAction
): SubredditQueueState => {
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
    subredditQueue: [...state.subredditQueue, queueItem],
  };
};

const moveSubredditQueueItemForward = (
  state: SubredditQueueState,
  action: SubredditQueueAction
): SubredditQueueState => {
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
    subredditQueue: updatedQueue,
  };
};
const moveSubredditQueueItemBack = (
  state: SubredditQueueState,
  action: SubredditQueueAction
): SubredditQueueState => {
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
    subredditQueue: updatedQueue,
  };
};
const removeSubredditQueueItem = (
  state: SubredditQueueState,
  action: SubredditQueueAction
): SubredditQueueState => {
  const subreddit = action.payload;
  const updatedQueue = state.subredditQueue.filter(
    (item) => item.subredditUuid !== subreddit.subredditUuid
  );
  return {
    subredditQueue: updatedQueue,
  };
};
