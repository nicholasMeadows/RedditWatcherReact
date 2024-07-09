import { Post } from "../model/Post/Post.ts";
import { Subreddit } from "../model/Subreddit/Subreddit.ts";
import {
  GetPostsFromSubredditState,
  GetPostsUpdatedValues,
} from "../model/converter/GetPostsFromSubredditStateConverter.ts";
import RedditClient from "../client/RedditClient.ts";
import { MAX_POSTS_PER_ROW } from "../RedditWatcherConstants.ts";
import { GetPostsForSubredditUrlConverter } from "../model/converter/GetPostsForSubredditUrlConverter.ts";
import SubredditSortOrderOptionsEnum from "../model/config/enums/SubredditSortOrderOptionsEnum.ts";
import { RedditListDotComConverter } from "../model/converter/RedditListDotComConverter.ts";
import { getSubredditsFromRedditListDotCom } from "./RedditListDotComClient.ts";
import SelectSubredditIterationMethodOptionsEnum from "../model/config/enums/SelectSubredditIterationMethodOptionsEnum.ts";
import SortOrderDirectionOptionsEnum from "../model/config/enums/SortOrderDirectionOptionsEnum.ts";
import {
  concatSelectedSubredditLists,
  filterSubredditsListByUsersOnly,
  getSubredditFromList,
  sortPostsByCreate,
  sortSelectedSubreddits,
  sortSubredditListAlphabetically,
  sortSubredditsBySubscribers,
} from "../util/RedditServiceUtil.ts";
import ContentFilteringOptionEnum from "../model/config/enums/ContentFilteringOptionEnum.ts";
import { Dispatch, MutableRefObject } from "react";
import {
  AppNotificationsAction,
  AppNotificationsActionType,
} from "../reducer/app-notifications-reducer.ts";
import { v4 as uuidV4 } from "uuid";
import {
  SubredditQueueAction,
  SubredditQueueActionType,
} from "../reducer/sub-reddit-queue-reducer.ts";
import { RedditCredentials } from "../model/config/RedditCredentials.ts";
import { PostRowsDispatch } from "../context/post-rows-context.ts";
import { PostRowsActionType } from "../reducer/post-rows-reducer.ts";
import {
  SideBarActionType,
  SideBarDispatch,
} from "../reducer/side-bar-reducer.ts";
import { SubredditLists } from "../model/SubredditList/SubredditLists.ts";
import PostSortOrderOptionsEnum from "../model/config/enums/PostSortOrderOptionsEnum.ts";

export default class RedditService {
  declare redditClient: RedditClient;

  constructor(redditCredentials: RedditCredentials) {
    this.redditClient = new RedditClient(redditCredentials);
  }

  async loadSubscribedSubreddits(
    masterSubscribedSubredditListRef: MutableRefObject<Array<Subreddit>>,
    redditApiItemLimit: number,
    async: boolean = true
  ) {
    let subscribedSubreddits = new Array<Subreddit>();
    let results = await this.redditClient.getSubscribedSubReddits(
      redditApiItemLimit,
      undefined
    );
    subscribedSubreddits.push(...results.subreddits);
    masterSubscribedSubredditListRef.current = subscribedSubreddits;
    const asyncLoopForRemainingSubreddits = async () => {
      while (results.after != undefined) {
        results = await this.redditClient.getSubscribedSubReddits(
          redditApiItemLimit,
          results.after
        );
        subscribedSubreddits = [...subscribedSubreddits, ...results.subreddits];
        masterSubscribedSubredditListRef.current = subscribedSubreddits;
      }
    };
    if (async) {
      asyncLoopForRemainingSubreddits();
    } else {
      await asyncLoopForRemainingSubreddits();
    }
  }

