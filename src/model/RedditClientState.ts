import { RedditAuthenticationStatus } from "./RedditAuthenticationState";
import { Subreddit } from "./Subreddit/Subreddit";
import { SubredditQueueItem } from "./Subreddit/SubredditQueueItem";

export type RedditClientState = {
  redditAuthenticationStatus: RedditAuthenticationStatus;
  masterSubscribedSubredditList: Array<Subreddit>;
  subredditQueue: Array<SubredditQueueItem>;
  subredditIndex: number;
  nsfwRedditListIndex: number;
  lastPostRowWasSortOrderNew: boolean;
  loopingForPosts: boolean;
  loopingForPostsTimeout: NodeJS.Timeout | undefined;
};
