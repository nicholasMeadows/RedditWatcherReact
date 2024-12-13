import { Subreddit } from "../Subreddit/Subreddit.ts";
import { Post } from "../Post/Post.ts";
import TopTimeFrameOptionsEnum from "../config/enums/TopTimeFrameOptionsEnum.ts";
import PostSortOrderOptionsEnum from "../config/enums/PostSortOrderOptionsEnum.ts";
import { SubredditLists } from "../SubredditList/SubredditLists.ts";
import SubredditSourceOptionsEnum from "../config/enums/SubredditSourceOptionsEnum.ts";
import SortOrderDirectionOptionsEnum from "../config/enums/SortOrderDirectionOptionsEnum.ts";
import SubredditSortOrderOptionsEnum from "../config/enums/SubredditSortOrderOptionsEnum.ts";
import ContentFilteringOptionEnum from "../config/enums/ContentFilteringOptionEnum.ts";
import { PostRow } from "../PostRow.ts";
import SelectSubredditIterationMethodOptionsEnum from "../config/enums/SelectSubredditIterationMethodOptionsEnum.ts";
import RandomIterationSelectWeightOptionsEnum from "../config/enums/RandomIterationSelectWeightOptionsEnum.ts";
import { SubredditQueueItem } from "../Subreddit/SubredditQueueItem.ts";
import { PostConverterFilteringOptions } from "../config/PostConverterFilteringOptions.ts";

export type GetPostsFromSubredditState = {
  postRows: Array<PostRow>;
  subredditSourceOption: SubredditSourceOptionsEnum;
  subredditSortOrderOption: SubredditSortOrderOptionsEnum;
  getAllSubredditsAtOnce: boolean;
  contentFiltering: ContentFilteringOptionEnum;
  subredditQueue: Array<SubredditQueueItem>;
  concatRedditUrlMaxLength: number;
  postSortOrder: PostSortOrderOptionsEnum;
  topTimeFrame: TopTimeFrameOptionsEnum;
  redditApiItemLimit: number;
  selectSubredditIterationMethodOption: SelectSubredditIterationMethodOptionsEnum;
  sortOrderDirection: SortOrderDirectionOptionsEnum;
  nsfwSubredditIndex: number;
  masterSubredditList: Array<Subreddit>;
  subredditIndex: number;
  subredditLists: Array<SubredditLists>;
  lastPostRowWasSortOrderNew: boolean;
  randomIterationSelectWeightOption: RandomIterationSelectWeightOptionsEnum;
  useInMemoryImagesAndGifs: boolean;
  postConverterFilteringOptions: PostConverterFilteringOptions;
};

export type GetPostsFromSubredditResponse = {
  posts: undefined | Array<Post>;
  fromSubreddits: undefined | Array<Subreddit>;
  subredditQueueItemToRemove: undefined | SubredditQueueItem;
  mostRecentSubredditGotten: undefined | Subreddit;
  subredditsToShowInSideBar: undefined | Array<Subreddit>;
  subredditIndex: number | undefined;
  nsfwRedditListIndex: number | undefined;
};
