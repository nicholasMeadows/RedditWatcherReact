import { CapacitorHttp } from "@capacitor/core";
import { v4 as uuidV4 } from "uuid";
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
import SelectSubredditIterationMethodOptionsEnum from "../model/config/enums/SelectSubredditIterationMethodOptionsEnum";
import SortOrderDirectionOptionsEnum from "../model/config/enums/SortOrderDirectionOptionsEnum";
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

export async function startLoopingForPosts() {
  console.log("starting to loop for posts");
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
  console.log("about to get post row");
  const state = store.getState();
  const subredditSortOrderOption = state.appConfig.subredditSortOrderOption;
  const userFrontPageOption = state.appConfig.userFrontPagePostSortOrderOption;
  //   const topTimeFrameOption = state.appConfig.topTimeFrameOption;
  const contentFiltering = state.appConfig.contentFiltering;

  let posts = new Array<Post>();
  const fromSubreddits = new Array<Subreddit>();

  if (state.redditClient.subredditQueue.length != 0) {
    const subreddit = state.redditClient.subredditQueue[0];
    store.dispatch(subredditQueueRemoveAt(0));
    fromSubreddits.push(subreddit);
    posts = await getPostsForSubreddit([subreddit]);
    store.dispatch(setMostRecentSubredditGotten(subreddit));
  } else if (
    !(UserFrontPagePostSortOrderOptionsEnum.NotSelected === userFrontPageOption)
  ) {
    posts = await getUserFrontPage();
  } else {
    let subredditsToGetPostsFor: Array<Subreddit>;
    let sourceSubreddits: Array<Subreddit>;
    if (
      subredditSortOrderOption ==
        SubredditSortOrderOptionsEnum.RedditListDotComRecentActivity ||
      subredditSortOrderOption ==
        SubredditSortOrderOptionsEnum.RedditListDotComSubscribers ||
      subredditSortOrderOption ==
        SubredditSortOrderOptionsEnum.RedditListDotCom24HourGrowth
    ) {
      console.log("getting from redditlist.com");
      const redditListDotComObj = await getSubredditsFromRedditListDotCom();
      subredditsToGetPostsFor = [redditListDotComObj.subredditToGetPostsFrom];
      sourceSubreddits = redditListDotComObj.allSubreddits;
      console.log(
        "subreddits to get posts from redditlist.com ",
        subredditsToGetPostsFor
      );
    } else {
      const subredditsToGetPostsForObj = getSubredditsToGetPostsFor();
      subredditsToGetPostsFor =
        subredditsToGetPostsForObj.subredditsToGetPostsFor;
      sourceSubreddits = subredditsToGetPostsForObj.sourceSubredditArray;
    }
    fromSubreddits.push(...subredditsToGetPostsFor);
    posts = await getPostsForSubreddit(subredditsToGetPostsFor);
    store.dispatch(
      setSubredditsToShowInSideBar({
        subreddits: sourceSubreddits,
        subredditLists: store.getState().subredditLists.subredditLists,
      })
    );
    store.dispatch(
      setMostRecentSubredditGotten(
        fromSubreddits.length == 1 ? fromSubreddits[0] : undefined
      )
    );
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
  }

  return { posts: posts, fromSubreddits: fromSubreddits };
}

