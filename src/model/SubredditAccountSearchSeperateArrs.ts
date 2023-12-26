import { SubredditAccountSearchResult } from "./SubredditAccountSearchResult";

export interface SubredditAccountSearchSeperateArrs {
  users: Array<SubredditAccountSearchResult>;
  subreddits: Array<SubredditAccountSearchResult>;
}
