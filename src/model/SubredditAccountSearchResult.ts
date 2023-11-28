import { Subreddit } from "./Subreddit/Subreddit";

export interface SubredditAccountSearchResult extends Subreddit {
    isUser: boolean;
    searchResultUuid: string;
}