import { Subreddit } from "../model/Subreddit/Subreddit.ts";
import { SubredditLists } from "../model/SubredditList/SubredditLists.ts";
import { createContext } from "react";

export type SideBarFields = {
  subredditsToShowInSideBar: Array<Subreddit>;
  subredditsToShow: Array<Subreddit>;
  mostRecentSubredditGotten: Subreddit | undefined;
  availableSubredditListsForFilter: Array<SubredditLists>;
  listToFilterByUuid: string;
  searchInput: string;
  sideBarOpen: boolean;
  openSidebarButtonTopPercent: number;
  mouseOverSubredditList: boolean;
  timeTillNextGetPostsSeconds: number;
};

type SideBarContextData = {
  sidebarContextData: SideBarFields;
  setSidebarContextData: React.Dispatch<React.SetStateAction<SideBarFields>>;
};
export const SideBarContext = createContext<SideBarContextData>(
  {} as SideBarContextData
);
