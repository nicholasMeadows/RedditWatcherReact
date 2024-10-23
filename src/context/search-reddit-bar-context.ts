import { createContext } from "react";
import { SearchRedditBarState } from "../model/state/SearchRedditBarState.ts";
import SearchRedditBarDispatch from "../model/state/dispatch/SearchRedditBarDispatch.ts";

export const SearchRedditBarContext = createContext({} as SearchRedditBarState);
export const SearchRedditBarDispatchContext = createContext(
  {} as SearchRedditBarDispatch
);
