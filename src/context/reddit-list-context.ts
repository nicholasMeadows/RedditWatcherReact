import { createContext } from "react";
import { RedditListState } from "../model/state/RedditListState.ts";
import RedditListDispatch from "../model/state/dispatch/RedditListDispatch.ts";

export const RedditListStateContext = createContext({} as RedditListState);
export const RedditListDispatchContext = createContext(
  {} as RedditListDispatch
);
