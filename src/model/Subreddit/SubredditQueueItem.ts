import { Subreddit } from "./Subreddit";

export interface SubredditQueueItem extends Subreddit {
    subredditQueueItemUuid: string
}