import { SubredditLists } from "../model/SubredditList/SubredditLists.ts";
import { Subreddit } from "../model/Subreddit/Subreddit.ts";
import { createContext } from "react";

export type ShowButtonControls = {
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

export type ContextMenuContextData = {
  showContextMenu: boolean;
  x: number;
  y: number;
  copyInfo:
    | {
        url: string;
        mediaType: string;
      }
    | undefined;
  updateSubredditListInfo:
    | {
        subredditList: SubredditLists;
      }
    | undefined;
  subreddit: Subreddit | undefined;
  openPostPermaLink: string | undefined;
  openSubredditLink: string | undefined;
  showButtonControls: ShowButtonControls;
};
export const InitialContextMenuContextData: ContextMenuContextData = {
  showContextMenu: false,
  x: 0,
  y: 0,
  copyInfo: undefined,
  subreddit: undefined,
  updateSubredditListInfo: undefined,
  openPostPermaLink: undefined,
  openSubredditLink: undefined,
  showButtonControls: {
    showOpenImageInNewTab: false,
    showOpenPost: false,
    showOpenSubreddit: false,
    showCopy: false,
    showSkipToSubreddit: false,
    showAddToList: false,
    expandAddToList: false,
    showRemoveFromList: false,
    expandRemoveFromList: false,
    showUpdateListName: false,
    showDeleteList: false,
  },
};
type contextMenuContextObj = {
  contextMenuData: ContextMenuContextData;
  setContextMenuData: React.Dispatch<
    React.SetStateAction<ContextMenuContextData>
  >;
};
export const ContextMenuContext = createContext<contextMenuContextObj>({
  contextMenuData: InitialContextMenuContextData,
  setContextMenuData: () => {},
});
