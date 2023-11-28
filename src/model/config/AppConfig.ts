import { RedditCredentials } from "./RedditCredentials";
import ContentFilteringOptionEnum from "./enums/ContentFilteringOptionEnum";
import PostRowScrollOptionsEnum from "./enums/PostRowScrollOptionsEnum";
import PostSortOrderOptionsEnum from "./enums/PostSortOrderOptionsEnum";
import RandomIterationSelectWeightOptionsEnum from "./enums/RandomIterationSelectWeightOptionsEnum";
import RowIncrementOptionsEnum from "./enums/RowIncrementOptionsEnum";
import SelectSubredditIterationMethodOptionsEnum from "./enums/SelectSubredditIterationMethodOptionsEnum";
import SelectSubredditListMenuSortOptionEnum from "./enums/SelectSubredditListMenuSortOptionEnum";
import SelectedSubredditListSortOptionEnum from "./enums/SelectedSubredditListSortOptionEnum";
import SortOrderDirectionOptionsEnum from "./enums/SortOrderDirectionOptionsEnum";
import SubredditSortOrderOptionsEnum from "./enums/SubredditSortOrderOptionsEnum";
import TopTimeFrameOptionsEnum from "./enums/TopTimeFrameOptionsEnum";
import UserFrontPagePostSortOrderOptionsEnum from "./enums/UserFrontPagePostSortOrderOptionsEnum";

export interface AppConfig {
  redditCredentials: RedditCredentials;
  subredditSortOrderOption: SubredditSortOrderOptionsEnum;
  rowIncrementOption: RowIncrementOptionsEnum;
  postRowScrollOption: PostRowScrollOptionsEnum;
  selectedSubredditListSortOption: SelectedSubredditListSortOptionEnum;
  randomIterationSelectWeightOption: RandomIterationSelectWeightOptionsEnum;
  selectSubredditListMenuSortOption: SelectSubredditListMenuSortOptionEnum;
  sortOrderDirectionOption: SortOrderDirectionOptionsEnum;
  postSortOrderOption: PostSortOrderOptionsEnum;
  userFrontPagePostSortOrderOption: UserFrontPagePostSortOrderOptionsEnum;
  topTimeFrameOption: TopTimeFrameOptionsEnum;
  selectSubredditIterationMethodOption: SelectSubredditIterationMethodOptionsEnum;
  concatRedditUrlMaxLength: number;
  contentFiltering: ContentFilteringOptionEnum;
  redditApiItemLimit: number;
  postsToShowInRow: number;
  postRowsToShowInView: number;
  darkMode: boolean;
}
