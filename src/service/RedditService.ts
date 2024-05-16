import store from "../redux/store.ts";
import RedditClient from "../client/RedditClient.ts";
import { Subreddit } from "../model/Subreddit/Subreddit.ts";
import {
  GetPostsFromSubredditState,
  GetPostsFromSubredditStateConverter,
} from "../model/converter/GetPostsFromSubredditStateConverter.ts";
import { Post } from "../model/Post/Post.ts";
import UserFrontPagePostSortOrderOptionsEnum from "../model/config/enums/UserFrontPagePostSortOrderOptionsEnum.ts";
import { MAX_POSTS_PER_ROW } from "../RedditWatcherConstants.ts";
import SubredditSortOrderOptionsEnum from "../model/config/enums/SubredditSortOrderOptionsEnum.ts";
import { RedditListDotComConverter } from "../model/converter/RedditListDotComConverter.ts";
import { getSubredditsFromRedditListDotCom } from "./RedditListDotComClient.ts";
import {
  concatSelectedSubredditLists,
  filterSubredditsListByUsersOnly,
  getSubredditFromList,
  sortPostsByCreate,
  sortSelectedSubreddits,
  sortSubredditListAlphabetically,
  sortSubredditsBySubscribers,
} from "../util/RedditServiceUtil.ts";
import SelectSubredditIterationMethodOptionsEnum from "../model/config/enums/SelectSubredditIterationMethodOptionsEnum.ts";
import SortOrderDirectionOptionsEnum from "../model/config/enums/SortOrderDirectionOptionsEnum.ts";
import { GetPostsForSubredditUrlConverter } from "../model/converter/GetPostsForSubredditUrlConverter.ts";
import ContentFilteringOptionEnum from "../model/config/enums/ContentFilteringOptionEnum.ts";
import { SubredditAccountSearchResult } from "../model/SubredditAccountSearchResult.ts";
import { v4 as uuidV4 } from "uuid";
import { WaitUtil } from "../util/WaitUtil.ts";
import { submitAppNotification } from "../redux/slice/AppNotificationSlice.ts";
import {
  setMostRecentSubredditGotten,
  setSecondsTillGettingNextPosts,
  setSubredditsToShowInSideBar,
} from "../redux/slice/SideBarSlice.ts";
import {
  addPostsToFrontOfRow,
  createPostRowAndInsertAtBeginning,
  postRowRemoveAt,
} from "../redux/slice/PostRowsSlice.ts";
import { subredditQueueRemoveAt } from "../redux/slice/SubRedditQueueSlice.ts";

export default class RedditService {
  loopingForPosts = false;
  loopingForPostsTimeout: NodeJS.Timeout | undefined = undefined;
  lastPostRowWasSortOrderNew: boolean = false;
  subredditIndex: number = 0;
  nsfwRedditListIndex: number = 0;
  masterSubscribedSubredditList: Array<Subreddit> = [];

  resetService() {
    clearTimeout(this.loopingForPostsTimeout);
    this.loopingForPosts = false;
    this.loopingForPostsTimeout = undefined;
  }

  async startLoopingForPosts() {
    console.log("starting to loop for posts");
    this.loopingForPosts = true;
    await this.loadSubscribedSubreddits();

    const getPostsFunction = async () => {
      return this.getPostsOrchestrationStart();
    };
    getPostsFunction();
    const startWaitingToGetPosts = () => {
      store.dispatch(setSecondsTillGettingNextPosts(10));
      const timeout = setTimeout(async () => {
        await getPostsFunction();
        startWaitingToGetPosts();
      }, 10000);
      this.loopingForPostsTimeout = timeout;
    };
    startWaitingToGetPosts();
  }

