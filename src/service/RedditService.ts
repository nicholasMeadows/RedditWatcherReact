import { v4 as uuidV4 } from "uuid";
import { MAX_POSTS_PER_ROW } from "../RedditWatcherConstants";
import {
  callSearchRedditForSubRedditAndUser,
  callSubscribe,
  callUnsubscribe,
  getPostsForSubredditUri,
  getSubscribedSubReddits,
  getUserFrontPage,
} from "../client/RedditClient";
import { Post } from "../model/Post/Post";
import { Subreddit } from "../model/Subreddit/Subreddit";
import { SubredditAccountSearchResult } from "../model/SubredditAccountSearchResult";
import ContentFilteringOptionEnum from "../model/config/enums/ContentFilteringOptionEnum";
import SelectSubredditIterationMethodOptionsEnum from "../model/config/enums/SelectSubredditIterationMethodOptionsEnum";
import SortOrderDirectionOptionsEnum from "../model/config/enums/SortOrderDirectionOptionsEnum";
import SubredditSortOrderOptionsEnum from "../model/config/enums/SubredditSortOrderOptionsEnum";
import UserFrontPagePostSortOrderOptionsEnum from "../model/config/enums/UserFrontPagePostSortOrderOptionsEnum";
import { submitAppNotification } from "../redux/slice/AppNotificationSlice";
import {
  createPostRowAndInsertAtBegining,
  createPostRowAndPushToRows,
  postRowRemoveAt,
  setPostRowScrollToIndex,
  shiftPostRowPosts,
} from "../redux/slice/PostRowsSlice";
import {
  addSubredditsToSubscribedList,
  setLastPostRowWasSortOrderNew,
  setLoopingForPosts,
  setLoopingForPostsTimeout,
  setMasterSubscribedSubredditList,
  setNsfwRedditListIndex,
  setSubredditIndex,
  subredditQueueRemoveAt,
} from "../redux/slice/RedditClientSlice";
import {
  setMostRecentSubredditGotten,
  setSubredditsToShowInSideBar,
} from "../redux/slice/SideBarSlice";
import store from "../redux/store";
import {
  concatSelectedSubredditLists,
  filterSubredditsListByUsersOnly,
  getSubredditFromList,
  sortPostsByCreate,
  sortSelectedSubreddits,
  sortSubredditListAlphabetically,
  sortSubredditsBySubscribers,
} from "../util/RedditServiceUtil";
import { getSubredditsFromRedditListDotCom } from "./RedditListDotComClient.ts";
import { RedditListDotComConverter } from "../model/converter/RedditListDotComConverter.ts";
import { WaitUtil } from "../util/WaitUtil.ts";
import { GetPostsForSubredditUrlConverter } from "../model/converter/GetPostsForSubredditUrlConverter.ts";
import {
  GetPostsFromSubredditState,
  GetPostsFromSubredditStateConverter,
} from "../model/converter/GetPostsFromSubredditStateConverter.ts";

export async function startLoopingForPosts() {
  console.log("starting to loop for posts");
  store.dispatch(setLoopingForPosts(true));
  await loadSubscribedSubreddits();

  const getPostsFunction = async () => {
    try {
      return await getPostsOrchestrationStart();
    } catch (e) {
      store.dispatch(
        submitAppNotification({
          message: `Got exception while trying to get post. ${e}`,
        })
      );
      console.log("Caught exception while getPosts ", e);
    }
  };
  getPostsFunction();

  const startWaitingToGetPosts = () => {
    const timeout = setTimeout(async () => {
      await getPostsFunction();
      startWaitingToGetPosts();
    }, 10000);
    store.dispatch(setLoopingForPostsTimeout(timeout));
  };
  startWaitingToGetPosts();
}

