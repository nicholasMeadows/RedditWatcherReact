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
import { SubredditAccountSearchResult } from "../model/SubredditAccountSearchResult";
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
import { SubredditQueueItem } from "../model/Subreddit/SubredditQueueItem.ts";
import { SubredditLists } from "../model/SubredditList/SubredditLists.ts";
import { PostRow } from "../model/PostRow.ts";

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
  const postRows = state.postRows.postRows;

  const subredditSortOrderOption = state.appConfig.subredditSortOrderOption;
  const userFrontPagePostSortOrderOption =
    state.appConfig.userFrontPagePostSortOrderOption;
  const contentFiltering = state.appConfig.contentFiltering;
  const subredditQueue = state.redditClient.subredditQueue;
  const concatRedditUrlMaxLength = state.appConfig.concatRedditUrlMaxLength;
  const postSortOrder = state.appConfig.postSortOrderOption;
  const topTimeFrame = state.appConfig.topTimeFrameOption;
  const redditApiItemLimit = state.appConfig.redditApiItemLimit;
  const selectSubredditIterationMethodOption =
    state.appConfig.selectSubredditIterationMethodOption;
  const sortOrderDirection = state.appConfig.sortOrderDirectionOption;
  const nsfwSubredditIndex = state.redditClient.nsfwRedditListIndex;
  const masterSubredditList = state.redditClient.masterSubscribedSubredditList;
  const subredditIndex = state.redditClient.subredditIndex;
  const subredditLists = state.subredditLists.subredditLists;
  const lastPostRowWasSortOrderNew =
    state.redditClient.lastPostRowWasSortOrderNew;

  let postsGotten: Array<Post> = [];
  let postsFromSubreddits: Array<Subreddit> = [];

  if (postRows.length == 0) {
    while (postsGotten.length == 0) {
      const [posts, fromSubreddits] = await getPostRow(
        subredditSortOrderOption,
        userFrontPagePostSortOrderOption,
        contentFiltering,
        subredditQueue,
        concatRedditUrlMaxLength,
        postSortOrder,
        topTimeFrame,
        redditApiItemLimit,
        selectSubredditIterationMethodOption,
        sortOrderDirection,
        nsfwSubredditIndex,
        masterSubredditList,
        subredditIndex,
        subredditLists
      );
      if (postsGotten.length == 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      postsGotten = posts;
      postsFromSubreddits = fromSubreddits;
    }
  } else {
    const [posts, fromSubreddits] = await getPostRow(
      subredditSortOrderOption,
      userFrontPagePostSortOrderOption,
      contentFiltering,
      subredditQueue,
      concatRedditUrlMaxLength,
      postSortOrder,
      topTimeFrame,
      redditApiItemLimit,
      selectSubredditIterationMethodOption,
      sortOrderDirection,
      nsfwSubredditIndex,
      masterSubredditList,
      subredditIndex,
      subredditLists
    );
    postsGotten = posts;
    postsFromSubreddits = fromSubreddits;
  }

  await WaitUntilPostRowScrollY0();
  await WaitUntilPostRowComponentIsVisible();
  await WaitUntilPointerNotOverPostRow();
  if (state.postRows.postRows.length == 10) {
    store.dispatch(postRowRemoveAt(state.postRows.postRows.length - 1));
  }
  addPostRow(
    postsGotten,
    postsFromSubreddits,
    userFrontPagePostSortOrderOption,
    postRows,
    lastPostRowWasSortOrderNew
  );
}

