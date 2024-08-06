import { FC, ReactNode, useReducer } from "react";
import RedditServiceReducer, {
  RedditServiceState,
} from "../../reducer/reddit-service-reducer.ts";
import {
  RedditServiceDispatchContext,
  RedditServiceStateContext,
} from "../reddit-service-context.ts";

type Props = {
  children: ReactNode;
};

const RedditServiceContextProvider: FC<Props> = ({ children }) => {
  const initialState: RedditServiceState = {
    masterSubscribedSubredditList: [],
    nsfwSubredditIndex: 0,
    subredditIndex: 0,
    lastPostRowWasSortOrderNew: false,
  };
  const [redditServiceState, dispatch] = useReducer(
    RedditServiceReducer,
    initialState
  );

  return (
    <RedditServiceStateContext.Provider value={redditServiceState}>
      <RedditServiceDispatchContext.Provider value={dispatch}>
        {children}
      </RedditServiceDispatchContext.Provider>
    </RedditServiceStateContext.Provider>
  );
};
export default RedditServiceContextProvider;
