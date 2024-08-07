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

export type GetPostsFromSubredditState = {
  postRows: Array<PostRow>;
  subredditSourceOption: SubredditSourceOptionsEnum;
  subredditSortOrderOption: SubredditSortOrderOptionsEnum;
  getAllSubredditsAtOnce: boolean;
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
  useInMemoryImagesAndGifs: boolean;
};

export type GetPostsFromSubredditResponse = {
  posts: Array<Post>;
  fromSubreddits: Array<Subreddit>;
  subredditQueueItemToRemove: Subreddit | undefined;
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
