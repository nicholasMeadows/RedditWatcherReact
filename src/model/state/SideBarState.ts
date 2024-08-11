import { Subreddit } from "../Subreddit/Subreddit.ts";

export type SideBarState = {
  subredditsToShowInSideBar: Array<Subreddit>;
  mostRecentSubredditGotten: Subreddit | undefined;
  sideBarOpen: boolean;
  openSidebarButtonTopPercent: number;
};
