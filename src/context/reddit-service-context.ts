import { createContext } from "react";
import { RedditServiceState } from "../model/state/RedditServiceState.ts";
import RedditServiceDispatch from "../model/state/dispatch/RedditServiceDispatch.ts";

export const RedditServiceStateContext = createContext<RedditServiceState>(
  {} as RedditServiceState
);
export const RedditServiceDispatchContext =
  createContext<RedditServiceDispatch>({} as RedditServiceDispatch);
