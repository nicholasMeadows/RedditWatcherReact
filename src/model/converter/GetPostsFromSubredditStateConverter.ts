import SubredditSortOrderOptionsEnum from "../config/enums/SubredditSortOrderOptionsEnum.ts";
import UserFrontPagePostSortOrderOptionsEnum from "../config/enums/UserFrontPagePostSortOrderOptionsEnum.ts";
import ContentFilteringOptionEnum from "../config/enums/ContentFilteringOptionEnum.ts";
import { Subreddit } from "../Subreddit/Subreddit.ts";
import PostSortOrderOptionsEnum from "../config/enums/PostSortOrderOptionsEnum.ts";
import TopTimeFrameOptionsEnum from "../config/enums/TopTimeFrameOptionsEnum.ts";
import SelectSubredditIterationMethodOptionsEnum from "../config/enums/SelectSubredditIterationMethodOptionsEnum.ts";
import SortOrderDirectionOptionsEnum from "../config/enums/SortOrderDirectionOptionsEnum.ts";
import { SubredditLists } from "../SubredditList/SubredditLists.ts";
import { PostRow } from "../PostRow.ts";
import { Post } from "../Post/Post.ts";
import RandomIterationSelectWeightOptionsEnum from "../config/enums/RandomIterationSelectWeightOptionsEnum.ts";
import SelectedSubredditListSortOptionEnum from "../config/enums/SelectedSubredditListSortOptionEnum.ts";

export type GetPostsFromSubredditState = {
  postRows: Array<PostRow>;
  subredditSortOrderOption: SubredditSortOrderOptionsEnum;
  userFrontPagePostSortOrderOption: UserFrontPagePostSortOrderOptionsEnum;
  contentFiltering: ContentFilteringOptionEnum;
  subredditQueue: Array<Subreddit>;
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
  selectedSubredditListSortOption: SelectedSubredditListSortOptionEnum;
};

export type GetPostsUpdatedValues = {
  subredditQueueItemToRemove: Subreddit;
  mostRecentSubredditGotten: Subreddit | undefined;
  postRowRemoveAt: number | undefined;
  subredditsToShowInSideBar: Array<Subreddit> | undefined;
  masterSubscribedSubredditList: Array<Subreddit> | undefined;
  subredditIndex: number | undefined;
  nsfwRedditListIndex: number | undefined;
  lastPostRowWasSortOrderNew: boolean | undefined;
  createPostRowAndInsertAtBeginning: Array<Post> | undefined;
  shiftPostsAndUiPosts: { postRowUuid: string; posts: Array<Post> } | undefined;
};
