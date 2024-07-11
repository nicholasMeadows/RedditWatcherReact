import { RedditCredentials } from "./RedditCredentials";
import ContentFilteringOptionEnum from "./enums/ContentFilteringOptionEnum";
import PostSortOrderOptionsEnum from "./enums/PostSortOrderOptionsEnum";
import RandomIterationSelectWeightOptionsEnum from "./enums/RandomIterationSelectWeightOptionsEnum";
import SelectSubredditIterationMethodOptionsEnum from "./enums/SelectSubredditIterationMethodOptionsEnum";
import SelectSubredditListMenuSortOptionEnum from "./enums/SelectSubredditListMenuSortOptionEnum";
import SortOrderDirectionOptionsEnum from "./enums/SortOrderDirectionOptionsEnum";
import SubredditSortOrderOptionsEnum from "./enums/SubredditSortOrderOptionsEnum";
import TopTimeFrameOptionsEnum from "./enums/TopTimeFrameOptionsEnum";
import { AutoScrollPostRowOptionEnum } from "./enums/AutoScrollPostRowOptionEnum.ts";
import { AutoScrollPostRowDirectionOptionEnum } from "./enums/AutoScrollPostRowDirectionOptionEnum.ts";
import SubredditSourceOptionsEnum from "./enums/SubredditSourceOptionsEnum.ts";

export interface AppConfig {
  redditCredentials: RedditCredentials;
  subredditSourceOption: SubredditSourceOptionsEnum;
  subredditSortOrderOption: SubredditSortOrderOptionsEnum;
  getAllSubredditsAtOnce: boolean;
  autoScrollPostRowOption: AutoScrollPostRowOptionEnum;
  autoScrollPostRowDirectionOption: AutoScrollPostRowDirectionOptionEnum;
  autoScrollPostRowRateSecondsForSinglePostCard: number;
  randomIterationSelectWeightOption: RandomIterationSelectWeightOptionsEnum;
  selectSubredditListMenuSortOption: SelectSubredditListMenuSortOptionEnum;
  sortOrderDirectionOption: SortOrderDirectionOptionsEnum;
  postSortOrderOption: PostSortOrderOptionsEnum;
  topTimeFrameOption: TopTimeFrameOptionsEnum;
  selectSubredditIterationMethodOption: SelectSubredditIterationMethodOptionsEnum;
  concatRedditUrlMaxLength: number;
  contentFiltering: ContentFilteringOptionEnum;
  redditApiItemLimit: number;
  postsToShowInRow: number;
  postRowsToShowInView: number;
  darkMode: boolean;
}
