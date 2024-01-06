import SubredditSortOrderOptionsEnum from "../config/enums/SubredditSortOrderOptionsEnum.ts";
import UserFrontPagePostSortOrderOptionsEnum from "../config/enums/UserFrontPagePostSortOrderOptionsEnum.ts";
import ContentFilteringOptionEnum from "../config/enums/ContentFilteringOptionEnum.ts";
import { Subreddit } from "../Subreddit/Subreddit.ts";
import PostSortOrderOptionsEnum from "../config/enums/PostSortOrderOptionsEnum.ts";
import TopTimeFrameOptionsEnum from "../config/enums/TopTimeFrameOptionsEnum.ts";
import SelectSubredditIterationMethodOptionsEnum from "../config/enums/SelectSubredditIterationMethodOptionsEnum.ts";
import SortOrderDirectionOptionsEnum from "../config/enums/SortOrderDirectionOptionsEnum.ts";
import { SubredditLists } from "../SubredditList/SubredditLists.ts";
import { PostRowsState } from "../PostRowsState.ts";
import { AppConfigState } from "../config/AppConfigState.ts";
import { RedditClientState } from "../RedditClientState.ts";
import RedditListsState from "../RedditListsState.ts";
import { PostRow } from "../PostRow.ts";

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
};

export class GetPostsFromSubredditStateConverter {
  convert(
    postRowsState: PostRowsState,
    appConfigState: AppConfigState,
    redditClientState: RedditClientState,
    redditListsState: RedditListsState
  ): GetPostsFromSubredditState {
    return {
      postRows: postRowsState.postRows,
      subredditSortOrderOption: appConfigState.subredditSortOrderOption,
      userFrontPagePostSortOrderOption:
        appConfigState.userFrontPagePostSortOrderOption,
      contentFiltering: appConfigState.contentFiltering,
      subredditQueue: redditClientState.subredditQueue,
      concatRedditUrlMaxLength: appConfigState.concatRedditUrlMaxLength,
      postSortOrder: appConfigState.postSortOrderOption,
      topTimeFrame: appConfigState.topTimeFrameOption,
      redditApiItemLimit: appConfigState.redditApiItemLimit,
      selectSubredditIterationMethodOption:
        appConfigState.selectSubredditIterationMethodOption,
      sortOrderDirection: appConfigState.sortOrderDirectionOption,
      nsfwSubredditIndex: redditClientState.nsfwRedditListIndex,
      masterSubredditList: redditClientState.masterSubscribedSubredditList,
      subredditIndex: redditClientState.subredditIndex,
      subredditLists: redditListsState.subredditLists,
      lastPostRowWasSortOrderNew: redditClientState.lastPostRowWasSortOrderNew,
    };
  }
}
