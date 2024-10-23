import { SubredditAccountSearchResult } from "../SubredditAccountSearchResult.ts";

export type SearchRedditBarState = {
  searchResults: SubredditAccountSearchResult[];
  searchResultsOpen: boolean;
};
