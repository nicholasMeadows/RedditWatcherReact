import { Subreddit } from "../Subreddit/Subreddit.ts";
import { RedditAuthenticationStatus } from "../RedditAuthenticationState.ts";
import { SubredditQueueItem } from "../Subreddit/SubredditQueueItem.ts";

export type RedditServiceState = {
  redditAuthenticationStatus: RedditAuthenticationStatus;
  masterSubscribedSubredditList: Array<Subreddit>;
  nsfwSubredditIndex: number;
  subredditIndex: number;
  lastPostRowWasSortOrderNew: boolean;
  subredditQueue: Array<SubredditQueueItem>;
};
