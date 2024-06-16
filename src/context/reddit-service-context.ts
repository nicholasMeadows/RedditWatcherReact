import { createContext, MutableRefObject } from "react";
import { Subreddit } from "../model/Subreddit/Subreddit.ts";

export type RedditServiceContextState = {
  subredditIndex: MutableRefObject<number>;
  nsfwRedditListIndex: MutableRefObject<number>;
  lastPostRowWasSortOrderNew: MutableRefObject<false>;
  masterSubscribedSubredditList: MutableRefObject<Array<Subreddit>>;
};

const RedditServiceContext = createContext<RedditServiceContextState>(
    {} as RedditServiceContextState
);
export default RedditServiceContext;
