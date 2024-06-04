import { createContext } from "react";

export type SearchRedditBarContextData = {
  searchResultsOpen: boolean;
  setSearchResultsOpen: (isOpen: boolean) => void;
  darkmodeOverride?: boolean | undefined;
  onFocus?: () => void;
  onBlur?: () => void;
};

const SearchRedditBarContext = createContext<SearchRedditBarContextData>(
  {} as SearchRedditBarContextData
);
export default SearchRedditBarContext;
