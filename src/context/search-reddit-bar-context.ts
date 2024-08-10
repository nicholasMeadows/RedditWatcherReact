import { createContext } from "react";
import { SearchRedditBarState } from "../model/state/SearchRedditBarState.ts";

const SearchRedditBarContext = createContext<SearchRedditBarState>(
  {} as SearchRedditBarState
);
export default SearchRedditBarContext;
