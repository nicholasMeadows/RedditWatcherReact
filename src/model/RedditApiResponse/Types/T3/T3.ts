import MediaMetadata from "./MediaMetadata";

export interface T3 {
  subreddit: string;
  subreddit_name_prefixed: string;
  subreddit_subscribers: number;
  over_18: boolean;
  created: number;
  name: string;
  domain: string;
  url: string;
  permalink: string;
  media_metadata: { [key: string]: MediaMetadata } | undefined;
  crosspost_parent_list: Array<T3> | undefined;
}