  async getPostsOrchestrationStart() {
    let getPostsFromSubredditsState: GetPostsFromSubredditState;

    do {
      const state = store.getState();
      const stateConverter = new GetPostsFromSubredditStateConverter();
      getPostsFromSubredditsState = JSON.parse(
        JSON.stringify(
          stateConverter.convert(
            state.postRows.postRows,
            state.appConfig,
            state.subredditQueue.subredditQueue,
            state.redditLists.subredditLists,
            this.lastPostRowWasSortOrderNew,
            this.subredditIndex,
            this.nsfwRedditListIndex,
            this.masterSubscribedSubredditList
          )
        )
      );

      try {
        let postsGotten: Array<Post> = [];
        let postsFromSubreddits: Array<Subreddit> = [];

        if (getPostsFromSubredditsState.postRows.length == 0) {
          while (postsGotten.length == 0) {
            const [posts, fromSubreddits] = await this.getPostsFromSubreddit(
              getPostsFromSubredditsState
            );
            if (postsGotten.length == 0) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
            postsGotten = posts;
            postsFromSubreddits = fromSubreddits;
          }
        } else {
          const [posts, fromSubreddits] = await this.getPostsFromSubreddit(
            getPostsFromSubredditsState
          );
          postsGotten = posts;
          postsFromSubreddits = fromSubreddits;
        }
        await WaitUtil.WaitUntilGetPostsIsNotPaused(
          () => store.getState().postRows.getPostRowsPaused
        );

        if (store.getState().postRows.postRows.length == 10) {
          getPostsFromSubredditsState.getPostsUpdatedValues.postRowRemoveAt =
            store.getState().postRows.postRows.length - 1;
        }

        this.addPostRow(
          postsGotten,
          postsFromSubreddits,
          getPostsFromSubredditsState
        );
      } catch (e) {
        store.dispatch(
          submitAppNotification({
            message: `Got exception while trying to get post. ${
              (e as DOMException).message
            }`,
          })
        );
        console.log("Caught exception while getPosts ", e);
      }
    } while (this.settingsChanged(getPostsFromSubredditsState));
    this.applyUpdatedStateValues(getPostsFromSubredditsState);
  }

  async getPostsFromSubreddit(
    getPostsFromSubredditsState: GetPostsFromSubredditState
  ): Promise<[Array<Post>, Array<Subreddit>]> {
    console.log("about to get post row");
    let posts: Post[];
    const fromSubreddits = new Array<Subreddit>();

    if (getPostsFromSubredditsState.subredditQueue.length != 0) {
      const subreddit = getPostsFromSubredditsState.subredditQueue[0];
      getPostsFromSubredditsState.getPostsUpdatedValues.subredditQueueRemoveAt = 0;
      fromSubreddits.push(subreddit);
      posts = await this.getPostsForSubreddit(
        [subreddit],
        getPostsFromSubredditsState
      );
      getPostsFromSubredditsState.getPostsUpdatedValues.mostRecentSubredditGotten =
        subreddit;
    } else if (
      !(
        UserFrontPagePostSortOrderOptionsEnum.NotSelected ===
        getPostsFromSubredditsState.userFrontPagePostSortOrderOption
      )
    ) {
      posts = await new RedditClient().getUserFrontPage(
        getPostsFromSubredditsState.userFrontPagePostSortOrderOption,
        getPostsFromSubredditsState.topTimeFrame,
        getPostsFromSubredditsState.redditApiItemLimit,
        this.masterSubscribedSubredditList,
        store.getState().redditLists.subredditLists
      );
    } else {
      const [postsArr, fromSubredditsArr] = await this.getPostsBasedOnSettings(
        getPostsFromSubredditsState
      );
      posts = postsArr;
      fromSubreddits.push(...fromSubredditsArr);
    }
    posts = this.filterPostContent(
      getPostsFromSubredditsState.contentFiltering,
      posts
    );
    if (posts.length > 0) {
      if (posts.length > MAX_POSTS_PER_ROW) {
        posts = posts.slice(0, MAX_POSTS_PER_ROW + 1);
      }
    }

    return [posts, fromSubreddits];
  }

  async getPostsBasedOnSettings(
    getPostsFromSubredditsState: GetPostsFromSubredditState
  ): Promise<[Array<Post>, Array<Subreddit>]> {
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

      const subredditFromRedditListDotCom =
        this.getRedditListDotComSubredditBasedOnSettings(
          subreddits,
          getPostsFromSubredditsState
        );
      if (subredditFromRedditListDotCom != undefined) {
        fromSubreddits = [subredditFromRedditListDotCom];
        sourceSubreddits = subreddits;
      }
    } else {
      const [subredditsToGetPostsFor, sourceSubredditArray] =
        this.getSubredditsToGetPostsFor(getPostsFromSubredditsState);
      fromSubreddits = subredditsToGetPostsFor;
      sourceSubreddits = sourceSubredditArray;
    }
    const posts = await this.getPostsForSubreddit(
      fromSubreddits,
      getPostsFromSubredditsState
    );

