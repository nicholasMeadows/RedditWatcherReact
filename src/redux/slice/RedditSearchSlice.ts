import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { SubredditAccountSearchResult } from "../../model/SubredditAccountSearchResult";
import {
  searchRedditForSubRedditAndUser,
  subscribe,
  unsubscribe,
} from "../../service/RedditService";
import store from "../store";

export const searchReddit = createAsyncThunk(
  "redditSearch/searchReddit",
  async () => {
    try {
      const results = await searchRedditForSubRedditAndUser(
        store.getState().redditSearch.searchBarInput
      );
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
  searchBarInput: string;
  searchResults: Array<SubredditAccountSearchResult>;
  searchResultsOpen: boolean;
};

const initialState: InitialState = {
  searchBarInput: "",
  searchResults: [],
  searchResultsOpen: false,
};

export const redditSearchSlice = createSlice({
  name: "redditSearch",
  initialState: initialState,
  reducers: {
    setSearchBarInput: (state, action: { type: string; payload: string }) => {
      state.searchBarInput = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    setSearchResultsOpen: (
      state,
      action: { type: string; payload: boolean }
    ) => {
      state.searchResultsOpen = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchReddit.fulfilled, (state, action) => {
        state.searchResults = action.payload;
        state.searchResultsOpen = true;
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

export const { setSearchBarInput, clearSearchResults, setSearchResultsOpen } =
  redditSearchSlice.actions;
export default redditSearchSlice.reducer;
