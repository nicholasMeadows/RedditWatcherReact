import { RedditAuthenticationStatus } from "./RedditAuthenticationState";
import { Subreddit } from "./Subreddit/Subreddit";
import { SubredditQueueItem } from "./Subreddit/SubredditQueueItem";

export type RedditClientState = {
  accessToken: string | undefined;
  accessTokenExpiration: number | undefined;
  redditAuthenticationStatus: RedditAuthenticationStatus;
  masterSubscribedSubredditList: Array<Subreddit>;
  rateLimitResetsAtEpoch: number | undefined;
  rateLimitRemaining: number | undefined;
  rateLimitUsed: number | undefined;
  subredditQueue: Array<SubredditQueueItem>;
  subredditsToShowInSideBar: Array<Subreddit>;
  mostRecentSubredditGotten: Subreddit | undefined;
  subredditIndex: number;
  lastPostRowWasSortOrderNew: boolean;
  loopingForPosts: boolean;
  loopingForPostsTimeout: NodeJS.Timeout | undefined;
};
