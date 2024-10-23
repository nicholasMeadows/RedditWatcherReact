import { SearchRedditBarState } from "../model/state/SearchRedditBarState.ts";
import { SubredditAccountSearchResult } from "../model/SubredditAccountSearchResult.ts";

export enum SearchRedditBarActionType {
  SET_SEARCH_RESULTS_OPEN = "SET_SEARCH_RESULTS_OPEN",
  SET_SEARCH_RESULTS = "SET_SEARCH_RESULTS",
}

export interface SearchRedditBarBooleanAction {
  type: SearchRedditBarActionType.SET_SEARCH_RESULTS_OPEN;
  payload: boolean;
}

export interface SearchRedditBarSetSearchResultsAction {
  type: SearchRedditBarActionType.SET_SEARCH_RESULTS;
  payload: Array<SubredditAccountSearchResult>;
}

export default function SearchRedditBarReducer(
  state: SearchRedditBarState,
  action: SearchRedditBarBooleanAction | SearchRedditBarSetSearchResultsAction
) {
  switch (action.type) {
    case SearchRedditBarActionType.SET_SEARCH_RESULTS_OPEN:
      return setSearchResultsOpen(state, action);
    case SearchRedditBarActionType.SET_SEARCH_RESULTS:
      return setSearchResults(state, action);
    default:
      return state;
  }
}

const setSearchResultsOpen = (
  state: SearchRedditBarState,
  action: SearchRedditBarBooleanAction
): SearchRedditBarState => {
  return {
    ...state,
    searchResultsOpen: action.payload,
  };
};

const setSearchResults = (
  state: SearchRedditBarState,
  action: SearchRedditBarSetSearchResultsAction
): SearchRedditBarState => {
  return {
    ...state,
    searchResults: action.payload,
  };
};
