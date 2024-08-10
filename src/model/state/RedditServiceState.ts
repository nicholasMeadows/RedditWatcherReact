import { Subreddit } from "../Subreddit/Subreddit.ts";

export type RedditServiceState = {
  masterSubscribedSubredditList: Array<Subreddit>;
  nsfwSubredditIndex: number;
  subredditIndex: number;
  lastPostRowWasSortOrderNew: boolean;
};
