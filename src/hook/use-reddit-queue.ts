import { useCallback, useContext } from "react";
import {
  RedditServiceDispatchContext,
  RedditServiceStateContext,
} from "../context/reddit-service-context.ts";
import { Subreddit } from "../model/Subreddit/Subreddit.ts";
import { RedditServiceActions } from "../reducer/reddit-service-reducer.ts";
import { SubredditQueueItem } from "../model/Subreddit/SubredditQueueItem.ts";
import { v4 as uuidV4 } from "uuid";

export default function useRedditQueue() {
  const { subredditQueue } = useContext(RedditServiceStateContext);
  const redditServiceDispatch = useContext(RedditServiceDispatchContext);

  const addSubredditToQueue = useCallback(
    (subreddit: Subreddit) => {
      const queueItem: SubredditQueueItem = {
        ...subreddit,
        subredditQueueItemUuid: uuidV4(),
      };
      redditServiceDispatch({
        type: RedditServiceActions.SET_SUBREDDIT_QUEUE,
        payload: [...subredditQueue, queueItem],
      });
    },
    [redditServiceDispatch, subredditQueue]
  );

  const moveSubredditQueueItemForward = useCallback(
    (subredditQueueItem: SubredditQueueItem) => {
      const updatedQueue = [...subredditQueue];
      const foundIndex = updatedQueue.findIndex(
        (item) =>
          item.subredditQueueItemUuid ===
          subredditQueueItem.subredditQueueItemUuid
      );
      if (foundIndex === -1) {
        return;
      }

      const queueItemToMove = updatedQueue[foundIndex];
      updatedQueue[foundIndex] = updatedQueue[foundIndex - 1];
      updatedQueue[foundIndex - 1] = queueItemToMove;
      redditServiceDispatch({
        type: RedditServiceActions.SET_SUBREDDIT_QUEUE,
        payload: updatedQueue,
      });
    },
    [redditServiceDispatch, subredditQueue]
  );

  const moveSubredditQueueItemBackwards = useCallback(
    (subredditQueueItem: SubredditQueueItem) => {
      const updatedQueue = [...subredditQueue];
      const foundIndex = updatedQueue.findIndex(
        (item) =>
          item.subredditQueueItemUuid ===
          subredditQueueItem.subredditQueueItemUuid
      );
      if (foundIndex === -1 || foundIndex >= updatedQueue.length) {
        return;
      }
      const queueItemToMove = updatedQueue[foundIndex];
      updatedQueue[foundIndex] = updatedQueue[foundIndex + 1];
      updatedQueue[foundIndex + 1] = queueItemToMove;
      redditServiceDispatch({
        type: RedditServiceActions.SET_SUBREDDIT_QUEUE,
        payload: updatedQueue,
      });
    },
    [redditServiceDispatch, subredditQueue]
  );

  return {
    addSubredditToQueue,
    moveSubredditQueueItemForward,
    moveSubredditQueueItemBackwards,
  };
}
