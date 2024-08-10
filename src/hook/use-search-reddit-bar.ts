import { useState } from "react";
import { SearchRedditBarState } from "../model/state/SearchRedditBarState.ts";

export default function useSearchRedditBar(): SearchRedditBarState {
  const [searchResultsOpen, setSearchResultsOpen] = useState<boolean>(false);

  return {
    searchResultsOpen: searchResultsOpen,
    setSearchResultsOpen: setSearchResultsOpen,
  };
}
