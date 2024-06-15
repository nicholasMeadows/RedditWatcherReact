import { createContext, Dispatch } from "react";
import {
  SubredditQueueAction,
  SubredditQueueState,
} from "../reducer/sub-reddit-queue-reducer.ts";

export const SubredditQueueStateContext = createContext<SubredditQueueState>(
  {} as SubredditQueueState
);
export const SubredditQueueDispatchContext = createContext<
  Dispatch<SubredditQueueAction>
>({} as Dispatch<SubredditQueueAction>);
