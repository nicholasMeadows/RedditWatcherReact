export type SearchRedditBarState = {
  searchResultsOpen: boolean;
  setSearchResultsOpen: (isOpen: boolean) => void;
  darkmodeOverride?: boolean | undefined;
  onFocus?: () => void;
  onBlur?: () => void;
};
