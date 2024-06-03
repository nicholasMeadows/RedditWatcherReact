import { SearchRedditBarContextData } from "../context/search-reddit-bar-context.ts";
import { useState } from "react";

export default function useSearchRedditBar(): SearchRedditBarContextData {
  const [searchResultsOpen, setSearchResultsOpen] = useState<boolean>(false);

  return {
    searchResultsOpen: searchResultsOpen,
    setSearchResultsOpen: setSearchResultsOpen,
  };
}
