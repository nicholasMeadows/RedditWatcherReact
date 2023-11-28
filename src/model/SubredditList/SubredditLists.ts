import { Subreddit } from "../Subreddit/Subreddit";

export interface SubredditLists {
    subredditListUuid: string;
    listName: string;
    subreddits: Array<Subreddit>;
    selected: boolean;
}