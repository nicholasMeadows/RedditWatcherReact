import RedditClient from "../client/RedditClient.ts";
import { RedditCredentials } from "../model/config/RedditCredentials.ts";
import {
  GetPostsFromSubredditState,
  GetPostsUpdatedValues,
} from "../model/converter/GetPostsFromSubredditStateConverter.ts";
import { Subreddit } from "../model/Subreddit/Subreddit.ts";
import { Post } from "../model/Post/Post.ts";
import SubredditSourceOptionsEnum from "../model/config/enums/SubredditSourceOptionsEnum.ts";
import { MAX_POSTS_PER_ROW } from "../RedditWatcherConstants.ts";
import { GetPostsForSubredditUrlConverter } from "../model/converter/GetPostsForSubredditUrlConverter.ts";
import PostSortOrderOptionsEnum from "../model/config/enums/PostSortOrderOptionsEnum.ts";
import TopTimeFrameOptionsEnum from "../model/config/enums/TopTimeFrameOptionsEnum.ts";
import { SubredditLists } from "../model/SubredditList/SubredditLists.ts";
import { MediaType } from "../model/Post/MediaTypeEnum.ts";
import SortOrderDirectionOptionsEnum from "../model/config/enums/SortOrderDirectionOptionsEnum.ts";
import SubredditSortOrderOptionsEnum from "../model/config/enums/SubredditSortOrderOptionsEnum.ts";
import SelectSubredditIterationMethodOptionsEnum from "../model/config/enums/SelectSubredditIterationMethodOptionsEnum.ts";
import RandomIterationSelectWeightOptionsEnum from "../model/config/enums/RandomIterationSelectWeightOptionsEnum.ts";
import {
  filterSubredditsListByUsersOnly,
  sortByDisplayName,
  sortByFromListThenSubscribers,
  sortPostsByCreate,
  sortSubredditsBySubscribers,
} from "../util/RedditServiceUtil.ts";
import { RedditListDotComConverter } from "../model/converter/RedditListDotComConverter.ts";
import { getSubredditsFromRedditListDotCom } from "./RedditListDotComClient.ts";
import ContentFilteringOptionEnum from "../model/config/enums/ContentFilteringOptionEnum.ts";
import { PostRowsActionType } from "../reducer/post-rows-reducer.ts";
import {
  SideBarActionType,
  SideBarDispatch,
} from "../reducer/side-bar-reducer.ts";
import {
  SubredditQueueAction,
  SubredditQueueActionType,
} from "../reducer/sub-reddit-queue-reducer.ts";
import { PostRowsDispatch } from "../context/post-rows-context.ts";
import { Dispatch } from "react";
import {
  AppNotificationsAction,
  AppNotificationsActionType,
} from "../reducer/app-notifications-reducer.ts";
import { v4 as uuidV4 } from "uuid";
import {
  RedditServiceActions,
  RedditServiceDispatch,
} from "../reducer/reddit-service-reducer.ts";

export default class RedditService {
  declare redditClient: RedditClient;

  constructor(redditCredentials: RedditCredentials) {
    this.redditClient = new RedditClient(redditCredentials);
  }

