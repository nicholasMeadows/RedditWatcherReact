import { T2Subreddit } from "./T2Subreddit";

export interface T2 {
  is_suspended: boolean | undefined;
  name: string;
  subreddit: T2Subreddit;
}