  async getPostsForPostRow(
    getPostsFromSubredditsState: GetPostsFromSubredditState,
    getPostsUpdatedValues: GetPostsUpdatedValues
  ): Promise<{
    posts: Array<Post>;
    fromSubreddits: Array<Subreddit>;
  }> {
    console.log("about to get post row");
    let postsFromSubreddit: Post[];
    const fromSubreddits = new Array<Subreddit>();

    if (getPostsFromSubredditsState.subredditQueue.length != 0) {
      const subreddit = getPostsFromSubredditsState.subredditQueue[0];
      getPostsUpdatedValues.subredditQueueItemToRemove = subreddit;
      fromSubreddits.push(subreddit);
      postsFromSubreddit = await this.getPostsForSubreddit(
        [subreddit],
        getPostsFromSubredditsState
      );
      getPostsUpdatedValues.mostRecentSubredditGotten = subreddit;
    } else if (
      getPostsFromSubredditsState.subredditSortOrderOption ===
      SubredditSortOrderOptionsEnum.FrontPage
    ) {
      postsFromSubreddit = await this.redditClient.getUserFrontPage(
        getPostsFromSubredditsState.postSortOrder,
        getPostsFromSubredditsState.topTimeFrame,
        getPostsFromSubredditsState.redditApiItemLimit,
        getPostsFromSubredditsState.masterSubredditList,
        getPostsFromSubredditsState.subredditLists
      );
    } else {
      const { posts, fromSubreddits } = await this.getPostsBasedOnSettings(
        getPostsFromSubredditsState,
        getPostsUpdatedValues
      );
      postsFromSubreddit = posts;
      fromSubreddits.push(...fromSubreddits);
    }
    postsFromSubreddit = this.filterPostContent(
      getPostsFromSubredditsState.contentFiltering,
      postsFromSubreddit
    );
    if (postsFromSubreddit.length > 0) {
      if (postsFromSubreddit.length > MAX_POSTS_PER_ROW) {
        postsFromSubreddit = postsFromSubreddit.slice(0, MAX_POSTS_PER_ROW + 1);
      }
    }

    return {
      posts: postsFromSubreddit,
      fromSubreddits: fromSubreddits,
    };
  }

  private async getPostsForSubreddit(
    subreddits: Array<Subreddit>,
    getPostsFromSubredditsState: GetPostsFromSubredditState
  ): Promise<Array<Post>> {
    const urlConverter = new GetPostsForSubredditUrlConverter();
    const [url, randomSourceString] = urlConverter.convert(
      subreddits,
      getPostsFromSubredditsState.concatRedditUrlMaxLength,
      getPostsFromSubredditsState.postSortOrder,
      getPostsFromSubredditsState.topTimeFrame,
      getPostsFromSubredditsState.redditApiItemLimit
    );
    console.log("about to get posts for subreddit uri ", url);
    let posts = await this.redditClient.getPostsForSubredditUri(
      url,
      getPostsFromSubredditsState.masterSubredditList,
      getPostsFromSubredditsState.subredditLists
    );
    posts = posts.map<Post>((value) => {
      value.randomSourceString = randomSourceString;
      return value;
    });
    return posts;
  }

  private async getPostsBasedOnSettings(
    getPostsFromSubredditsState: GetPostsFromSubredditState,
    getPostsUpdatedValues: GetPostsUpdatedValues
  ): Promise<{
    posts: Array<Post>;
    fromSubreddits: Array<Subreddit>;
  }> {
    const subredditSortOrderOption =
      getPostsFromSubredditsState.subredditSortOrderOption;
    let fromSubreddits: Array<Subreddit> = new Array<Subreddit>();
    let sourceSubreddits: Array<Subreddit> = new Array<Subreddit>();
    if (
      subredditSortOrderOption ==
        SubredditSortOrderOptionsEnum.RedditListDotComRecentActivity ||
      subredditSortOrderOption ==
        SubredditSortOrderOptionsEnum.RedditListDotComSubscribers ||
      subredditSortOrderOption ==
        SubredditSortOrderOptionsEnum.RedditListDotCom24HourGrowth
    ) {
      console.log("getting from redditlist.com");
      const converter = new RedditListDotComConverter();
      const htmlArray = await getSubredditsFromRedditListDotCom();
      let subreddits = new Array<Subreddit>();
      switch (subredditSortOrderOption) {
        case SubredditSortOrderOptionsEnum.RedditListDotComRecentActivity:
          subreddits =
            converter.convertToReddListDotComRecentActivity(htmlArray);
          break;
        case SubredditSortOrderOptionsEnum.RedditListDotComSubscribers:
          subreddits = converter.convertToReddListDotComSubscribers(htmlArray);
          break;
        case SubredditSortOrderOptionsEnum.RedditListDotCom24HourGrowth:
          subreddits = converter.convertToReddListDotCom24HourGrowth(htmlArray);
          break;
      }

      const { subreddit } = this.getRedditListDotComSubredditBasedOnSettings(
        subreddits,
        getPostsFromSubredditsState,
        getPostsUpdatedValues
      );
      if (subreddit != undefined) {
        fromSubreddits = [subreddit];
        sourceSubreddits = subreddits;
      }
    } else {
      const { subredditsToGetPostsFor, sourceSubredditArray } =
        this.getSubredditsToGetPostsFor(
          getPostsFromSubredditsState,
          getPostsUpdatedValues
        );
      fromSubreddits = subredditsToGetPostsFor;
      sourceSubreddits = sourceSubredditArray;
    }
    const posts = await this.getPostsForSubreddit(
      fromSubreddits,
      getPostsFromSubredditsState
    );

    getPostsUpdatedValues.subredditsToShowInSideBar = sourceSubreddits;
    getPostsUpdatedValues.mostRecentSubredditGotten =
      fromSubreddits.length == 1 ? fromSubreddits[0] : undefined;

    return {
      posts: posts,
      fromSubreddits: fromSubreddits,
    };
  }

