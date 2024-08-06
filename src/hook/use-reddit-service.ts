import { useCallback, useContext, useEffect, useRef } from "react";
import RedditClient from "../client/RedditClient.ts";
import { AppConfigStateContext } from "../context/app-config-context.ts";
import {
  RedditServiceDispatchContext,
  RedditServiceStateContext,
} from "../context/reddit-service-context.ts";
import { RedditServiceActions } from "../reducer/reddit-service-reducer.ts";
import { Subreddit } from "../model/Subreddit/Subreddit.ts";
import {
  GetPostsFromSubredditState,
  GetPostsUpdatedValues,
} from "../model/converter/GetPostsFromSubredditStateConverter.ts";
import RedditService from "../service/RedditService.ts";
import {
  PostRowsContext,
  PostRowsDispatchContext,
} from "../context/post-rows-context.ts";
import { RedditListStateContext } from "../context/reddit-list-context.ts";
import {
  SubredditQueueDispatchContext,
  SubredditQueueStateContext,
} from "../context/sub-reddit-queue-context.ts";
import { AppNotificationsDispatchContext } from "../context/app-notifications-context.ts";
import { SideBarDispatchContext } from "../context/side-bar-context.ts";
import { Post } from "../model/Post/Post.ts";
import { AppNotificationsActionType } from "../reducer/app-notifications-reducer.ts";
import { v4 as uuidV4 } from "uuid";

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
  } = useContext(AppConfigStateContext);
  const { subredditLists } = useContext(RedditListStateContext);
  const { subredditQueue } = useContext(SubredditQueueStateContext);
  const {
    masterSubscribedSubredditList,
    subredditIndex,
    nsfwSubredditIndex,
    lastPostRowWasSortOrderNew,
  } = useContext(RedditServiceStateContext);

  const redditServiceDispatch = useContext(RedditServiceDispatchContext);
  const appNotificationsDispatch = useContext(AppNotificationsDispatchContext);

  const subredditQueueDispatch = useContext(SubredditQueueDispatchContext);
  const postRowsDispatch = useContext(PostRowsDispatchContext);
  const sideBarDispatch = useContext(SideBarDispatchContext);
  const { postRows } = useContext(PostRowsContext);
  const getPostsForPostRowAbortControllerRef = useRef<AbortController>();

  const currentGetPostsFromSubredditValues =
    useRef<GetPostsFromSubredditState>();

  useEffect(() => {
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

  const getPostsForPostRow = useCallback(async () => {
    if (getPostsForPostRowAbortControllerRef.current !== undefined) {
      getPostsForPostRowAbortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    getPostsForPostRowAbortControllerRef.current = abortController;

    const getPostsFromSubredditState: GetPostsFromSubredditState = JSON.parse(
      JSON.stringify(currentGetPostsFromSubredditValues.current)
    );
    const getPostsUpdatedValues: GetPostsUpdatedValues =
      {} as GetPostsUpdatedValues;
    const redditService = new RedditService(redditCredentials);
    const { posts, fromSubreddits } = await redditService.getPostsForPostRow(
      getPostsFromSubredditState,
      getPostsUpdatedValues,
      abortController.signal
    );
    return {
      posts: posts,
      fromSubreddits: fromSubreddits,
      getPostsFromSubredditState: getPostsFromSubredditState,
      getPostsUpdatedValues: getPostsUpdatedValues,
    };
  }, [redditCredentials]);

  const handleGottenPosts = useCallback(
    async (
      posts: Array<Post>,
      fromSubreddits: Array<Subreddit>,
      getPostsFromSubredditState: GetPostsFromSubredditState,
      getPostsUpdatedValues: GetPostsUpdatedValues
    ) => {
      const redditService = new RedditService(redditCredentials);
      try {
        if (posts.length != 0) {
          if (getPostsFromSubredditState.postRows.length == 10) {
            getPostsUpdatedValues.postRowRemoveAt =
              getPostsFromSubredditState.postRows.length - 1;
          }
          redditService.addPostRow(
            posts,
            fromSubreddits,
            getPostsFromSubredditState,
            getPostsUpdatedValues,
            appNotificationsDispatch
          );
        } else {
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
        }
      } catch (e) {
        appNotificationsDispatch({
          type: AppNotificationsActionType.SUBMIT_APP_NOTIFICATION,
          payload: {
            notificationUuid: uuidV4(),
            message: `Got exception while trying to get post. ${
              (e as DOMException).message
            }`,
          },
        });
        console.log("Caught exception while getPosts ", e);
      }
      redditService.applyUpdatedStateValues(
        getPostsUpdatedValues,
        subredditQueueDispatch,
        postsToShowInRow,
        postRowsDispatch,
        sideBarDispatch,
        subredditLists,
        getPostsFromSubredditState.subredditSourceOption,
        redditServiceDispatch
      );
    },
    [
      appNotificationsDispatch,
      postRowsDispatch,
      postsToShowInRow,
      redditCredentials,
      redditServiceDispatch,
      sideBarDispatch,
      subredditLists,
      subredditQueueDispatch,
    ]
  );

  return {
    loadSubscribedSubreddits,
    getPostsForPostRow,
    handleGottenPosts,
  };
}
