import { Subreddit } from "../Subreddit/Subreddit.ts";
import { SubredditLists } from "../SubredditList/SubredditLists.ts";

export type SideBarState = {
  subredditsToShowInSideBar: Array<Subreddit>;
  subredditsToShow: Array<Subreddit>;
  mostRecentSubredditGotten: Subreddit | undefined;
  availableSubredditListsForFilter: Array<SubredditLists>;
  listToFilterByUuid: string;
  searchInput: string;
  sideBarOpen: boolean;
  openSidebarButtonTopPercent: number;
  secondsTillGettingNextPosts: number;
};