async function getPostsOrchestrationStart() {
  const state = store.getState();
  const stateConverter = new GetPostsFromSubredditStateConverter();

  const getPostsFromSubredditsState = stateConverter.convert(
    state.postRows,
    state.appConfig,
    state.redditClient,
    state.subredditLists
  );

  let postsGotten: Array<Post> = [];
  let postsFromSubreddits: Array<Subreddit> = [];

  if (getPostsFromSubredditsState.postRows.length == 0) {
    while (postsGotten.length == 0) {
      const [posts, fromSubreddits] = await getPostsFromSubreddit(
        getPostsFromSubredditsState
      );
      if (postsGotten.length == 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      postsGotten = posts;
      postsFromSubreddits = fromSubreddits;
    }
  } else {
    const [posts, fromSubreddits] = await getPostsFromSubreddit(
      getPostsFromSubredditsState
    );
    postsGotten = posts;
    postsFromSubreddits = fromSubreddits;
  }

  await WaitUtil.WaitUntilPostRowScrollY0(
    () => store.getState().postRows.scrollY
  );
  await WaitUtil.WaitUntilPostRowComponentIsVisible(
    () => store.getState().postRows.postRows.length
  );
  await WaitUtil.WaitUntilPointerNotOverPostRow(
    () => store.getState().postRows.mouseOverPostRowUuid
  );

  if (state.postRows.postRows.length == 10) {
    store.dispatch(postRowRemoveAt(state.postRows.postRows.length - 1));
  }
  addPostRow(postsGotten, postsFromSubreddits, getPostsFromSubredditsState);
}

export async function getPostsFromSubreddit(
  getPostsFromSubredditsState: GetPostsFromSubredditState
): Promise<[Array<Post>, Array<Subreddit>]> {
  console.log("about to get post row");
  let posts: Post[];
  const fromSubreddits = new Array<Subreddit>();

  if (getPostsFromSubredditsState.subredditQueue.length != 0) {
    const subreddit = getPostsFromSubredditsState.subredditQueue[0];
    store.dispatch(subredditQueueRemoveAt(0));
    fromSubreddits.push(subreddit);
    posts = await getPostsForSubreddit(
      [subreddit],
      getPostsFromSubredditsState
    );
    store.dispatch(setMostRecentSubredditGotten(subreddit));
  } else if (
    !(
      UserFrontPagePostSortOrderOptionsEnum.NotSelected ===
      getPostsFromSubredditsState.userFrontPagePostSortOrderOption
    )
  ) {
    posts = await getUserFrontPage(getPostsFromSubredditsState);
  } else {
    const [postsArr, fromSubredditsArr] = await getPostsBasedOnSettings(
      getPostsFromSubredditsState
    );
    posts = postsArr;
    fromSubreddits.push(...fromSubredditsArr);
  }
  posts = filterPostContent(
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

async function getPostsBasedOnSettings(
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
        subreddits = converter.convertToReddListDotComRecentActivity(htmlArray);
        break;
      case SubredditSortOrderOptionsEnum.RedditListDotComSubscribers:
        subreddits = converter.convertToReddListDotComSubscribers(htmlArray);
        break;
      case SubredditSortOrderOptionsEnum.RedditListDotCom24HourGrowth:
        subreddits = converter.convertToReddListDotCom24HourGrowth(htmlArray);
        break;
    }

    const subredditFromRedditListDotCom =
      getRedditListDotComSubredditBasedOnSettings(
        subreddits,
        getPostsFromSubredditsState
      );
    if (subredditFromRedditListDotCom != undefined) {
      fromSubreddits = [subredditFromRedditListDotCom];
      sourceSubreddits = subreddits;
    }
  } else {
    const [subredditsToGetPostsFor, sourceSubredditArray] =
      getSubredditsToGetPostsFor(getPostsFromSubredditsState);
    fromSubreddits = subredditsToGetPostsFor;
    sourceSubreddits = sourceSubredditArray;
  }
  const posts = await getPostsForSubreddit(
    fromSubreddits,
    getPostsFromSubredditsState
  );

  store.dispatch(setSubredditsToShowInSideBar(sourceSubreddits));
  store.dispatch(
    setMostRecentSubredditGotten(
      fromSubreddits.length == 1 ? fromSubreddits[0] : undefined
    )
  );

  return [posts, fromSubreddits];
}

function getSubredditsToGetPostsFor(
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
    sourceSubredditArray.push(...masterSubscribedSubredditList);
    const randomIndex = Math.floor(
      Math.random() * masterSubscribedSubredditList.length
    );
    const subreddit = masterSubscribedSubredditList[randomIndex];
    subredditsToGetPostsFor.push(subreddit);

    store.dispatch(
      setMasterSubscribedSubredditList(masterSubscribedSubredditList)
    );
  } else if (
    SubredditSortOrderOptionsEnum.SubCount === subredditSortOrderOption
  ) {
    //Sort subscribed reddits by subscribers. Get random or next in iteration based on iteration method
    const sortedSubreddits = sortSubredditsBySubscribers(
      masterSubscribedSubredditList
    );
    sourceSubredditArray.push(...sortedSubreddits);
    const { subreddit, updatedIndex } = getSubredditFromList(
      subredditIndex,
      sortedSubreddits
    );
    store.dispatch(setSubredditIndex(updatedIndex));
    if (subreddit != undefined) {
      subredditsToGetPostsFor.push(subreddit);
    }
  } else if (
    SubredditSortOrderOptionsEnum.RedditUsersOnly === subredditSortOrderOption
  ) {
    //Sort subscribed reddits by users only. Get random or next in iteration based on iteration method
    const userSubreddits = filterSubredditsListByUsersOnly(
      masterSubscribedSubredditList
    );
    sourceSubredditArray.push(...userSubreddits);
    const { subreddit } = getSubredditFromList(subredditIndex, userSubreddits);
    if (subreddit != undefined) {
      subredditsToGetPostsFor.push(subreddit);
    }
  } else if (
    SubredditSortOrderOptionsEnum.Alphabetically === subredditSortOrderOption
  ) {
    //Sort subscribed reddits alphabetically. User sort direction. Get random or next in iteration based on iteration method
    const sortedSubreddits = sortSubredditListAlphabetically(
      masterSubscribedSubredditList
    );
    sourceSubredditArray.push(...sortedSubreddits);
    const { subreddit } = getSubredditFromList(
      subredditIndex,
      sortedSubreddits
    );
    if (subreddit != undefined) {
      subredditsToGetPostsFor.push(subreddit);
    }
  } else if (
    SubredditSortOrderOptionsEnum.SelectedSubRedditLists ===
    subredditSortOrderOption
  ) {
    //Concat all selected subreddit lists. Get single subreddit based off iteration method. Sort based of SelectedSubredditListSortOptionEnum

    const subreddits = sortSelectedSubreddits();
    sourceSubredditArray.push(...subreddits);
    const subredditFromListObj = getSubredditFromList(
      subredditIndex,
      subreddits
    );
    store.dispatch(setSubredditIndex(subredditFromListObj.updatedIndex));
    if (subredditFromListObj.subreddit != undefined) {
      subredditsToGetPostsFor.push(subredditFromListObj.subreddit);
    }
  } else if (
    SubredditSortOrderOptionsEnum.SelectedSubRedditListsAllRedditsPerRequest ===
    subredditSortOrderOption
  ) {
    //Concat selected subreddit lists. Get multiple reddits. Sort based of SelectedSubredditListSortOptionEnum
    const subreddits = sortSelectedSubreddits();
    sourceSubredditArray.push(...subreddits);
    subredditsToGetPostsFor.push(...subreddits);
  } else if (
    SubredditSortOrderOptionsEnum.AllSubRedditLists == subredditSortOrderOption
  ) {
    //Concat all selected subreddit lists. Get single reddit based off iteration method. Sort based of SelectedSubredditListSortOptionEnum
    const subreddits = concatSelectedSubredditLists(subredditLists);
    sourceSubredditArray.push(...subreddits);

    const { subreddit, updatedIndex } = getSubredditFromList(
      subredditIndex,
      subreddits
    );
    store.dispatch(setSubredditIndex(updatedIndex));

    if (subreddit != undefined) {
      subredditsToGetPostsFor.push(subreddit);
    }
  }

  return [subredditsToGetPostsFor, sourceSubredditArray];
}

