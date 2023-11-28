import { T2 } from "../RedditApiResponse/Types/T2/T2";
import { T5 } from "../RedditApiResponse/Types/T5";
import { SubredditAccountSearchResult } from "../SubredditAccountSearchResult";

export function convertSubreddit(subreddit: T5): SubredditAccountSearchResult {
  return {
    displayName: subreddit.display_name,
    displayNamePrefixed: subreddit.display_name_prefixed,
    subscribers: subreddit.subscribers,
    isSubscribed:
      subreddit.user_is_subscriber != undefined
        ? (subreddit.user_is_subscriber as boolean)
        : false,
    over18: subreddit.over18,
    isUser: false,
    searchResultUuid: "",
    fromList: "",
    subredditUuid: "",
  };
}

export function convertAccount(account: T2): SubredditAccountSearchResult {
  const subreddit = account.subreddit;
  return {
    displayName: account.name,
    displayNamePrefixed: subreddit.display_name_prefixed,
    subscribers: subreddit.subscribers,
    isSubscribed:
      subreddit.user_is_subscriber != undefined
        ? (subreddit.user_is_subscriber as boolean)
        : false,
    over18: subreddit.over18,
    isUser: true,
    searchResultUuid: "",
    fromList: "",
    subredditUuid: "",
  };
}
