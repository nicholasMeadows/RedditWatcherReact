import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  searchRedditForSubRedditAndUser,
  subscribe,
  unsubscribe,
} from "../../service/RedditService";
import { SubredditAccountSearchResult } from "../../model/SubredditAccountSearchResult";

export const searchReddit = createAsyncThunk(
  "redditSearch/searchReddit",
  async (searchTerm: string) => {
    try {
      const results = await searchRedditForSubRedditAndUser(searchTerm);
      return results;
    } catch (e) {
      console.log("exception", e);
    }
    return [];
  }
);

export const subOrUnSubFromSubreddit = createAsyncThunk(
  "redditSearch/subOrUnSubFromSubreddit",
  async (subredditSearchResult: SubredditAccountSearchResult) => {
    const name = subredditSearchResult.displayName;
    if (subredditSearchResult.isSubscribed) {
      await unsubscribe(name);
    } else {
      await subscribe(name);
    }
    return subredditSearchResult;
  }
);

type InitialState = {
  searchResults: Array<SubredditAccountSearchResult>;
};

const initialState: InitialState = {
  searchResults: [],
};

export const redditSearchSlice = createSlice({
  name: "redditSearch",
  initialState: initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchReddit.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      })
      .addCase(subOrUnSubFromSubreddit.fulfilled, (state, action) => {
        const oldSearchResult = action.payload as SubredditAccountSearchResult;
        const foundSearchResult = state.searchResults.find(
          (result) =>
            result.searchResultUuid == oldSearchResult.searchResultUuid
        );
        console.log("foundSearchResult", foundSearchResult);
        if (foundSearchResult != undefined) {
          foundSearchResult.isSubscribed = !foundSearchResult.isSubscribed;
        }
      });
  },
});

export const { clearSearchResults } = redditSearchSlice.actions;
export default redditSearchSlice.reducer;
