import { FC, ReactNode, useReducer } from "react";
import {
  RedditServiceDispatchContext,
  RedditServiceStateContext,
} from "../reddit-service-context.ts";
import { RedditServiceState } from "../../model/state/RedditServiceState.ts";
import RedditServiceReducer from "../../reducer/reddit-service-reducer.ts";
import { RedditAuthenticationStatus } from "../../model/RedditAuthenticationState.ts";
import { SECONDS_BETWEEN_GET_POST_ROWS } from "../../RedditWatcherConstants.ts";

type Props = {
  children: ReactNode;
};

const RedditServiceContextProvider: FC<Props> = ({ children }) => {
  const initialState: RedditServiceState = {
    masterSubscribedSubredditList: [],
    nsfwSubredditIndex: 0,
    subredditIndex: 0,
    lastPostRowWasSortOrderNew: false,
    redditAuthenticationStatus: RedditAuthenticationStatus.NOT_YET_AUTHED,
    subredditQueue: [],
    secondsTillGettingNextPosts: SECONDS_BETWEEN_GET_POST_ROWS,
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
