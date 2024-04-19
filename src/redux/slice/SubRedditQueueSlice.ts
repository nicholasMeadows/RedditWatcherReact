import { createSlice } from "@reduxjs/toolkit";
import { Subreddit } from "../../model/Subreddit/Subreddit.ts";
import { SubredditQueueItem } from "../../model/Subreddit/SubredditQueueItem.ts";
import { v4 as uuidV4 } from "uuid";

export const subRedditQueueSlice = createSlice({
  name: "subRedditQueueSlice",
  initialState: {
    subredditQueue: new Array<SubredditQueueItem>(),
  },
  reducers: {
    subredditQueueRemoveAt: (
      state,
      action: { type: string; payload: number }
    ) => {
      state.subredditQueue.splice(action.payload, 1);
    },
    addSubredditToQueue: (
      state,
      action: { type: string; payload: Subreddit }
    ) => {
      const subreddit = action.payload;
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
      state.subredditQueue.push(queueItem);
    },
    moveSubredditQueueItemForward: (
      state,
      action: { type: string; payload: string }
    ) => {
      const subredditQueueItemUuid = action.payload;
      const foundIndex = state.subredditQueue.findIndex(
        (item) => item.subredditQueueItemUuid == subredditQueueItemUuid
      );
      if (foundIndex > 0) {
        state.subredditQueue[foundIndex] = state.subredditQueue.splice(
          foundIndex - 1,
          1,
          state.subredditQueue[foundIndex]
        )[0];
      }
    },
    moveSubredditQueueItemBack: (
      state,
      action: { type: string; payload: string }
    ) => {
      const subredditQueueItemUuid = action.payload;
      const foundIndex = state.subredditQueue.findIndex(
        (item) => item.subredditQueueItemUuid == subredditQueueItemUuid
      );
      if (foundIndex != -1 && foundIndex != state.subredditQueue.length - 1) {
        state.subredditQueue[foundIndex] = state.subredditQueue.splice(
          foundIndex + 1,
          1,
          state.subredditQueue[foundIndex]
        )[0];
      }
    },
    removeSubredditQueueItem: (
      state,
      action: { type: string; payload: string }
    ) => {
      const subredditQueueItemUuid = action.payload;
      state.subredditQueue = state.subredditQueue.filter(
        (item) => item.subredditQueueItemUuid != subredditQueueItemUuid
      );
    },
  },
});
export const {
  subredditQueueRemoveAt,
  addSubredditToQueue,
  moveSubredditQueueItemForward,
  moveSubredditQueueItemBack,
  removeSubredditQueueItem,
} = subRedditQueueSlice.actions;
export default subRedditQueueSlice.reducer;
