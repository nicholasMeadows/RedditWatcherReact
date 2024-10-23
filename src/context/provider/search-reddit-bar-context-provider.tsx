import { FC, ReactNode, useReducer } from "react";
import SearchRedditBarReducer from "../../reducer/search-reddit-bar-reducer.ts";
import { SearchRedditBarState } from "../../model/state/SearchRedditBarState.ts";
import {
  SearchRedditBarContext,
  SearchRedditBarDispatchContext,
} from "../search-reddit-bar-context.ts";

const initialState: SearchRedditBarState = {
  searchResultsOpen: false,
  searchResults: [],
};
type Props = {
  children: ReactNode;
};

const SearchRedditBarContextProvider: FC<Props> = ({ children }) => {
  const [searchRedditBarState, dispatch] = useReducer(
    SearchRedditBarReducer,
    initialState
  );
  return (
    <SearchRedditBarContext.Provider value={searchRedditBarState}>
      <SearchRedditBarDispatchContext.Provider value={dispatch}>
        {children}
      </SearchRedditBarDispatchContext.Provider>
    </SearchRedditBarContext.Provider>
  );
};
export default SearchRedditBarContextProvider;