  private getRedditListDotComSubredditBasedOnSettings(
    subreddits: Array<Subreddit>,
    getPostsFromSubredditsState: GetPostsFromSubredditState,
    getPostsUpdatedValues: GetPostsUpdatedValues
  ): {
    subreddit: Subreddit | undefined;
  } {
    const selectSubredditIterationMethodOption =
      getPostsFromSubredditsState.selectSubredditIterationMethodOption;
    const nsfwSubredditIndex = getPostsFromSubredditsState.nsfwSubredditIndex;
    const sortOrderDirection = getPostsFromSubredditsState.sortOrderDirection;
    let indexToSelect;
    if (
      selectSubredditIterationMethodOption ==
      SelectSubredditIterationMethodOptionsEnum.Random
    ) {
      indexToSelect = Math.round(Math.random() * (subreddits.length - 1));
    } else if (
      selectSubredditIterationMethodOption ==
      SelectSubredditIterationMethodOptionsEnum.Sequential
    ) {
      indexToSelect = nsfwSubredditIndex;
      if (indexToSelect < 0 || indexToSelect >= subreddits.length) {
        if (sortOrderDirection == SortOrderDirectionOptionsEnum.Normal) {
          indexToSelect = 0;
        } else if (
          sortOrderDirection == SortOrderDirectionOptionsEnum.Reversed
        ) {
          indexToSelect = subreddits.length - 1;
        }
      }

      if (indexToSelect != undefined) {
        if (sortOrderDirection == SortOrderDirectionOptionsEnum.Normal) {
          getPostsUpdatedValues.nsfwRedditListIndex = indexToSelect + 1;
        } else if (
          sortOrderDirection == SortOrderDirectionOptionsEnum.Reversed
        ) {
          getPostsUpdatedValues.nsfwRedditListIndex = indexToSelect - 1;
        }
      }
    }

    return {
      subreddit:
        indexToSelect != undefined ? subreddits[indexToSelect] : undefined,
    };
  }

