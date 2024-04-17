import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { v4 as uuidV4 } from "uuid";
import RedditClient from "../../client/RedditClient";
import { RedditAuthenticationStatus } from "../../model/RedditAuthenticationState";
import { RedditClientState } from "../../model/RedditClientState";
import { Subreddit } from "../../model/Subreddit/Subreddit";
import { SubredditQueueItem } from "../../model/Subreddit/SubredditQueueItem";
import { saveConfig } from "../../service/ConfigService";
import store from "../store";

export const authenticateReddit = createAsyncThunk(
  "redditClient/authenticateReddit",
  async (_data, { rejectWithValue }) => {
    const currentState = store.getState();

    const username = currentState.appConfig.redditCredentials.username;
    const password = currentState.appConfig.redditCredentials.password;
    const clientId = currentState.appConfig.redditCredentials.clientId;
    const clientSecret = currentState.appConfig.redditCredentials.clientSecret;

    try {
      if (
        username != undefined &&
        password != undefined &&
        clientId != undefined &&
        clientSecret != undefined
      ) {
        const authRes = await new RedditClient().authenticate(
          username,
          password,
          clientId,
          clientSecret
        );
        saveConfig(currentState.appConfig);
        return authRes;
      }
    } catch (e) {
      return rejectWithValue({ errorMessage: "Could not log into reddit." });
    }
    return rejectWithValue({
      errorMessage: "Reddit credentials were undefined",
    });
  }
);

const initialState: RedditClientState = {
  // accessToken: undefined,
  // accessTokenExpiration: undefined,
  // rateLimitResetsAtEpoch: undefined,
  // rateLimitRemaining: undefined,
  // rateLimitUsed: undefined,
  redditAuthenticationStatus: RedditAuthenticationStatus.NOT_YET_AUTHED,
  masterSubscribedSubredditList: [],
  subredditQueue: new Array<SubredditQueueItem>(),
  subredditIndex: 0,
  nsfwRedditListIndex: 0,
  lastPostRowWasSortOrderNew: false,
  loopingForPosts: false,
  loopingForPostsTimeout: undefined,
};

export const redditClientSlice = createSlice({
  name: "redditClient",
  initialState: initialState,
  reducers: {
    setMasterSubscribedSubredditList: (
      state,
      action: { type: string; payload: Array<Subreddit> }
    ) => {
      state.masterSubscribedSubredditList = action.payload;
    },
    addSubredditsToSubscribedList: (
      state,
      action: { type: string; payload: Array<Subreddit> }
    ) => {
      state.masterSubscribedSubredditList.push(...action.payload);
    },
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
    setSubredditIndex: (state, action) => {
      state.subredditIndex = action.payload;
    },
    resetSubredditIndex: (state) => {
      state.subredditIndex = 0;
    },
    setNsfwRedditListIndex: (
      state,
      action: { type: string; payload: number }
    ) => {
      state.nsfwRedditListIndex = action.payload;
    },
    resetNsfwRedditListIndex: (state) => {
      state.nsfwRedditListIndex = 0;
    },

    setLastPostRowWasSortOrderNew: (state, action) => {
      state.lastPostRowWasSortOrderNew = action.payload;
    },
    setLoopingForPosts: (state, action) => {
      state.loopingForPosts = action.payload;
    },
    setLoopingForPostsTimeout: (
      state,
      action: { type: string; payload: NodeJS.Timeout }
    ) => {
      state.loopingForPostsTimeout = action.payload;
    },
    resetRedditClient: (state) => {
      // state.accessToken = undefined;
      // state.accessTokenExpiration = undefined;
      // state.rateLimitRemaining = undefined;
      // state.rateLimitResetsAtEpoch = undefined;
      // state.rateLimitUsed = undefined;
      state.redditAuthenticationStatus =
        RedditAuthenticationStatus.NOT_YET_AUTHED;
      state.loopingForPosts = false;
      clearTimeout(state.loopingForPostsTimeout);
      state.loopingForPostsTimeout = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(authenticateReddit.fulfilled, (state) => {
        state.redditAuthenticationStatus =
          RedditAuthenticationStatus.AUTHENTICATED;
      })
      .addCase(authenticateReddit.rejected, (state) => {
        state.redditAuthenticationStatus =
          RedditAuthenticationStatus.AUTHENTICATION_DENIED;
      });
  },
});

export const {
  setMasterSubscribedSubredditList,
  addSubredditsToSubscribedList,
  subredditQueueRemoveAt,
  setSubredditIndex,
  setNsfwRedditListIndex,
  resetNsfwRedditListIndex,
  addSubredditToQueue,
  moveSubredditQueueItemForward,
  moveSubredditQueueItemBack,
  removeSubredditQueueItem,
  setLastPostRowWasSortOrderNew,
  setLoopingForPosts,
  setLoopingForPostsTimeout,
  resetRedditClient,
} = redditClientSlice.actions;
export default redditClientSlice.reducer;