export async function getPostRow(
  subredditSortOrderOption: SubredditSortOrderOptionsEnum,
  userFrontPagePostSortOrderOption: UserFrontPagePostSortOrderOptionsEnum,
  contentFiltering: ContentFilteringOptionEnum,
  subredditQueue: Array<SubredditQueueItem>,
  concatRedditUrlMaxLength: number,
  postSortOrder: PostSortOrderOptionsEnum,
  topTimeFrame: TopTimeFrameOptionsEnum,
  redditApiItemLimit: number,
  selectSubredditIterationMethodOption: SelectSubredditIterationMethodOptionsEnum,
  sortOrderDirection: SortOrderDirectionOptionsEnum,
  nsfwSubredditIndex: number,
  masterSubredditList: Array<Subreddit>,
  subredditIndex: number,
  subredditLists: Array<SubredditLists>
): Promise<[Array<Post>, Array<Subreddit>]> {
  console.log("about to get post row");
  let posts: Post[];
  const fromSubreddits = new Array<Subreddit>();

  if (subredditQueue.length != 0) {
    const subreddit = subredditQueue[0];
    store.dispatch(subredditQueueRemoveAt(0));
    fromSubreddits.push(subreddit);
    posts = await getPostsForSubreddit(
      [subreddit],
      concatRedditUrlMaxLength,
      postSortOrder,
      topTimeFrame,
      redditApiItemLimit
    );
    store.dispatch(setMostRecentSubredditGotten(subreddit));
  } else if (
    !(
      UserFrontPagePostSortOrderOptionsEnum.NotSelected ===
      userFrontPagePostSortOrderOption
    )
  ) {
    posts = await getUserFrontPage(
      userFrontPagePostSortOrderOption,
      topTimeFrame,
      redditApiItemLimit
    );
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
      const redditListDotComObj = await getSubredditsFromRedditListDotCom(
        subredditSortOrderOption,
        selectSubredditIterationMethodOption,
        sortOrderDirection,
        nsfwSubredditIndex
      );
      subredditsToGetPostsFor = [redditListDotComObj.subredditToGetPostsFrom];
      sourceSubreddits = redditListDotComObj.allSubreddits;
      console.log(
        "subreddits to get posts from redditlist.com ",
        subredditsToGetPostsFor
      );
    } else {
      const subredditsToGetPostsForObj = getSubredditsToGetPostsFor(
        subredditSortOrderOption,
        masterSubredditList,
        subredditIndex,
        subredditLists
      );
      subredditsToGetPostsFor =
        subredditsToGetPostsForObj.subredditsToGetPostsFor;
      sourceSubreddits = subredditsToGetPostsForObj.sourceSubredditArray;
    }
    fromSubreddits.push(...subredditsToGetPostsFor);
    posts = await getPostsForSubreddit(
      subredditsToGetPostsFor,
      concatRedditUrlMaxLength,
      postSortOrder,
      topTimeFrame,
      redditApiItemLimit
    );

    store.dispatch(setSubredditsToShowInSideBar(sourceSubreddits));
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

  // return { posts: posts, fromSubreddits: fromSubreddits };
  return [posts, fromSubreddits];
}

function getSubredditsToGetPostsFor(
  subredditSortOrderOption: SubredditSortOrderOptionsEnum,
  masterSubscribedSubredditList: Array<Subreddit>,
  subredditIndex: number,
  subredditLists: Array<SubredditLists>
): {
  subredditsToGetPostsFor: Array<Subreddit>;
  sourceSubredditArray: Array<Subreddit>;
} {
  // const state = store.getState();

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

  return {
    subredditsToGetPostsFor: subredditsToGetPostsFor,
    sourceSubredditArray: sourceSubredditArray,
  };
}

function getSubredditsFromRedditListDotCom(
  subredditSortOrderOption: SubredditSortOrderOptionsEnum,
  selectSubredditIterationMethodOption: SelectSubredditIterationMethodOptionsEnum,
  sortOrderDirectionOption: SortOrderDirectionOptionsEnum,
  nsfwSubredditIndex: number
): Promise<{
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
            switch (subredditSortOrderOption) {
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
        const listItterationMethod = selectSubredditIterationMethodOption;
        if (
          listItterationMethod ==
          SelectSubredditIterationMethodOptionsEnum.Random
        ) {
          indexToSelect = Math.round(Math.random() * (reddits.length - 1));
        } else if (
          listItterationMethod ==
          SelectSubredditIterationMethodOptionsEnum.Sequential
        ) {
          const sortOrder = sortOrderDirectionOption;
          indexToSelect = nsfwSubredditIndex;
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
  subreddits: Array<Subreddit>,
  concatRedditUrlMaxLength: number,
  postSortOrder: PostSortOrderOptionsEnum,
  topTimeFrame: TopTimeFrameOptionsEnum,
  redditApiItemLimit: number
): Promise<Array<Post>> {
  // const state = store.getState();
  const urlMaxLength = concatRedditUrlMaxLength;

  let isUser = false;
  if (subreddits.length == 1) {
    isUser = subreddits[0].displayName.startsWith("u_");
  }

  const { urlSuffix, randomSourceString } = createUrlSuffix(
    isUser,
    postSortOrder,
    topTimeFrame,
    redditApiItemLimit
  );
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

function addPostRow(
  posts: Array<Post>,
  fromSubreddits: Array<Subreddit>,
  userFrontPageOption: UserFrontPagePostSortOrderOptionsEnum,
  postRows: Array<PostRow>,
  lastPostRowWasSortOrderNew: boolean
) {
  // ShowHidLoadingSpinner(false);
  if (posts.length > 0) {
    if (
      UserFrontPagePostSortOrderOptionsEnum.NotSelected !=
        userFrontPageOption &&
      UserFrontPagePostSortOrderOptionsEnum.New == userFrontPageOption
    ) {
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

function createUrlSuffix(
  isUser: boolean,
  postSortOrder: PostSortOrderOptionsEnum,
  topTimeFrame: TopTimeFrameOptionsEnum,
  redditApiItemLimit: number
): {
  urlSuffix: string;
  randomSourceString: string;
} {
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