  private getSubredditsToGetPostsFor(
    getPostsFromSubredditsState: GetPostsFromSubredditState,
    getPostsUpdatedValues: GetPostsUpdatedValues
  ): {
    subredditsToGetPostsFor: Array<Subreddit>;
    sourceSubredditArray: Array<Subreddit>;
  } {
    const subredditSortOrderOption =
      getPostsFromSubredditsState.subredditSortOrderOption;
    const masterSubscribedSubredditList =
      getPostsFromSubredditsState.masterSubredditList;
    const subredditIndex = getPostsFromSubredditsState.subredditIndex;
    const subredditLists = getPostsFromSubredditsState.subredditLists;

    const subredditsToGetPostsFor = new Array<Subreddit>();
    const sourceSubredditArray = new Array<Subreddit>();

    if (SubredditSortOrderOptionsEnum.Random === subredditSortOrderOption) {
      //Get a random subreddit from subscribed reddits. Ignore iteration method
      sourceSubredditArray.push(...masterSubscribedSubredditList);
      const randomIndex = Math.floor(
        Math.random() * masterSubscribedSubredditList.length
      );
      const subreddit = masterSubscribedSubredditList[randomIndex];
      subredditsToGetPostsFor.push(subreddit);

      getPostsUpdatedValues.masterSubscribedSubredditList =
        masterSubscribedSubredditList;
    } else if (
      SubredditSortOrderOptionsEnum.SubCount === subredditSortOrderOption
    ) {
      //Sort subscribed reddits by subscribers. Get random or next in iteration based on iteration method
      const sortedSubreddits = sortSubredditsBySubscribers(
        masterSubscribedSubredditList,
        getPostsFromSubredditsState
      );
      sourceSubredditArray.push(...sortedSubreddits);
      const { subreddit, updatedIndex } = getSubredditFromList(
        subredditIndex,
        sortedSubreddits,
        getPostsFromSubredditsState
      );
      getPostsUpdatedValues.subredditIndex = updatedIndex;
      if (subreddit != undefined) {
        subredditsToGetPostsFor.push(subreddit);
      }
    } else if (
      SubredditSortOrderOptionsEnum.RedditUsersOnly === subredditSortOrderOption
    ) {
      //Sort subscribed reddits by users only. Get random or next in iteration based on iteration method
      const userSubreddits = filterSubredditsListByUsersOnly(
        masterSubscribedSubredditList,
        getPostsFromSubredditsState
      );
      sourceSubredditArray.push(...userSubreddits);
      const { subreddit } = getSubredditFromList(
        subredditIndex,
        userSubreddits,
        getPostsFromSubredditsState
      );
      if (subreddit != undefined) {
        subredditsToGetPostsFor.push(subreddit);
      }
    } else if (
      SubredditSortOrderOptionsEnum.Alphabetically === subredditSortOrderOption
    ) {
      //Sort subscribed reddits alphabetically. User sort direction. Get random or next in iteration based on iteration method
      const sortedSubreddits = sortSubredditListAlphabetically(
        masterSubscribedSubredditList,
        getPostsFromSubredditsState
      );
      sourceSubredditArray.push(...sortedSubreddits);
      const { subreddit } = getSubredditFromList(
        subredditIndex,
        sortedSubreddits,
        getPostsFromSubredditsState
      );
      if (subreddit != undefined) {
        subredditsToGetPostsFor.push(subreddit);
      }
    } else if (
      SubredditSortOrderOptionsEnum.SelectedSubRedditLists ===
      subredditSortOrderOption
    ) {
      //Concat all selected subreddit lists. Get single subreddit based off iteration method. Sort based of SelectedSubredditListSortOptionEnum

      const subreddits = sortSelectedSubreddits(getPostsFromSubredditsState);
      sourceSubredditArray.push(...subreddits);
      const subredditFromListObj = getSubredditFromList(
        subredditIndex,
        subreddits,
        getPostsFromSubredditsState
      );
      getPostsUpdatedValues.subredditIndex = subredditFromListObj.updatedIndex;
      if (subredditFromListObj.subreddit != undefined) {
        subredditsToGetPostsFor.push(subredditFromListObj.subreddit);
      }
    } else if (
      SubredditSortOrderOptionsEnum.SelectedSubRedditListsAllRedditsPerRequest ===
      subredditSortOrderOption
    ) {
      //Concat selected subreddit lists. Get multiple reddits. Sort based of SelectedSubredditListSortOptionEnum
      const subreddits = sortSelectedSubreddits(getPostsFromSubredditsState);
      sourceSubredditArray.push(...subreddits);
      subredditsToGetPostsFor.push(...subreddits);
    } else if (
      SubredditSortOrderOptionsEnum.AllSubRedditLists ==
      subredditSortOrderOption
    ) {
      //Concat all selected subreddit lists. Get single reddit based off iteration method. Sort based of SelectedSubredditListSortOptionEnum
      const subreddits = concatSelectedSubredditLists(subredditLists);
      sourceSubredditArray.push(...subreddits);

      const { subreddit, updatedIndex } = getSubredditFromList(
        subredditIndex,
        subreddits,
        getPostsFromSubredditsState
      );
      getPostsUpdatedValues.subredditIndex = updatedIndex;

      if (subreddit != undefined) {
        subredditsToGetPostsFor.push(subreddit);
      }
    }

    return {
      subredditsToGetPostsFor: subredditsToGetPostsFor,
      sourceSubredditArray: sourceSubredditArray,
    };
  }

  private filterPostContent(
    contentFiltering: ContentFilteringOptionEnum,
    posts: Array<Post>
  ) {
    if (ContentFilteringOptionEnum.SFW === contentFiltering) {
      return posts.filter((post) => !post.over18);
    }

    if (ContentFilteringOptionEnum.NSFW === contentFiltering) {
      return posts.filter((post) => post.over18);
    }
    return posts;
  }