function getRedditListDotComSubredditBasedOnSettings(
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
      } else if (sortOrderDirection == SortOrderDirectionOptionsEnum.Reversed) {
        indexToSelect = subreddits.length - 1;
      }
    }

    if (indexToSelect != undefined) {
      if (sortOrderDirection == SortOrderDirectionOptionsEnum.Normal) {
        store.dispatch(setNsfwRedditListIndex(indexToSelect + 1));
      } else if (sortOrderDirection == SortOrderDirectionOptionsEnum.Reversed) {
        store.dispatch(setNsfwRedditListIndex(indexToSelect - 1));
      }
    }
  }
  console.log(1, indexToSelect);

  if (indexToSelect != undefined) {
    return subreddits[indexToSelect];
  }
}

async function getPostsForSubreddit(
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
  let posts = await getPostsForSubredditUri(url);
  posts = posts.map<Post>((value) => {
    value.randomSourceString = randomSourceString;
    return value;
  });
  return posts;
}

function filterPostContent(
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

function addPostRow(
  posts: Array<Post>,
  fromSubreddits: Array<Subreddit>,
  getPostsFromSubredditsState: GetPostsFromSubredditState
) {
  const userFrontPageOption =
    getPostsFromSubredditsState.userFrontPagePostSortOrderOption;
  const postRows = getPostsFromSubredditsState.postRows;
  const lastPostRowWasSortOrderNew =
    getPostsFromSubredditsState.lastPostRowWasSortOrderNew;
  // ShowHidLoadingSpinner(false);

  if (posts.length == 0) {
    let msg = `Got 0 posts. Trying again in a little bit.`;
    if (fromSubreddits.length == 1) {
      msg = `Got 0 posts from ${fromSubreddits[0].displayNamePrefixed}. Trying again in a little bit.`;
    }
    store.dispatch(submitAppNotification({ message: msg }));
    return;
  }

  if (UserFrontPagePostSortOrderOptionsEnum.New != userFrontPageOption) {
    store.dispatch(setLastPostRowWasSortOrderNew(false));
    store.dispatch(createPostRowAndInsertAtBegining(posts));
    return;
  }

  posts = sortPostsByCreate(posts);
  if (postRows.length == 0) {
    store.dispatch(createPostRowAndPushToRows(posts));
  } else {
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
        postsToAddToViewModel.reverse();

        for (const post of postsToAddToViewModel) {
          const postRowUuid = postRows[0].postRowUuid;
          const shiftPostRowPayload = {
            postRowUuid: postRowUuid,
            postToInsert: post,
            postToRemoveAt: postsAlreadyInViewModel.length - 1,
          };
          store.dispatch(shiftPostRowPosts(shiftPostRowPayload));
          store.dispatch(
            setPostRowScrollToIndex({
              postRowUuid: postRowUuid,
              scrollToIndex: 0,
            })
          );
        }
      }
    } else {
      store.dispatch(createPostRowAndPushToRows(posts));
    }
  }
  store.dispatch(setLastPostRowWasSortOrderNew(true));
}

async function loadSubscribedSubreddits(async: boolean = true) {
  let results = await getSubscribedSubReddits(undefined);
  store.dispatch(setMasterSubscribedSubredditList(results.subreddits));
  const asyncLoopForRemainingSubreddits = async () => {
    const remainingSubreddits = new Array<Subreddit>();

    while (results.after != undefined) {
      results = await getSubscribedSubReddits(results.after);
      remainingSubreddits.push(...results.subreddits);
    }
    store.dispatch(addSubredditsToSubscribedList(remainingSubreddits));
  };
  if (async) {
    asyncLoopForRemainingSubreddits();
  } else {
    await asyncLoopForRemainingSubreddits();
  }
}

export async function searchRedditForSubRedditAndUser(
  searchTerm: string
): Promise<Array<SubredditAccountSearchResult>> {
  const state = store.getState();
  let { users, subreddits } = await callSearchRedditForSubRedditAndUser(
    searchTerm
  );

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

export async function unsubscribe(name: string) {
  await callUnsubscribe(name);
  refreshSubreddits();
}

export async function subscribe(name: string) {
  await callSubscribe(name);
  refreshSubreddits();
}

async function refreshSubreddits() {
  await loadSubscribedSubreddits(false);
}
