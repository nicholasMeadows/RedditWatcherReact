import { createContext } from "react";
import {
  RedditListDispatch,
  RedditListState,
} from "../reducer/reddit-list-reducer.ts";

export const RedditListStateContext = createContext({} as RedditListState);
export const RedditListDispatchContext = createContext(
  {} as RedditListDispatch
);
