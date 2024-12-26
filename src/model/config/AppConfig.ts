import { RedditCredentials } from "./RedditCredentials";
import ContentFilteringOptionEnum from "./enums/ContentFilteringOptionEnum";
import PostSortOrderOptionsEnum from "./enums/PostSortOrderOptionsEnum";
import RandomIterationSelectWeightOptionsEnum from "./enums/RandomIterationSelectWeightOptionsEnum";
import SelectSubredditIterationMethodOptionsEnum from "./enums/SelectSubredditIterationMethodOptionsEnum";
import SelectSubredditListMenuSortOptionEnum from "./enums/SelectSubredditListMenuSortOptionEnum";
import SortOrderDirectionOptionsEnum from "./enums/SortOrderDirectionOptionsEnum";
import SubredditSortOrderOptionsEnum from "./enums/SubredditSortOrderOptionsEnum";
import TopTimeFrameOptionsEnum from "./enums/TopTimeFrameOptionsEnum";
import { AutoScrollPostRowDirectionOptionEnum } from "./enums/AutoScrollPostRowDirectionOptionEnum.ts";
import SubredditSourceOptionsEnum from "./enums/SubredditSourceOptionsEnum.ts";
import { PostConverterFilteringOptions } from "./PostConverterFilteringOptions.ts";

export interface AppConfig {
  redditCredentials: RedditCredentials;
  subredditSourceOption: SubredditSourceOptionsEnum;
  subredditSortOrderOption: SubredditSortOrderOptionsEnum;
  getAllSubredditsAtOnce: boolean;
  autoScrollPostRow: boolean;
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
  useInMemoryImagesAndGifs: boolean;
  postConverterFilteringOptions: PostConverterFilteringOptions;
  getPostRowIterationTime: number;
  nodeRedUrl: string | undefined;
  redditListDotComNumOfSubredditsToGet: number;
}