  addPostRow(
    posts: Array<Post>,
    fromSubreddits: Array<Subreddit>,
    getPostsFromSubredditsState: GetPostsFromSubredditState,
    getPostsUpdatedValues: GetPostsUpdatedValues,
    appNotificationsDispatch: Dispatch<AppNotificationsAction>
  ) {
    const postRows = getPostsFromSubredditsState.postRows;
    const lastPostRowWasSortOrderNew =
      getPostsFromSubredditsState.lastPostRowWasSortOrderNew;

    if (posts.length == 0) {
      let msg = `Got 0 posts. Trying again in a little bit.`;
      if (fromSubreddits.length == 1) {
        msg = `Got 0 posts from ${fromSubreddits[0].displayNamePrefixed}. Trying again in a little bit.`;
      }
      appNotificationsDispatch({
        type: AppNotificationsActionType.SUBMIT_APP_NOTIFICATION,
        payload: {
          notificationUuid: uuidV4(),
          message: msg,
        },
      });
      return;
    }

    if (
      getPostsFromSubredditsState.subredditSortOrderOption !==
        SubredditSortOrderOptionsEnum.FrontPage &&
      getPostsFromSubredditsState.postSortOrder !== PostSortOrderOptionsEnum.New
    ) {
      getPostsUpdatedValues.lastPostRowWasSortOrderNew = false;
      getPostsUpdatedValues.createPostRowAndInsertAtBeginning = posts;
      return;
    }

    posts = sortPostsByCreate(posts);
    if (lastPostRowWasSortOrderNew) {
      const postsAlreadyInViewModel = postRows[0].posts;
      const postsToAddToViewModel = new Array<Post>();

      for (const post of posts) {
        const foundPosts = postsAlreadyInViewModel.filter(
          (p) => p.postId == post.postId
        );

        if (foundPosts.length == 0) {
          postsToAddToViewModel.push(post);
        } else {
          break;
        }
      }

      if (postsToAddToViewModel.length > 0) {
        const postRowUuid = postRows[0].postRowUuid;
        getPostsUpdatedValues.shiftPostsAndUiPosts = {
          postRowUuid: postRowUuid,
          posts: postsToAddToViewModel,
        };
      }
    } else {
      getPostsUpdatedValues.createPostRowAndInsertAtBeginning = posts;
    }
    getPostsUpdatedValues.lastPostRowWasSortOrderNew = true;
  }

  applyUpdatedStateValues(
    updatedValues: GetPostsUpdatedValues,
    subredditIndexRef: MutableRefObject<number>,
    nsfwRedditListIndex: MutableRefObject<number>,
    lastPostRowWasSortOrderNewRef: MutableRefObject<boolean>,
    subredditQueueDispatch: Dispatch<SubredditQueueAction>,
    currentPostsToShowInRow: number,
    postRowsDispatch: PostRowsDispatch,
    sideBarDispatch: SideBarDispatch,
    subredditLists: Array<SubredditLists>,
    subredditSortOrderOption: SubredditSortOrderOptionsEnum
  ) {
    if (updatedValues.subredditQueueItemToRemove != undefined) {
      subredditQueueDispatch({
        type: SubredditQueueActionType.REMOVE_SUBREDDIT_QUEUE_ITEM,
        payload: updatedValues.subredditQueueItemToRemove,
      });
    }
    if (updatedValues.mostRecentSubredditGotten != undefined) {
      sideBarDispatch({
        type: SideBarActionType.SET_MOST_RECENT_SUBREDDIT_GOTTEN,
        payload: updatedValues.mostRecentSubredditGotten,
      });
    }
    if (updatedValues.postRowRemoveAt != undefined) {
      postRowsDispatch({
        type: PostRowsActionType.POST_ROW_REMOVE_AT,
        payload: updatedValues.postRowRemoveAt,
      });
    }
    if (updatedValues.subredditsToShowInSideBar != undefined) {
      sideBarDispatch({
        type: SideBarActionType.SET_SUBREDDITS_TO_SHOW_IN_SIDEBAR,
        payload: {
          subreddits: updatedValues.subredditsToShowInSideBar,
          subredditLists: subredditLists,
        },
      });
    }
    if (updatedValues.subredditIndex != undefined) {
      subredditIndexRef.current = updatedValues.subredditIndex;
    }
    if (updatedValues.nsfwRedditListIndex != undefined) {
      nsfwRedditListIndex.current = updatedValues.nsfwRedditListIndex;
    }
    if (updatedValues.lastPostRowWasSortOrderNew != undefined) {
      lastPostRowWasSortOrderNewRef.current =
        updatedValues.lastPostRowWasSortOrderNew;
    }
    if (updatedValues.createPostRowAndInsertAtBeginning != undefined) {
      postRowsDispatch({
        type: PostRowsActionType.CREATE_POST_ROW_AND_INSERT_AT_BEGINNING,
        payload: {
          posts: updatedValues.createPostRowAndInsertAtBeginning,
          postsToShowInRow: currentPostsToShowInRow,
          subredditSortOrderOption: subredditSortOrderOption,
        },
      });
    }
    if (updatedValues.shiftPostsAndUiPosts != undefined) {
      postRowsDispatch({
        type: PostRowsActionType.ADD_POSTS_TO_FRONT_OF_ROW,
        payload: {
          postRowUuid: updatedValues.shiftPostsAndUiPosts.postRowUuid,
          posts: updatedValues.shiftPostsAndUiPosts.posts,
          postsToShowInRow: currentPostsToShowInRow,
          subredditSortOrderOption: subredditSortOrderOption,
        },
      });
    }
  }
}
