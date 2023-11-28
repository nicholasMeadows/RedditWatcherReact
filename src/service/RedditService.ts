import { MAX_POSTS_PER_ROW, POST_ROW_ROUTE } from "../RedditWatcherConstants";
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
import ContentFilteringOptionEnum from "../model/config/enums/ContentFilteringOptionEnum";
import PostSortOrderOptionsEnum from "../model/config/enums/PostSortOrderOptionsEnum";
import SubredditSortOrderOptionsEnum from "../model/config/enums/SubredditSortOrderOptionsEnum";
import TopTimeFrameOptionsEnum from "../model/config/enums/TopTimeFrameOptionsEnum";
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
  setMostRecentSubredditGotten,
  setSubredditIndex,
  setSubredditsToShowInSideBar,
  subredditQueueRemoveAt,
} from "../redux/slice/RedditClientSlice";
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
import { v4 as uuidV4 } from "uuid";

export async function startLoopingForPosts() {
  store.dispatch(setLoopingForPosts(true));
  await loadSubscribedSubreddits();

  const getPostsFunction = async () => {
    try {
      return await getPosts();
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

async function getPosts() {
  const state = store.getState();

  // try {
  let postsAndFromSubreddits: {
    posts: Array<Post>;
    fromSubreddits: Array<Subreddit>;
  } = {
    posts: [],
    fromSubreddits: [],
  };

  if (state.postRows.postRows.length == 0) {
    while (postsAndFromSubreddits.posts.length == 0) {
      postsAndFromSubreddits = await getPostRow();
      if (postsAndFromSubreddits.posts.length == 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  } else {
    postsAndFromSubreddits = await getPostRow();
  }

  await WaitUntilPostRowScrollY0();
  await WaitUntilPostRowComponentIsVisible();

  // if (_pointerOverPostRow) {
  await WaitUntilPointerNotOverPostRow();
  // }

  // if (_startStopButtonPressed) {
  //     await WaitUntilStartStopButtonIsNotPressed();
  // }

  if (state.postRows.postRows.length == 10) {
    store.dispatch(postRowRemoveAt(state.postRows.postRows.length - 1));
  }

  addPostRow(postsAndFromSubreddits);

  // View.ScrollToTopPostRow();
  // }
  // catch (RedditUserNotLoggedInException ex)
  // {
  //     _appNotificationService.SubmitAppNotification(new ()
  //     {
  //             Message = "Failed to get posts. Waiting a few seconds before trying again. Error message " + ex.Message,
  //             TimeToDisplayInMilliSeconds = 10000
  //         });
  // }
  // catch (System.Exception ex)
  // {
  //     _appNotificationService.SubmitAppNotification(new ()
  //     {
  //             Message = "Got exception while trying to get posts. " + ex.Message,
  //             TimeToDisplayInMilliSeconds = 10000
  //         });
  // }
  // PostRowRefreshCounter.CurrentSeconds = 10;
  // _getPostsTimer.Start();
}

function addPostRow(postRowFromSubreddit: {
  posts: Array<Post>;
  fromSubreddits: Array<Subreddit>;
}) {
  let posts = postRowFromSubreddit.posts;
  const fromSubreddits = postRowFromSubreddit.fromSubreddits;
  // ShowHidLoadingSpinner(false);
  if (posts.length > 0) {
    const state = store.getState();
    const userFrontPageOption =
      state.appConfig.userFrontPagePostSortOrderOption;

    if (
      UserFrontPagePostSortOrderOptionsEnum.NotSelected !=
        userFrontPageOption &&
      UserFrontPagePostSortOrderOptionsEnum.New == userFrontPageOption
    ) {
      posts = sortPostsByCreate(posts);
      if (state.postRows.postRows.length == 0) {
        store.dispatch(createPostRowAndPushToRows(posts));
      } else {
        if (state.redditClient.lastPostRowWasSortOrderNew) {
          const postsAlreadyInViewModel = state.postRows.postRows[0].posts;
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
              const postRowUuid = state.postRows.postRows[0].postRowUuid;
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
    } else {
      store.dispatch(setLastPostRowWasSortOrderNew(false));
      store.dispatch(createPostRowAndInsertAtBegining(posts));
    }
  } else {
    let msg = `Got 0 posts. Trying again in a little bit.`;
    if (fromSubreddits.length == 1) {
      msg = `Got 0 posts from ${fromSubreddits[0].displayNamePrefixed}. Trying again in a little bit.`;
    }
    store.dispatch(submitAppNotification({ message: msg }));
  }
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

export async function getPostRow(): Promise<{
  posts: Array<Post>;
  fromSubreddits: Array<Subreddit>;
}> {
  const state = store.getState();
  const userFrontPageOption = state.appConfig.userFrontPagePostSortOrderOption;
  //   const topTimeFrameOption = state.appConfig.topTimeFrameOption;
  const contentFiltering = state.appConfig.contentFiltering;

  let subredditsToShowInSideBar: Array<Subreddit> | undefined = undefined;
  const mostRecentSubredditGotten: Subreddit | undefined = undefined;
  let posts = new Array<Post>();
  const fromSubreddits = new Array<Subreddit>();

  if (state.redditClient.subredditQueue.length != 0) {
    const subreddit = state.redditClient.subredditQueue[0];
    fromSubreddits.push(subreddit);
    posts = await getPostsForSubreddit([subreddit]);
    store.dispatch(subredditQueueRemoveAt(0));
  } else if (
    !(UserFrontPagePostSortOrderOptionsEnum.NotSelected === userFrontPageOption)
  ) {
    posts = await getUserFrontPage();
    subredditsToShowInSideBar =
      state.redditClient.masterSubscribedSubredditList;
  } else {
    const subredditsToGetPostsFor = getSubredditsToGetPostsFor();
    fromSubreddits.push(...subredditsToGetPostsFor);
    posts = await getPostsForSubreddit(subredditsToGetPostsFor);
  }

  if (ContentFilteringOptionEnum.SFW === contentFiltering) {
    posts = posts.filter((post) => !post.over18);
  }

  if (ContentFilteringOptionEnum.NSFW === contentFiltering) {
    posts = posts.filter((post) => post.over18);
  }

  if (posts.length > 0) {
    if (posts.length > MAX_POSTS_PER_ROW) {
      posts = posts.slice(0, MAX_POSTS_PER_ROW + 1);
    }
    store.dispatch(setSubredditsToShowInSideBar(subredditsToShowInSideBar));
    store.dispatch(setMostRecentSubredditGotten(mostRecentSubredditGotten));
  }

  return { posts: posts, fromSubreddits: fromSubreddits };
}

function getSubredditsToGetPostsFor(): Array<Subreddit> {
  const state = store.getState();

  const subredditSortOrderOption = state.appConfig.subredditSortOrderOption;
  //   const selectedSubredditListSortOption =
  //     state.appConfig.selectedSubredditListSortOption;
  //   const selectSubredditIterationMethodOption =
  //     state.appConfig.selectSubredditIterationMethodOption;
  //   const sortOrderDirectionOption = state.appConfig.sortOrderDirectionOption;
  //   const postSortOrderOption = state.appConfig.postSortOrderOption;

  const subredditsToGetPostsFor = new Array<Subreddit>();

  if (SubredditSortOrderOptionsEnum.Random === subredditSortOrderOption) {
    //Get a random subreddit from subscribed reddits. Ignore iteration method

    const randomIndex = Math.floor(
      Math.random() * state.redditClient.masterSubscribedSubredditList.length
    );
    const subreddit =
      state.redditClient.masterSubscribedSubredditList[randomIndex];
    subredditsToGetPostsFor.push(subreddit);

    store.dispatch(
      setMasterSubscribedSubredditList(
        state.redditClient.masterSubscribedSubredditList
      )
    );
    store.dispatch(setMostRecentSubredditGotten(subreddit));
  } else if (
    SubredditSortOrderOptionsEnum.SubCount === subredditSortOrderOption
  ) {
    //Sort subscribed reddits by subscribers. Get random or next in iteration based on iteration method
    const sortedSubreddits = sortSubredditsBySubscribers(
      state.redditClient.masterSubscribedSubredditList
    );
    const { subreddit, updatedIndex } = getSubredditFromList(
      state.redditClient.subredditIndex,
      sortedSubreddits
    );
    store.dispatch(setSubredditIndex(updatedIndex));
    if (subreddit != undefined) {
      subredditsToGetPostsFor.push(subreddit);
    }

    store.dispatch(setSubredditsToShowInSideBar(sortedSubreddits));
    store.dispatch(setMostRecentSubredditGotten(subreddit));
  } else if (
    SubredditSortOrderOptionsEnum.RedditUsersOnly === subredditSortOrderOption
  ) {
    //Sort subscribed reddits by users only. Get random or next in iteration based on iteration method
    const userSubreddits = filterSubredditsListByUsersOnly(
      state.redditClient.masterSubscribedSubredditList
    );
    const { subreddit } = getSubredditFromList(
      state.redditClient.subredditIndex,
      userSubreddits
    );
    if (subreddit != undefined) {
      subredditsToGetPostsFor.push(subreddit);
    }
    store.dispatch(setSubredditsToShowInSideBar(userSubreddits));
    store.dispatch(setMostRecentSubredditGotten(subreddit));
  } else if (
    SubredditSortOrderOptionsEnum.Alphabetically === subredditSortOrderOption
  ) {
    //Sort subscribed reddits alphabetically. User sort direction. Get random or next in iteration based on iteration method
    const sortedSubreddits = sortSubredditListAlphabetically(
      state.redditClient.masterSubscribedSubredditList
    );
    const { subreddit } = getSubredditFromList(
      state.redditClient.subredditIndex,
      sortedSubreddits
    );
    if (subreddit != undefined) {
      subredditsToGetPostsFor.push(subreddit);
    }
    store.dispatch(setSubredditsToShowInSideBar(sortedSubreddits));
    store.dispatch(setMostRecentSubredditGotten(subreddit));
  } else if (
    SubredditSortOrderOptionsEnum.SelectedSubRedditLists ===
    subredditSortOrderOption
  ) {
    //Concat all selected subreddit lists. Get single subreddit based off iteration method. Sort based of SelectedSubredditListSortOptionEnum

    const subreddits = sortSelectedSubreddits();
    store.dispatch(setSubredditsToShowInSideBar(subreddits));
    const subredditFromListObj = getSubredditFromList(
      store.getState().redditClient.subredditIndex,
      subreddits
    );
    store.dispatch(setSubredditIndex(subredditFromListObj.updatedIndex));
    if (subredditFromListObj.subreddit != undefined) {
      store.dispatch(
        setMostRecentSubredditGotten(subredditFromListObj.subreddit)
      );
      subredditsToGetPostsFor.push(subredditFromListObj.subreddit);
    }
  } else if (
    SubredditSortOrderOptionsEnum.SelectedSubRedditListsAllRedditsPerRequest ===
    subredditSortOrderOption
  ) {
    //Concat selected subreddit lists. Get multiple reddits. Sort based of SelectedSubredditListSortOptionEnum
    const subreddits = sortSelectedSubreddits();
    store.dispatch(setSubredditsToShowInSideBar(subreddits));
    store.dispatch(setMostRecentSubredditGotten(undefined));
    subredditsToGetPostsFor.push(...subreddits);
  } else if (
    SubredditSortOrderOptionsEnum.AllSubRedditLists == subredditSortOrderOption
  ) {
    //Concat all selected subreddit lists. Get single reddit based off iteration method. Sort based of SelectedSubredditListSortOptionEnum
    const subreddits = concatSelectedSubredditLists(
      store.getState().subredditLists.subredditLists
    );
    const { subreddit, updatedIndex } = getSubredditFromList(
      store.getState().redditClient.subredditIndex,
      subreddits
    );
    store.dispatch(setSubredditIndex(updatedIndex));

    if (subreddit != undefined) {
      subredditsToGetPostsFor.push(subreddit);
    }
    store.dispatch(setSubredditsToShowInSideBar(subreddits));
    store.dispatch(setMostRecentSubredditGotten(subreddit));
  }

  return subredditsToGetPostsFor;
}
async function getPostsForSubreddit(
  subreddits: Array<Subreddit>
): Promise<Array<Post>> {
  const state = store.getState();
  const urlMaxLength = state.appConfig.concatRedditUrlMaxLength;

  let isUser = false;
  if (subreddits.length == 1) {
    isUser = subreddits[0].displayName.startsWith("u_");
  }

  const { urlSuffix, randomSourceString } = createUrlSuffix(isUser);
  let url = "/r/";
  const subredditNamesAlreadyAdded = new Array<string>();

  for (const subreddit of subreddits) {
    const displayName = subreddit.displayName;
    if (!subredditNamesAlreadyAdded.includes(displayName)) {
      if ((url + displayName + urlSuffix).length >= urlMaxLength) {
        break;
      }
      url += displayName + "+";
      subredditNamesAlreadyAdded.push(displayName);
    }
  }

  if (url.endsWith("+")) {
    url = url.substring(0, url.length - 1);
  }
  url += urlSuffix;
  console.log("about to get posts for subreddit uri ", url);
  let posts = await getPostsForSubredditUri(url);
  posts = posts.map<Post>((value) => {
    value.randomSourceString = randomSourceString;
    return value;
  });
  return posts;
}

export async function searchRedditForSubRedditAndUser(searchTerm: string) {
  const state = store.getState();
  let results = await callSearchRedditForSubRedditAndUser(searchTerm);

  if (state.appConfig.contentFiltering == ContentFilteringOptionEnum.SFW) {
    results = results.filter((result) => !result.over18);
  } else if (
    state.appConfig.contentFiltering == ContentFilteringOptionEnum.NSFW
  ) {
    results = results.filter((result) => result.over18);
  }
  results.map((result) => (result.searchResultUuid = uuidV4()));
  return results;
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
  store.dispatch(setMostRecentSubredditGotten(undefined));
  getSubredditsToGetPostsFor();
  store.dispatch(setSubredditsToShowInSideBar(undefined));
}

// private List < string > GetPostsFromRedditlistDotCom(int listIndex, int pageNumber)
// {
//     List < string > subreddits = new (0);
//     string url = "https://redditlist.com/nsfw";
//     url += pageNumber == 0 ? "" : pageNumber + 1;
//     url += ".html";
//     HtmlWeb htmlWebClient = new HtmlWeb();
//     HtmlDocument document = htmlWebClient.Load(url);
//     HtmlNode listParent = document.GetElementbyId("listing-parent");
//     List < HtmlNode > listDivs = listParent.ChildNodes.Where(node => node.Name.Equals("div")).ToList();
//     HtmlNode list = listDivs.ElementAt(listIndex);
//     List < HtmlNode > items = list.ChildNodes.Where(node => node.GetClasses().Contains("listing-item")).ToList();
//     foreach(HtmlNode item in items)
//     {
//         HtmlNode subredditAnchorSpanTag = item.ChildNodes.Where(i => i.GetClasses().Contains("subreddit-url")).ToList()[0];
//         HtmlNode anchor = subredditAnchorSpanTag.ChildNodes.Where(node => node.Name.Equals("a")).ElementAt(0);

//         string subredditName = anchor.InnerHtml;
//         subreddits.Add(subredditName);
//     }
//     return subreddits;
// }

function createUrlSuffix(isUser: boolean): {
  urlSuffix: string;
  randomSourceString: string;
} {
  const state = store.getState();
  const postSortOrder = state.appConfig.postSortOrderOption;
  const topTimeFrame = state.appConfig.topTimeFrameOption;

  const redditApiItemLimit = state.appConfig.redditApiItemLimit;
  let randomSourceString = "";
  let url = "";

  const randomUrl = () => {
    let random = Math.floor(Math.random() * 3);
    switch (random) {
      case 0:
        {
          randomSourceString = "Top";
          url = isUser ? "?sort=top&t=" : "/top?t=";
          random = Math.floor(Math.random() * 7);
          switch (random) {
            case 0:
              {
                randomSourceString += ", All";
                url += TopTimeFrameOptionsEnum.All;
              }
              break;
            case 1:
              {
                randomSourceString += ", Day";
                url += TopTimeFrameOptionsEnum.Day;
              }
              break;
            case 2:
              {
                randomSourceString += ", Hour";
                url += TopTimeFrameOptionsEnum.Hour;
              }
              break;
            case 3:
              {
                randomSourceString += ", Month";
                url += TopTimeFrameOptionsEnum.Month;
              }
              break;
            case 4:
              {
                randomSourceString += ", Week";
                url += TopTimeFrameOptionsEnum.Week;
              }
              break;
            case 5:
              {
                randomSourceString += ", Year";
                url += TopTimeFrameOptionsEnum.Year;
              }
              break;
          }
          url += `&limit=${redditApiItemLimit}`;
        }
        break;
      case 1:
        {
          randomSourceString = "New";
          newUrl();
        }

        break;
      case 2:
        {
          randomSourceString = "Hot";
          hotUrl();
        }
        break;
    }
  };

  const topUrl = () => {
    url = isUser ? "?sort=top&t=" : "/top?t=";
    switch (topTimeFrame) {
      case TopTimeFrameOptionsEnum.All:
        url += "all";
        break;
      case TopTimeFrameOptionsEnum.Day:
        url += "day";
        break;
      case TopTimeFrameOptionsEnum.Hour:
        url += "hour";
        break;
      case TopTimeFrameOptionsEnum.Month:
        url += "month";
        break;
      case TopTimeFrameOptionsEnum.Week:
        url += "week";
        break;
      case TopTimeFrameOptionsEnum.Year:
        url += "year";
        break;
    }
    url += `&limit=${redditApiItemLimit}`;
  };

  const newUrl = () => {
    url = isUser
      ? `/?sort=new&limit=${redditApiItemLimit}`
      : `/new?limit=${redditApiItemLimit}`;
  };

  const hotUrl = () => {
    url = isUser
      ? `/?sort=hot&limit=${redditApiItemLimit}`
      : `/hot?limit=${redditApiItemLimit}`;
  };

  switch (postSortOrder) {
    case PostSortOrderOptionsEnum.Random:
      randomUrl();
      break;
    case PostSortOrderOptionsEnum.Top:
      topUrl();
      break;
    case PostSortOrderOptionsEnum.New:
      newUrl();
      break;
    case PostSortOrderOptionsEnum.Hot:
      hotUrl();
      break;
  }

  return { urlSuffix: url, randomSourceString: randomSourceString };
}

async function WaitUntilPostRowScrollY0() {
  while (store.getState().postRows.scrollY != 0) {
    await new Promise<void>((res) => setTimeout(() => res(), 100));
  }
  return;
}

async function WaitUntilPostRowComponentIsVisible() {
  if (store.getState().postRows.postRows.length == 0) {
    return;
  }

  while (!window.location.href.endsWith(POST_ROW_ROUTE)) {
    await new Promise<void>((res) => setTimeout(() => res(), 100));
  }
  return;
}

async function WaitUntilPointerNotOverPostRow() {
  while (store.getState().postRows.mouseOverPostRowUuid != undefined) {
    await new Promise<void>((res) => setTimeout(() => res(), 100));
  }
  return;
}
