import { RedditCredentials } from "./RedditCredentials";
import ContentFilteringOptionEnum from "./enums/ContentFilteringOptionEnum";
import PostSortOrderOptionsEnum from "./enums/PostSortOrderOptionsEnum";
import RandomIterationSelectWeightOptionsEnum from "./enums/RandomIterationSelectWeightOptionsEnum";
import SelectSubredditIterationMethodOptionsEnum from "./enums/SelectSubredditIterationMethodOptionsEnum";
import SelectSubredditListMenuSortOptionEnum from "./enums/SelectSubredditListMenuSortOptionEnum";
import SelectedSubredditListSortOptionEnum from "./enums/SelectedSubredditListSortOptionEnum";
import SortOrderDirectionOptionsEnum from "./enums/SortOrderDirectionOptionsEnum";
import SubredditSortOrderOptionsEnum from "./enums/SubredditSortOrderOptionsEnum";
import TopTimeFrameOptionsEnum from "./enums/TopTimeFrameOptionsEnum";
import { AutoScrollPostRowOptionEnum } from "./enums/AutoScrollPostRowOptionEnum.ts";
import { AutoScrollPostRowDirectionOptionEnum } from "./enums/AutoScrollPostRowDirectionOptionEnum.ts";

export interface AppConfig {
  redditCredentials: RedditCredentials;
  subredditSortOrderOption: SubredditSortOrderOptionsEnum;
  autoScrollPostRowOption: AutoScrollPostRowOptionEnum;
  autoScrollPostRowDirectionOption: AutoScrollPostRowDirectionOptionEnum;
  autoScrollPostRowRateSecondsForSinglePostCard: number;
  selectedSubredditListSortOption: SelectedSubredditListSortOptionEnum;
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