function getSubredditsToGetPostsFor(): {
  subredditsToGetPostsFor: Array<Subreddit>;
  sourceSubredditArray: Array<Subreddit>;
} {
  const state = store.getState();

  const subredditSortOrderOption = state.appConfig.subredditSortOrderOption;
  //   const selectedSubredditListSortOption =
  //     state.appConfig.selectedSubredditListSortOption;
  //   const selectSubredditIterationMethodOption =
  //     state.appConfig.selectSubredditIterationMethodOption;
  //   const sortOrderDirectionOption = state.appConfig.sortOrderDirectionOption;
  //   const postSortOrderOption = state.appConfig.postSortOrderOption;

  const subredditsToGetPostsFor = new Array<Subreddit>();
  const sourceSubredditArray = new Array<Subreddit>();

  if (SubredditSortOrderOptionsEnum.Random === subredditSortOrderOption) {
    //Get a random subreddit from subscribed reddits. Ignore iteration method

    sourceSubredditArray.push(
      ...state.redditClient.masterSubscribedSubredditList
    );
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
  } else if (
    SubredditSortOrderOptionsEnum.SubCount === subredditSortOrderOption
  ) {
    //Sort subscribed reddits by subscribers. Get random or next in iteration based on iteration method
    const sortedSubreddits = sortSubredditsBySubscribers(
      state.redditClient.masterSubscribedSubredditList
    );
    sourceSubredditArray.push(...sortedSubreddits);
    const { subreddit, updatedIndex } = getSubredditFromList(
      state.redditClient.subredditIndex,
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
      state.redditClient.masterSubscribedSubredditList
    );
    sourceSubredditArray.push(...userSubreddits);
    const { subreddit } = getSubredditFromList(
      state.redditClient.subredditIndex,
      userSubreddits
    );
    if (subreddit != undefined) {
      subredditsToGetPostsFor.push(subreddit);
    }
  } else if (
    SubredditSortOrderOptionsEnum.Alphabetically === subredditSortOrderOption
  ) {
    //Sort subscribed reddits alphabetically. User sort direction. Get random or next in iteration based on iteration method
    const sortedSubreddits = sortSubredditListAlphabetically(
      state.redditClient.masterSubscribedSubredditList
    );
    sourceSubredditArray.push(...sortedSubreddits);
    const { subreddit } = getSubredditFromList(
      state.redditClient.subredditIndex,
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
      store.getState().redditClient.subredditIndex,
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
    const subreddits = concatSelectedSubredditLists(
      store.getState().subredditLists.subredditLists
    );
    sourceSubredditArray.push(...subreddits);

    const { subreddit, updatedIndex } = getSubredditFromList(
      store.getState().redditClient.subredditIndex,
      subreddits
    );
    store.dispatch(setSubredditIndex(updatedIndex));

    if (subreddit != undefined) {
      subredditsToGetPostsFor.push(subreddit);
    }
  }

  return {
    subredditsToGetPostsFor: subredditsToGetPostsFor,
    sourceSubredditArray: sourceSubredditArray,
  };
}

function getSubredditsFromRedditListDotCom(): Promise<{
  subredditToGetPostsFrom: Subreddit;
  allSubreddits: Array<Subreddit>;
}> {
  return new Promise((resolve) => {
    try {
      const promiseArr: Array<Promise<string>> = [];
      for (let i = 0; i < 5; ++i) {
        promiseArr.push(
          new Promise((httpResolve) => {
            const url = `https://redditlist.com/nsfw${
              i == 0 ? "" : (i + 1).toString()
            }.html`;
            CapacitorHttp.get({
              url: url,
            }).then((response) => {
              response.data;
              const html = response.data.replace(/[\r\n\t]/gm, "");
              httpResolve(html);
            });
          })
        );
      }

      Promise.allSettled(promiseArr).then((promiseResultArr) => {
        const reddits: Array<Subreddit> = [];
        promiseResultArr.forEach((result: PromiseSettledResult<string>) => {
          if (result.status == "fulfilled") {
            const dom = new DOMParser().parseFromString(
              result.value,
              "text/html"
            );
            let listIndex;
            switch (store.getState().appConfig.subredditSortOrderOption) {
              case SubredditSortOrderOptionsEnum.RedditListDotComRecentActivity:
                listIndex = 0;
                break;
              case SubredditSortOrderOptionsEnum.RedditListDotComSubscribers:
                listIndex = 1;
                break;
              case SubredditSortOrderOptionsEnum.RedditListDotCom24HourGrowth:
                listIndex = 2;
                break;
            }

            if (listIndex != undefined) {
              const listItems = dom
                .getElementById("listing-parent")
                ?.children[listIndex].getElementsByClassName("listing-item");
              if (listItems != undefined) {
                for (let i = 0; i < listItems.length; ++i) {
                  const listItem = listItems.item(i);
                  if (listItem != undefined) {
                    const subRedditName = listItem
                      .getElementsByClassName("subreddit-url")[0]
                      .getElementsByTagName("a")[0].innerHTML;

                    reddits.push({
                      displayName: subRedditName,
                      displayNamePrefixed: `r/${subRedditName}`,
                      subscribers: 0,
                      over18: true,
                      isSubscribed: false,
                      fromList: "",
                      subredditUuid: uuidV4(),
                      isUser: false,
                    });
                  }
                }
              }
            }
          }
        });

        let indexToSelect;
        const listItterationMethod =
          store.getState().appConfig.selectSubredditIterationMethodOption;
        if (
          listItterationMethod ==
          SelectSubredditIterationMethodOptionsEnum.Random
        ) {
          indexToSelect = Math.round(
            Math.random() * (reddits.length - 1 - 0 + 0) + 0
          );
        } else if (
          listItterationMethod ==
          SelectSubredditIterationMethodOptionsEnum.Sequential
        ) {
          const sortOrder = store.getState().appConfig.sortOrderDirectionOption;
          indexToSelect = store.getState().redditClient.nsfwRedditListIndex;
          if (indexToSelect < 0 || indexToSelect >= reddits.length) {
            if (sortOrder == SortOrderDirectionOptionsEnum.Normal) {
              indexToSelect = 0;
            } else if (sortOrder == SortOrderDirectionOptionsEnum.Reversed) {
              indexToSelect = reddits.length - 1;
            }
          }

          if (indexToSelect != undefined) {
            if (sortOrder == SortOrderDirectionOptionsEnum.Normal) {
              store.dispatch(setNsfwRedditListIndex(indexToSelect + 1));
            } else if (sortOrder == SortOrderDirectionOptionsEnum.Reversed) {
              store.dispatch(setNsfwRedditListIndex(indexToSelect - 1));
            }
          }
        }
        console.log(1, indexToSelect);
        if (indexToSelect != undefined) {
          resolve({
            subredditToGetPostsFrom: reddits[indexToSelect],
            allSubreddits: reddits,
          });
        }
      });
    } catch (e) {
      console.log("caught e", e);
    }
  });
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
}

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
  const isScrollY0 = () => {
    return store.getState().postRows.scrollY == 0;
  };

  if (!isScrollY0()) {
    store.dispatch(
      submitAppNotification({ message: "Waiting to scroll to top." })
    );
  }

  while (!isScrollY0()) {
    await new Promise<void>((res) => setTimeout(() => res(), 100));
  }
  return;
}

async function WaitUntilPostRowComponentIsVisible() {
  if (store.getState().postRows.postRows.length == 0) {
    return;
  }

  const isOnPostRowRoute = () => {
    return window.location.href.endsWith(POST_ROW_ROUTE);
  };

  if (!isOnPostRowRoute()) {
    store.dispatch(
      submitAppNotification({ message: "Waiting until back on Main Page" })
    );
  }

  while (!isOnPostRowRoute()) {
    await new Promise<void>((res) => setTimeout(() => res(), 100));
  }
  return;
}

async function WaitUntilPointerNotOverPostRow() {
  const isMouseOverPostRow = () => {
    return store.getState().postRows.mouseOverPostRowUuid != undefined;
  };
  if (isMouseOverPostRow()) {
    store.dispatch(
      submitAppNotification({ message: "Waiting until mouse is not over row" })
    );
  }
  while (isMouseOverPostRow()) {
    await new Promise<void>((res) => setTimeout(() => res(), 100));
  }
  return;
}
