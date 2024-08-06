import { createContext } from "react";
import {
  RedditServiceDispatch,
  RedditServiceState,
} from "../reducer/reddit-service-reducer.ts";

export const RedditServiceStateContext = createContext<RedditServiceState>(
  {} as RedditServiceState
);
export const RedditServiceDispatchContext =
  createContext<RedditServiceDispatch>({} as RedditServiceDispatch);
