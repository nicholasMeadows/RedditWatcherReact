import {useCallback, useContext, useEffect, useRef} from "react";
import RedditClient from "../client/RedditClient.ts";
import {AppConfigStateContext} from "../context/app-config-context.ts";
import {RedditServiceDispatchContext, RedditServiceStateContext,} from "../context/reddit-service-context.ts";
import {RedditServiceActions} from "../reducer/reddit-service-reducer.ts";
import {Subreddit} from "../model/Subreddit/Subreddit.ts";
import {
  GetPostsFromSubredditResponse,
  GetPostsFromSubredditState,
} from "../model/converter/GetPostsFromSubredditStateConverter.ts";
import {RedditListStateContext} from "../context/reddit-list-context.ts";
import {SideBarDispatchContext} from "../context/side-bar-context.ts";
import RedditService from "../service/RedditService.ts";
import {AppNotificationsDispatchContext} from "../context/app-notifications-context.ts";
import {AppNotificationsActionType} from "../reducer/app-notifications-reducer.ts";
import {SideBarActionType} from "../reducer/side-bar-reducer.ts";
import {PostRowPageContext, PostRowPageDispatchContext,} from "../context/post-row-page-context.ts";
import {PostRowPageActionType} from "../reducer/post-row-page-reducer.ts";

