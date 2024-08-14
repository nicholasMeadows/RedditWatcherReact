import { MediaType } from "../Post/MediaTypeEnum.ts";
import { SubredditLists } from "../SubredditList/SubredditLists.ts";
import { Subreddit } from "../Subreddit/Subreddit.ts";

export type ContextMenuState = {
  showContextMenu: boolean;
  x: number;
  y: number;
  copyInfo:
    | {
        url: string;
        mediaType: MediaType;
      }
    | undefined;
  subredditList: SubredditLists | undefined;
  subreddit: Subreddit | undefined;
  openPostPermaLink: string | undefined;
  openSubredditLink: string | undefined;
  showButtonControls: ShowButtonControls;
};

type ShowButtonControls = {
  showOpenPost: boolean;
  showOpenImageInNewTab: boolean;
  showOpenSubreddit: boolean;
  showCopy: boolean;
  showSkipToSubreddit: boolean;
  showAddToList: boolean;
  expandAddToList: boolean;
  showRemoveFromList: boolean;
  expandRemoveFromList: boolean;
  showUpdateListName: boolean;
  showDeleteList: boolean;
};