    getPostsFromSubredditsState.getPostsUpdatedValues.subredditsToShowInSideBar =
      sourceSubreddits;
    getPostsFromSubredditsState.getPostsUpdatedValues.mostRecentSubredditGotten =
      fromSubreddits.length == 1 ? fromSubreddits[0] : undefined;

    return [posts, fromSubreddits];
  }

  private getSubredditsToGetPostsFor(
    getPostsFromSubredditsState: GetPostsFromSubredditState
  ): [Array<Subreddit>, Array<Subreddit>] {
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
      console.log(
        "getSubredditsToGetPostsFor masterSubscribedSubredditList",
        masterSubscribedSubredditList
      );
      sourceSubredditArray.push(...masterSubscribedSubredditList);
      const randomIndex = Math.floor(
        Math.random() * masterSubscribedSubredditList.length
      );
      const subreddit = masterSubscribedSubredditList[randomIndex];
      subredditsToGetPostsFor.push(subreddit);

      getPostsFromSubredditsState.getPostsUpdatedValues.masterSubscribedSubredditList =
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
      getPostsFromSubredditsState.getPostsUpdatedValues.subredditIndex =
        updatedIndex;
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
      getPostsFromSubredditsState.getPostsUpdatedValues.subredditIndex =
        subredditFromListObj.updatedIndex;
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
      getPostsFromSubredditsState.getPostsUpdatedValues.subredditIndex =
        updatedIndex;

      if (subreddit != undefined) {
        subredditsToGetPostsFor.push(subreddit);
      }
    }

    return [subredditsToGetPostsFor, sourceSubredditArray];
  }

  private getRedditListDotComSubredditBasedOnSettings(
    subreddits: Array<Subreddit>,
    getPostsFromSubredditsState: GetPostsFromSubredditState
  ) {
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
          getPostsFromSubredditsState.getPostsUpdatedValues.nsfwRedditListIndex =
            indexToSelect + 1;
        } else if (
          sortOrderDirection == SortOrderDirectionOptionsEnum.Reversed
        ) {
          getPostsFromSubredditsState.getPostsUpdatedValues.nsfwRedditListIndex =
            indexToSelect - 1;
        }
      }
    }
    console.log(1, indexToSelect);

    if (indexToSelect != undefined) {
      return subreddits[indexToSelect];
    }
  }

  private async getPostsForSubreddit(
    subreddits: Array<Subreddit>,
    getPostsFromSubredditsState: GetPostsFromSubredditState
  ): Promise<Array<Post>> {
    console.log("getPostsForSubreddit", subreddits);
    const urlConverter = new GetPostsForSubredditUrlConverter();
    const [url, randomSourceString] = urlConverter.convert(
      subreddits,
      getPostsFromSubredditsState.concatRedditUrlMaxLength,
      getPostsFromSubredditsState.postSortOrder,
      getPostsFromSubredditsState.topTimeFrame,
      getPostsFromSubredditsState.redditApiItemLimit
    );
    console.log("about to get posts for subreddit uri ", url);
    let posts = await new RedditClient().getPostsForSubredditUri(
      url,
      this.masterSubscribedSubredditList,
      store.getState().redditLists.subredditLists
    );
    posts = posts.map<Post>((value) => {
      value.randomSourceString = randomSourceString;
      return value;
    });
    return posts;
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

  private addPostRow(
    posts: Array<Post>,
    fromSubreddits: Array<Subreddit>,
    getPostsFromSubredditsState: GetPostsFromSubredditState
  ) {
    const userFrontPageOption =
      getPostsFromSubredditsState.userFrontPagePostSortOrderOption;
    const postRows = getPostsFromSubredditsState.postRows;
    const lastPostRowWasSortOrderNew =
      getPostsFromSubredditsState.lastPostRowWasSortOrderNew;

    if (posts.length == 0) {
      let msg = `Got 0 posts. Trying again in a little bit.`;
      if (fromSubreddits.length == 1) {
        msg = `Got 0 posts from ${fromSubreddits[0].displayNamePrefixed}. Trying again in a little bit.`;
      }
      store.dispatch(submitAppNotification({ message: msg }));
      return;
    }

    if (UserFrontPagePostSortOrderOptionsEnum.New != userFrontPageOption) {
      getPostsFromSubredditsState.getPostsUpdatedValues.lastPostRowWasSortOrderNew =
        false;
      getPostsFromSubredditsState.getPostsUpdatedValues.createPostRowAndInsertAtBeginning =
        posts;
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
        getPostsFromSubredditsState.getPostsUpdatedValues.shiftPostsAndUiPosts =
          {
            postRowUuid: postRowUuid,
            posts: postsToAddToViewModel,
          };
      }
    } else {
      getPostsFromSubredditsState.getPostsUpdatedValues.createPostRowAndInsertAtBeginning =
        posts;
    }
    getPostsFromSubredditsState.getPostsUpdatedValues.lastPostRowWasSortOrderNew =
      true;
  }

  private settingsChanged(originalState: GetPostsFromSubredditState) {
    const state = store.getState();
    const appConfigState = state.appConfig;

    const subredditQueuesEqual = (
      queue1: Array<Subreddit>,
      queue2: Array<Subreddit>
    ) => {
      if (queue1.length != queue2.length) {
        return false;
      }

      for (const [index, subreddit] of queue1.entries()) {
        if (subreddit.subredditUuid != queue2[index].subredditUuid) {
          return false;
        }
      }
      return true;
    };
    const settingsMatch =
      originalState.subredditSortOrderOption ==
        appConfigState.subredditSortOrderOption &&
      originalState.userFrontPagePostSortOrderOption ==
        appConfigState.userFrontPagePostSortOrderOption &&
      originalState.contentFiltering == appConfigState.contentFiltering &&
      subredditQueuesEqual(
        originalState.subredditQueue,
        store.getState().subredditQueue.subredditQueue
      ) &&
      originalState.concatRedditUrlMaxLength ==
        appConfigState.concatRedditUrlMaxLength &&
      originalState.postSortOrder == appConfigState.postSortOrderOption &&
      originalState.topTimeFrame == appConfigState.topTimeFrameOption &&
      originalState.redditApiItemLimit == appConfigState.redditApiItemLimit &&
      originalState.selectSubredditIterationMethodOption ==
        appConfigState.selectSubredditIterationMethodOption &&
      originalState.sortOrderDirection ==
        appConfigState.sortOrderDirectionOption &&
      originalState.randomIterationSelectWeightOption ==
        appConfigState.randomIterationSelectWeightOption &&
      originalState.selectedSubredditListSortOption ==
        appConfigState.selectedSubredditListSortOption;

    //NOT USED
    // originalState.nsfwSubredditIndex;
    // originalState.masterSubredditList;
    // originalState.subredditIndex;
    // originalState.subredditLists;
    // originalState.lastPostRowWasSortOrderNew;

    if (!settingsMatch) {
      console.log(
        "current state settings changed. Looping to get another set of posts with updated settings"
      );
    }
    return !settingsMatch;
  }

  private applyUpdatedStateValues(
    getPostsFromSubredditState: GetPostsFromSubredditState
  ) {
    const updatedValues = getPostsFromSubredditState.getPostsUpdatedValues;

    if (updatedValues.subredditQueueRemoveAt != undefined) {
      store.dispatch(
        subredditQueueRemoveAt(updatedValues.subredditQueueRemoveAt)
      );
    }
    if (updatedValues.mostRecentSubredditGotten != undefined) {
      store.dispatch(
        setMostRecentSubredditGotten(updatedValues.mostRecentSubredditGotten)
      );
    }
    if (updatedValues.postRowRemoveAt != undefined) {
      store.dispatch(postRowRemoveAt(updatedValues.postRowRemoveAt));
    }
    if (updatedValues.subredditsToShowInSideBar != undefined) {
      store.dispatch(
        setSubredditsToShowInSideBar({
          subreddits: updatedValues.subredditsToShowInSideBar,
          subredditLists: store.getState().redditLists.subredditLists,
        })
      );
    }
    if (updatedValues.subredditIndex != undefined) {
      this.subredditIndex = updatedValues.subredditIndex;
    }
    if (updatedValues.nsfwRedditListIndex != undefined) {
      this.nsfwRedditListIndex = updatedValues.nsfwRedditListIndex;
    }
    if (updatedValues.lastPostRowWasSortOrderNew != undefined) {
      this.lastPostRowWasSortOrderNew =
        updatedValues.lastPostRowWasSortOrderNew;
    }
    if (updatedValues.createPostRowAndInsertAtBeginning != undefined) {
      const state = store.getState();
      const userFrontPagePostSortOrderOption =
        state.appConfig.userFrontPagePostSortOrderOption;
      const postsToShowInRow = state.appConfig.postsToShowInRow;

      store.dispatch(
        createPostRowAndInsertAtBeginning({
          posts: updatedValues.createPostRowAndInsertAtBeginning,
          userFrontPagePostSortOrderOption: userFrontPagePostSortOrderOption,
          postsToShowInRow: postsToShowInRow,
        })
      );
    }
    if (updatedValues.shiftPostsAndUiPosts != undefined) {
      store.dispatch(
        addPostsToFrontOfRow({
          postRowUuid: updatedValues.shiftPostsAndUiPosts.postRowUuid,
          posts: updatedValues.shiftPostsAndUiPosts.posts,
          postsToShowInRow: store.getState().appConfig.postsToShowInRow,
        })
      );
    }
  }

  private async loadSubscribedSubreddits(async: boolean = true) {
    let results = await new RedditClient().getSubscribedSubReddits(undefined);
    const asyncLoopForRemainingSubreddits = async () => {
      const remainingSubreddits = new Array<Subreddit>();

      while (results.after != undefined) {
        results = await new RedditClient().getSubscribedSubReddits(
          results.after
        );
        remainingSubreddits.push(...results.subreddits);
      }
      this.masterSubscribedSubredditList.push(...remainingSubreddits);
    };
    if (async) {
      asyncLoopForRemainingSubreddits();
    } else {
      await asyncLoopForRemainingSubreddits();
    }
  }

  async searchRedditForSubRedditAndUser(
    searchTerm: string
  ): Promise<Array<SubredditAccountSearchResult>> {
    const state = store.getState();
    let { users, subreddits } =
      await new RedditClient().callSearchRedditForSubRedditAndUser(searchTerm);

    if (state.appConfig.contentFiltering == ContentFilteringOptionEnum.SFW) {
      users = users.filter((result) => !result.over18);
      subreddits = subreddits.filter((result) => !result.over18);
    } else if (
      state.appConfig.contentFiltering == ContentFilteringOptionEnum.NSFW
    ) {
      users = users.filter((result) => result.over18);
      subreddits = subreddits.filter((result) => result.over18);
    }

    const sortByDisplayName = (aDisplayName: string, bDisplayName: string) => {
      const aLowerCase = aDisplayName.toLowerCase();
      const bLowerCase = bDisplayName.toLowerCase();
      if (aLowerCase > bLowerCase) {
        return 1;
      } else if (aLowerCase < bLowerCase) {
        return -1;
      }
      return 0;
    };

    users.sort((a, b) => sortByDisplayName(a.displayName, b.displayName));
    subreddits.sort((a, b) => sortByDisplayName(a.displayName, b.displayName));

    users.map((result) => (result.searchResultUuid = uuidV4()));
    subreddits.map((result) => (result.searchResultUuid = uuidV4()));
    return [...users, ...subreddits];
  }

  async unsubscribe(name: string) {
    await new RedditClient().callUnsubscribe(name);
    await this.loadSubscribedSubreddits(false);
  }

  async subscribe(name: string) {
    await new RedditClient().callSubscribe(name);
    await this.loadSubscribedSubreddits(false);
  }
}