export default function useRedditService() {
  const {
    redditCredentials,
    subredditSourceOption,
    subredditSortOrderOption,
    getAllSubredditsAtOnce,
    contentFiltering,
    concatRedditUrlMaxLength,
    postSortOrderOption,
    topTimeFrameOption,
    redditApiItemLimit,
    selectSubredditIterationMethodOption,
    sortOrderDirectionOption,
    randomIterationSelectWeightOption,
    useInMemoryImagesAndGifs,
    postsToShowInRow,
    postConverterFilteringOptions,
  } = useContext(AppConfigStateContext);
  const { subredditLists } = useContext(RedditListStateContext);
  const {
    masterSubscribedSubredditList,
    subredditIndex,
    nsfwSubredditIndex,
    lastPostRowWasSortOrderNew,
    subredditQueue,
  } = useContext(RedditServiceStateContext);

  const redditServiceDispatch = useContext(RedditServiceDispatchContext);

  const postRowPageDispatch = useContext(PostRowPageDispatchContext);
  const sideBarDispatch = useContext(SideBarDispatchContext);
  const appNotificationDispatch = useContext(AppNotificationsDispatchContext);
  const { postRows } = useContext(PostRowPageContext);

  const currentGetPostsFromSubredditValues =
    useRef<GetPostsFromSubredditState>();

  useEffect(() => {
    const {
      redditGalleries,
      urlsThatEndWithDotJpeg,
      urlsThatEndWithDotJpg,
      urlsThatEndWithDotPng,
      urlsThatEndWithDotGif,
      urlsInRedGifsDomain,
      urlsInImgurDomain,
      urlsInGiphyDomain,
    } = postConverterFilteringOptions;
    currentGetPostsFromSubredditValues.current = {
      postRows: postRows,
      subredditSourceOption: subredditSourceOption,
      subredditSortOrderOption: subredditSortOrderOption,
      useInMemoryImagesAndGifs: useInMemoryImagesAndGifs,
      lastPostRowWasSortOrderNew: lastPostRowWasSortOrderNew,
      redditApiItemLimit: redditApiItemLimit,
      concatRedditUrlMaxLength: concatRedditUrlMaxLength,
      postSortOrder: postSortOrderOption,
      topTimeFrame: topTimeFrameOption,
      subredditLists: subredditLists,
      subredditQueue: subredditQueue,
      contentFiltering: contentFiltering,
      getAllSubredditsAtOnce: getAllSubredditsAtOnce,
      nsfwSubredditIndex: nsfwSubredditIndex,
      masterSubredditList: masterSubscribedSubredditList,
      subredditIndex: subredditIndex,
      randomIterationSelectWeightOption: randomIterationSelectWeightOption,
      selectSubredditIterationMethodOption:
        selectSubredditIterationMethodOption,
      sortOrderDirection: sortOrderDirectionOption,
      postConverterFilteringOptions: {
        redditGalleries: redditGalleries,
        urlsInGiphyDomain: urlsInGiphyDomain,
        urlsInImgurDomain: urlsInImgurDomain,
        urlsInRedGifsDomain: urlsInRedGifsDomain,
        urlsThatEndWithDotJpeg: urlsThatEndWithDotJpeg,
        urlsThatEndWithDotGif: urlsThatEndWithDotGif,
        urlsThatEndWithDotPng: urlsThatEndWithDotPng,
        urlsThatEndWithDotJpg: urlsThatEndWithDotJpg,
      },
    };
  }, [
    concatRedditUrlMaxLength,
    contentFiltering,
    postRows,
    postsToShowInRow,
    randomIterationSelectWeightOption,
    redditApiItemLimit,
    redditCredentials,
    selectSubredditIterationMethodOption,
    subredditLists,
    subredditQueue,
    subredditSortOrderOption,
    subredditSourceOption,
    getAllSubredditsAtOnce,
    useInMemoryImagesAndGifs,
    lastPostRowWasSortOrderNew,
    postSortOrderOption,
    topTimeFrameOption,
    nsfwSubredditIndex,
    masterSubscribedSubredditList,
    subredditIndex,
    sortOrderDirectionOption,
    postConverterFilteringOptions,
  ]);

  const loadSubscribedSubreddits = useCallback(
    async (redditApiItemLimit: number, async: boolean = true) => {
      const redditClient = new RedditClient(redditCredentials);
      let results = await redditClient.getSubscribedSubReddits(
        redditApiItemLimit,
        undefined
      );
      redditServiceDispatch({
        type: RedditServiceActions.ADD_TO_MASTER_SUBSCRIBED_SUBREDDIT_LIST,
        payload: {
          subreddits: results.subreddits,
        },
      });
      const asyncLoopForRemainingSubreddits = async () => {
        const subredditsToAdd = new Array<Subreddit>();
        while (results.after != undefined) {
          results = await redditClient.getSubscribedSubReddits(
            redditApiItemLimit,
            results.after
          );
          subredditsToAdd.push(...results.subreddits);
        }
        redditServiceDispatch({
          type: RedditServiceActions.ADD_TO_MASTER_SUBSCRIBED_SUBREDDIT_LIST,
          payload: {
            subreddits: subredditsToAdd,
          },
        });
      };
      if (async) {
        asyncLoopForRemainingSubreddits();
      } else {
        await asyncLoopForRemainingSubreddits();
      }
    },
    [redditCredentials, redditServiceDispatch]
  );

  const getPostsForPostRow = useCallback(async (): Promise<{
    getPostsFromSubredditResponse: GetPostsFromSubredditResponse;
    getPostsFromSubredditState: GetPostsFromSubredditState;
  }> => {
    redditServiceDispatch({
      type: RedditServiceActions.SET_CURRENTLY_GETTING_POSTS,
      payload: true
    });
    const getPostsFromSubredditState: GetPostsFromSubredditState = JSON.parse(
      JSON.stringify(currentGetPostsFromSubredditValues.current)
    );
    const redditService = new RedditService(redditCredentials);
    return new Promise<{
      getPostsFromSubredditResponse: GetPostsFromSubredditResponse;
      getPostsFromSubredditState: GetPostsFromSubredditState;
    }>((resolve, reject) => {
      redditService
        .getPostsForPostRow(getPostsFromSubredditState)
        .then((response) => {
          resolve({
            getPostsFromSubredditResponse: response,
            getPostsFromSubredditState: getPostsFromSubredditState,
          });
        })
        .catch((err) => reject(err)).finally(() => {
          redditServiceDispatch({
            type: RedditServiceActions.SET_CURRENTLY_GETTING_POSTS,
            payload: false
          });
        });
    });
  }, [redditCredentials, redditServiceDispatch]);

  const applyUpdatedStateValues = useCallback(
    (
      getPostsFromSubredditState: GetPostsFromSubredditState,
      getPostsResponse: GetPostsFromSubredditResponse
    ) => {
      if (getPostsResponse.subredditQueueItemToRemove != undefined) {
        redditServiceDispatch({
          type: RedditServiceActions.REMOVE_SUBREDDIT_QUEUE_ITEM,
          payload: getPostsResponse.subredditQueueItemToRemove,
        });
      }
      if (getPostsResponse.mostRecentSubredditGotten != undefined) {
        sideBarDispatch({
          type: SideBarActionType.SET_MOST_RECENT_SUBREDDIT_GOTTEN,
          payload: getPostsResponse.mostRecentSubredditGotten,
        });
      }
      if (getPostsResponse.subredditsToShowInSideBar != undefined) {
        sideBarDispatch({
          type: SideBarActionType.SET_SUBREDDITS_TO_SHOW_IN_SIDEBAR,
          payload: {
            subreddits: getPostsResponse.subredditsToShowInSideBar,
          },
        });
      }
      if (getPostsResponse.subredditIndex != undefined) {
        redditServiceDispatch({
          type: RedditServiceActions.SET_SUBREDDIT_INDEX,
          payload: getPostsResponse.subredditIndex,
        });
      }
      if (getPostsResponse.nsfwRedditListIndex != undefined) {
        redditServiceDispatch({
          type: RedditServiceActions.SET_NSFW_SUBREDDIT_INDEX,
          payload: getPostsResponse.nsfwRedditListIndex,
        });
      }
      if (getPostsResponse.posts.length > 0) {
        postRowPageDispatch({
          type: PostRowPageActionType.ADD_POST_ROW,
          payload: {
            posts: getPostsResponse.posts,
            gottenWithPostSortOrderOption:
              getPostsFromSubredditState.postSortOrder,
            gottenWithSubredditSourceOption:
              getPostsFromSubredditState.subredditSourceOption,
          },
        });
      }
    },
    [postRowPageDispatch, redditServiceDispatch, sideBarDispatch]
  );

  const handleGottenPosts = useCallback(
    (
      getPostsFromSubredditState: GetPostsFromSubredditState,
      getPostsResponse: GetPostsFromSubredditResponse
    ) => {
      const posts = getPostsResponse.posts;
      const fromSubreddits = getPostsResponse.fromSubreddits;
      if (posts.length === 0) {
        let msg = `Got 0 posts. Trying again in a little bit.`;
        if (getPostsResponse.fromSubreddits.length == 1) {
          msg = `Got 0 posts from ${fromSubreddits[0].displayNamePrefixed}. Trying again in a little bit.`;
        }
        appNotificationDispatch({
          type: AppNotificationsActionType.SUBMIT_APP_NOTIFICATION,
          payload: {
            message: msg,
            displayTimeMS: 10000,
          },
        });
      }
      applyUpdatedStateValues(getPostsFromSubredditState, getPostsResponse);
    },
    [appNotificationDispatch, applyUpdatedStateValues]
  );

  return {
    loadSubscribedSubreddits,
    getPostsForPostRow,
    handleGottenPosts,
  };
}