  async getPostsForPostRow(
    getPostsFromSubredditsState: GetPostsFromSubredditState,
    getPostsUpdatedValues: GetPostsUpdatedValues,
    abortSignal: AbortSignal
  ): Promise<{
    posts: Array<Post>;
    fromSubreddits: Array<Subreddit>;
  }> {
    console.log("about to get post row");
    let postsFromSubreddit: Post[] = new Array<Post>();
    const fromSubreddits = new Array<Subreddit>();
    if (getPostsFromSubredditsState.subredditQueue.length != 0) {
      const subreddit = getPostsFromSubredditsState.subredditQueue[0];
      getPostsUpdatedValues.subredditQueueItemToRemove = subreddit;
      fromSubreddits.push(subreddit);
      postsFromSubreddit = await this.getPostsForSubreddit(
        [subreddit],
        getPostsFromSubredditsState.concatRedditUrlMaxLength,
        getPostsFromSubredditsState.postSortOrder,
        getPostsFromSubredditsState.topTimeFrame,
        getPostsFromSubredditsState.redditApiItemLimit,
        getPostsFromSubredditsState.masterSubredditList,
        getPostsFromSubredditsState.subredditLists,
        getPostsFromSubredditsState.useInMemoryImagesAndGifs
      );
      if (abortSignal.aborted) {
        throw new Error("Aborted");
      }
      getPostsUpdatedValues.mostRecentSubredditGotten = subreddit;
    } else if (
      getPostsFromSubredditsState.subredditSourceOption ===
      SubredditSourceOptionsEnum.FrontPage
    ) {
      postsFromSubreddit = await this.redditClient.getUserFrontPage(
        getPostsFromSubredditsState.postSortOrder,
        getPostsFromSubredditsState.topTimeFrame,
        getPostsFromSubredditsState.redditApiItemLimit,
        getPostsFromSubredditsState.masterSubredditList,
        getPostsFromSubredditsState.subredditLists
      );
      if (abortSignal.aborted) {
        throw new Error("Aborted");
      }
      getPostsUpdatedValues.subredditsToShowInSideBar =
        getPostsFromSubredditsState.masterSubredditList;
    } else {
      const { posts, fromSubreddits } = await this.getPosts(
        getPostsUpdatedValues,
        getPostsFromSubredditsState.subredditSourceOption,
        getPostsFromSubredditsState.masterSubredditList,
        getPostsFromSubredditsState.sortOrderDirection,
        getPostsFromSubredditsState.subredditLists,
        getPostsFromSubredditsState.subredditSortOrderOption,
        getPostsFromSubredditsState.subredditIndex,
        getPostsFromSubredditsState.nsfwSubredditIndex,
        getPostsFromSubredditsState.concatRedditUrlMaxLength,
        getPostsFromSubredditsState.postSortOrder,
        getPostsFromSubredditsState.topTimeFrame,
        getPostsFromSubredditsState.redditApiItemLimit,
        getPostsFromSubredditsState.selectSubredditIterationMethodOption,
        getPostsFromSubredditsState.randomIterationSelectWeightOption,
        getPostsFromSubredditsState.getAllSubredditsAtOnce,
        getPostsFromSubredditsState.useInMemoryImagesAndGifs
      );
      if (abortSignal.aborted) {
        throw new Error("Aborted");
      }
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

  private async getPosts(
    getPostsUpdatedValues: GetPostsUpdatedValues,
    subredditSourceOption: SubredditSourceOptionsEnum,
    masterSubredditList: Subreddit[],
    sortOrderDirection: SortOrderDirectionOptionsEnum,
    subredditLists: SubredditLists[],
    subredditSortOption: SubredditSortOrderOptionsEnum,
    subredditIndex: number,
    nsfwSubredditIndex: number,
    concatUrlMaxLength: number,
    postSortOrder: PostSortOrderOptionsEnum,
    topTimeFrame: TopTimeFrameOptionsEnum,
    redditApiItemLimit: number,
    selectSubredditIterationMethodOption: SelectSubredditIterationMethodOptionsEnum,
    randomIterationSelectWeightOption: RandomIterationSelectWeightOptionsEnum,
    getAllSubredditsAtOnce: boolean,
    useInMemoryImagesAndGifs: boolean
  ): Promise<{
    posts: Array<Post>;
    fromSubreddits: Array<Subreddit>;
  }> {
    let sourceSubreddits = await this.getSourceSubreddits(
      subredditSourceOption,
      masterSubredditList,
      sortOrderDirection,
      subredditLists
    );

    sourceSubreddits = this.sortSourceSubreddits(
      sourceSubreddits,
      subredditSourceOption,
      subredditSortOption,
      sortOrderDirection
    );
    getPostsUpdatedValues.subredditsToShowInSideBar = sourceSubreddits;
    const {
      subredditsToGet,
      updatedSubredditIndex,
      updatedNsfwSubredditIndex,
      mostRecentSubredditGotten,
    } = this.getSubredditsToGetPostsFor(
      sourceSubreddits,
      subredditSourceOption,
      getAllSubredditsAtOnce,
      selectSubredditIterationMethodOption,
      randomIterationSelectWeightOption,
      nsfwSubredditIndex,
      subredditIndex
    );
    getPostsUpdatedValues.subredditIndex = updatedSubredditIndex;
    getPostsUpdatedValues.nsfwRedditListIndex = updatedNsfwSubredditIndex;
    getPostsUpdatedValues.mostRecentSubredditGotten = mostRecentSubredditGotten;
    const posts = await this.getPostsForSubreddit(
      subredditsToGet,
      concatUrlMaxLength,
      postSortOrder,
      topTimeFrame,
      redditApiItemLimit,
      masterSubredditList,
      subredditLists,
      useInMemoryImagesAndGifs
    );
    return {
      posts: posts,
      fromSubreddits: subredditsToGet,
    };
  }

  private async getSourceSubreddits(
    subredditSourceOption: SubredditSourceOptionsEnum,
    masterSubredditList: Subreddit[],
    sortOrderDirection: SortOrderDirectionOptionsEnum,
    subredditLists: SubredditLists[]
  ): Promise<Subreddit[]> {
    if (
      subredditSourceOption ==
        SubredditSourceOptionsEnum.RedditListDotComRecentActivity ||
      subredditSourceOption ==
        SubredditSourceOptionsEnum.RedditListDotComSubscribers ||
      subredditSourceOption ==
        SubredditSourceOptionsEnum.RedditListDotCom24HourGrowth
    ) {
      return this.getSubredditsToGetPostsForFromRedditListDotCom(
        subredditSourceOption
      );
    } else if (
      subredditSourceOption === SubredditSourceOptionsEnum.SubscribedSubreddits
    ) {
      return masterSubredditList;
    } else if (
      subredditSourceOption === SubredditSourceOptionsEnum.RedditUsersOnly
    ) {
      //Sort subscribed reddits by users only. Get random or next in iteration based on iteration method
      return filterSubredditsListByUsersOnly(
        masterSubredditList,
        sortOrderDirection
      );
    } else if (
      subredditSourceOption ===
      SubredditSourceOptionsEnum.SelectedSubRedditLists
    ) {
      const subreddits = new Array<Subreddit>();
      const selectedLists = subredditLists.filter(
        (subredditList) => subredditList.selected
      );
      if (selectedLists !== undefined) {
        selectedLists.forEach((list) => {
          list.subreddits.forEach((subreddit) => {
            const foundSubreddit = subreddits.find(
              (sub) => sub.displayName === subreddit.displayName
            );
            if (foundSubreddit === undefined) {
              subreddits.push(subreddit);
            }
          });
        });
      }
      return subreddits;
    } else if (
      subredditSourceOption === SubredditSourceOptionsEnum.AllSubRedditLists
    ) {
      const subreddits = new Array<Subreddit>();
      subredditLists.forEach((list) => {
        list.subreddits.forEach((subreddit) => {
          const foundSubreddit = subreddits.find(
            (sub) => sub.displayName === subreddit.displayName
          );
          if (foundSubreddit === undefined) {
            subreddits.push(subreddit);
          }
        });
      });
      return subreddits;
    }
    return [];
  }

  private async getSubredditsToGetPostsForFromRedditListDotCom(
    subredditSourceOption: SubredditSourceOptionsEnum
  ): Promise<Subreddit[]> {
    console.log("getting from redditlist.com");
    const converter = new RedditListDotComConverter();
    const htmlArray = await getSubredditsFromRedditListDotCom();
    switch (subredditSourceOption) {
      case SubredditSourceOptionsEnum.RedditListDotComRecentActivity:
        return converter.convertToReddListDotComRecentActivity(htmlArray);
      case SubredditSourceOptionsEnum.RedditListDotComSubscribers:
        return converter.convertToReddListDotComSubscribers(htmlArray);
      case SubredditSourceOptionsEnum.RedditListDotCom24HourGrowth:
        return converter.convertToReddListDotCom24HourGrowth(htmlArray);
      default:
        return [];
    }
  }

  private sortSourceSubreddits(
    subreddits: Subreddit[],
    subredditSourceOption: SubredditSourceOptionsEnum,
    subredditSortOption: SubredditSortOrderOptionsEnum,
    sortOrderDirection: SortOrderDirectionOptionsEnum
  ) {
    if (
      subredditSourceOption ===
        SubredditSourceOptionsEnum.RedditListDotComRecentActivity ||
      subredditSourceOption ===
        SubredditSourceOptionsEnum.RedditListDotComSubscribers ||
      subredditSourceOption ===
        SubredditSourceOptionsEnum.RedditListDotCom24HourGrowth
    ) {
      return subreddits;
    }
    switch (subredditSortOption) {
      case SubredditSortOrderOptionsEnum.Alphabetically:
        return sortByDisplayName(subreddits, sortOrderDirection);
      case SubredditSortOrderOptionsEnum.SubCount:
        return sortSubredditsBySubscribers(subreddits, sortOrderDirection);
      case SubredditSortOrderOptionsEnum.SubCountAndListName:
        return sortByFromListThenSubscribers(subreddits, sortOrderDirection);
    }
  }

  private getSubredditsToGetPostsFor(
    sourceSubreddits: Subreddit[],
    subredditSourceOption: SubredditSourceOptionsEnum,
    getAllSubredditsAtOnce: boolean,
    selectSubredditIterationMethodOption: SelectSubredditIterationMethodOptionsEnum,
    randomIterationSelectWeightOption: RandomIterationSelectWeightOptionsEnum,
    nsfwSubredditIndex: number,
    subredditIndex: number
  ): {
    subredditsToGet: Subreddit[];
    updatedSubredditIndex: number;
    updatedNsfwSubredditIndex: number;
    mostRecentSubredditGotten: Subreddit | undefined;
  } {
    let subredditsToGet = [];
    if (getAllSubredditsAtOnce) {
      return {
        subredditsToGet: sourceSubreddits,
        updatedNsfwSubredditIndex: nsfwSubredditIndex,
        updatedSubredditIndex: subredditIndex,
        mostRecentSubredditGotten: undefined,
      };
    }

    let index = 0;
    let updatedNsfwSubredditIndex = nsfwSubredditIndex;
    let updatedSubredditIndex = subredditIndex;
    if (
      selectSubredditIterationMethodOption ===
      SelectSubredditIterationMethodOptionsEnum.Random
    ) {
      index = Math.floor(Math.random() * sourceSubreddits.length);

      if (
        RandomIterationSelectWeightOptionsEnum.PureRandom ==
        randomIterationSelectWeightOption
      ) {
        index = Math.floor(Math.random() * sourceSubreddits.length);
      } else if (
        RandomIterationSelectWeightOptionsEnum.WeightedBySubCount ==
        randomIterationSelectWeightOption
      ) {
        let totalWeight: number = 0;
        sourceSubreddits.map((sub) => (totalWeight += sub.subscribers));
        const randomWeightedIndex = Math.floor(Math.random() * totalWeight);
        let itemWeightedIndex = 0;
        for (let i = 0; i < sourceSubreddits.length; ++i) {
          const item = sourceSubreddits[i];
          itemWeightedIndex += item.subscribers;
          if (randomWeightedIndex < itemWeightedIndex) {
            index = i;
            break;
          }
        }
      }
    } else if (
      subredditSourceOption ===
        SubredditSourceOptionsEnum.RedditListDotCom24HourGrowth ||
      subredditSourceOption ===
        SubredditSourceOptionsEnum.RedditListDotComRecentActivity ||
      subredditSourceOption ===
        SubredditSourceOptionsEnum.RedditListDotComSubscribers
    ) {
      index =
        nsfwSubredditIndex >= sourceSubreddits.length ? 0 : nsfwSubredditIndex;
      updatedNsfwSubredditIndex = index + 1;
    } else {
      index = subredditIndex >= sourceSubreddits.length ? 0 : subredditIndex;
      updatedSubredditIndex = index + 1;
    }

    const singleSubredditToGet = sourceSubreddits[index];
    subredditsToGet = [singleSubredditToGet];
    return {
      subredditsToGet: subredditsToGet,
      updatedSubredditIndex: updatedSubredditIndex,
      updatedNsfwSubredditIndex: updatedNsfwSubredditIndex,
      mostRecentSubredditGotten: singleSubredditToGet,
    };
  }

  private async getPostsForSubreddit(
    subreddits: Array<Subreddit>,
    concatRedditUrlMaxLength: number,
    postSortOrder: PostSortOrderOptionsEnum,
    topTimeFrame: TopTimeFrameOptionsEnum,
    redditApiItemLimit: number,
    masterSubredditList: Subreddit[],
    subredditLists: SubredditLists[],
    useInMemoryImagesAndGifs: boolean
  ): Promise<Array<Post>> {
    const urlConverter = new GetPostsForSubredditUrlConverter();
    const [url, randomSourceString] = urlConverter.convert(
      subreddits,
      concatRedditUrlMaxLength,
      postSortOrder,
      topTimeFrame,
      redditApiItemLimit
    );
    let posts = await this.redditClient.getPostsForSubredditUri(
      url,
      masterSubredditList,
      subredditLists
    );
    posts = posts.map<Post>((value) => {
      value.randomSourceString = randomSourceString;
      return value;
    });
    if (useInMemoryImagesAndGifs) {
      await this.getBase64ForImages(posts);
    }
    return posts;
  }

  private async getBase64ForImages(posts: Array<Post>) {
    const promiseArr = new Array<Promise<string | ArrayBuffer | null>>();

    posts.forEach((post) => {
      post.attachments.forEach((attachment) => {
        if (
          attachment.mediaType === MediaType.Image ||
          attachment.mediaType === MediaType.Gif
        ) {
          const prom = this.getBase64ForImgUrl(attachment.url);
          prom
            .then((res) => {
              attachment.base64Img = res;
            })
            .catch((err) => {
              console.log("Caught error while fetching base64 img", err);
            });
          promiseArr.push(prom);
          if (attachment.mediaType === MediaType.Image) {
            const resolutions = attachment.attachmentResolutions;
            if (resolutions !== undefined) {
              resolutions.forEach((resolution) => {
                const resolutionPromise = this.getBase64ForImgUrl(
                  resolution.url
                );
                resolutionPromise
                  .then((res) => (resolution.base64Img = res))
                  .catch((err) => {
                    console.log(
                      "Caught error while fetching base64 attachment",
                      err
                    );
                  });
                promiseArr.push(resolutionPromise);
              });
            }
          }
        }
      });
    });

    await Promise.allSettled(promiseArr);
  }

  private getBase64ForImgUrl(imgUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const timeoutController = new AbortController();
      const timeoutId = setTimeout(() => timeoutController.abort(), 30000);
      fetch(imgUrl, { signal: timeoutController.signal })
        .then((fetchResponse) => {
          if (fetchResponse.status === 200) {
            fetchResponse
              .blob()
              .then((blob) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  const result = reader.result;
                  if (result === null) {
                    reject("reader returned null");
                  } else {
                    resolve(result.toString());
                  }
                };
                reader.onerror = (err) => {
                  reject(err);
                };
                reader.readAsDataURL(blob);
              })
              .catch((err) => {
                reject(err);
              });
          } else {
            reject(
              `Fetch response did not return OK response. Actual was ${fetchResponse.status}`
            );
          }
        })
        .catch((err) => {
          reject(err);
        });
      clearTimeout(timeoutId);
    });
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
      getPostsFromSubredditsState.subredditSourceOption ===
        SubredditSourceOptionsEnum.FrontPage &&
      getPostsFromSubredditsState.postSortOrder === PostSortOrderOptionsEnum.New
    ) {
      posts = sortPostsByCreate(posts);
      if (postRows.length === 0) {
        getPostsUpdatedValues.createPostRowAndInsertAtBeginning = posts;
        getPostsUpdatedValues.lastPostRowWasSortOrderNew = true;
      } else {
        const firstPostRow = postRows[0];
        const mostRecentPost = firstPostRow.posts[0];
        const mostRecentPostCreated = mostRecentPost.created;
        const postsToAddToViewModel = posts.filter((post) => {
          return post.created > mostRecentPostCreated;
        });
        if (lastPostRowWasSortOrderNew) {
          getPostsUpdatedValues.shiftPostsAndUiPosts = {
            postRowUuid: firstPostRow.postRowUuid,
            posts: postsToAddToViewModel,
          };
        } else {
          getPostsUpdatedValues.createPostRowAndInsertAtBeginning =
            postsToAddToViewModel;
        }
        getPostsUpdatedValues.lastPostRowWasSortOrderNew = true;
      }
    } else {
      getPostsUpdatedValues.createPostRowAndInsertAtBeginning = posts;
      getPostsUpdatedValues.lastPostRowWasSortOrderNew = false;
    }
  }

  applyUpdatedStateValues(
    updatedValues: GetPostsUpdatedValues,
    subredditQueueDispatch: Dispatch<SubredditQueueAction>,
    currentPostsToShowInRow: number,
    postRowsDispatch: PostRowsDispatch,
    sideBarDispatch: SideBarDispatch,
    subredditLists: Array<SubredditLists>,
    subredditSourceOption: SubredditSourceOptionsEnum,
    redditServiceDispatch: RedditServiceDispatch
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
      redditServiceDispatch({
        type: RedditServiceActions.SET_SUBREDDIT_INDEX,
        payload: updatedValues.subredditIndex,
      });
    }
    if (updatedValues.nsfwRedditListIndex != undefined) {
      redditServiceDispatch({
        type: RedditServiceActions.SET_NSFW_SUBREDDIT_INDEX,
        payload: updatedValues.nsfwRedditListIndex,
      });
    }
    if (updatedValues.lastPostRowWasSortOrderNew != undefined) {
      redditServiceDispatch({
        type: RedditServiceActions.SET_LAST_POST_ROW_WAS_SORT_ORDER_NEW,
        payload: updatedValues.lastPostRowWasSortOrderNew,
      });
    }
    if (updatedValues.createPostRowAndInsertAtBeginning != undefined) {
      postRowsDispatch({
        type: PostRowsActionType.CREATE_POST_ROW_AND_INSERT_AT_BEGINNING,
        payload: {
          posts: updatedValues.createPostRowAndInsertAtBeginning,
          postsToShowInRow: currentPostsToShowInRow,
          subredditSourceOption: subredditSourceOption,
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
          subredditSourceOption: subredditSourceOption,
        },
      });
    }
  }
}
