import { createContext } from "react";
import SubredditQueueDispatch from "../model/state/dispatch/SubredditQueueDispatch.ts";
import { SubredditQueueState } from "../model/state/SubredditQueueState.ts";

export const SubredditQueueStateContext = createContext<SubredditQueueState>(
  {} as SubredditQueueState
);
export const SubredditQueueDispatchContext =
  createContext<SubredditQueueDispatch>({} as SubredditQueueDispatch);
