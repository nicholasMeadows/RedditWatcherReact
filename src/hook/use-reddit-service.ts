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
  GetPostsFromSubredditResponse,
  GetPostsFromSubredditState,
} from "../model/converter/GetPostsFromSubredditStateConverter.ts";
import {
  PostRowsContext,
  PostRowsDispatchContext,
} from "../context/post-rows-context.ts";
import { RedditListStateContext } from "../context/reddit-list-context.ts";
import {
  SubredditQueueDispatchContext,
  SubredditQueueStateContext,
} from "../context/sub-reddit-queue-context.ts";
import { SideBarDispatchContext } from "../context/side-bar-context.ts";
import RedditService from "../service/RedditService.ts";
import SubredditSourceOptionsEnum from "../model/config/enums/SubredditSourceOptionsEnum.ts";
import PostSortOrderOptionsEnum from "../model/config/enums/PostSortOrderOptionsEnum.ts";
import { sortPostsByCreate } from "../util/RedditServiceUtil.ts";
import { SubredditQueueActionType } from "../reducer/sub-reddit-queue-reducer.ts";
import { SideBarActionType } from "../reducer/side-bar-reducer.ts";
import { PostRowsActionType } from "../reducer/post-rows-reducer.ts";
import { AppNotificationsDispatchContext } from "../context/app-notifications-context.ts";
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

  const subredditQueueDispatch = useContext(SubredditQueueDispatchContext);
  const postRowsDispatch = useContext(PostRowsDispatchContext);
  const sideBarDispatch = useContext(SideBarDispatchContext);
  const appNotificationDispatch = useContext(AppNotificationsDispatchContext);
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

  const getPostsForPostRow = useCallback(async (): Promise<{
    getPostsFromSubredditResponse: GetPostsFromSubredditResponse;
    getPostsFromSubredditState: GetPostsFromSubredditState;
  }> => {
    if (getPostsForPostRowAbortControllerRef.current !== undefined) {
      getPostsForPostRowAbortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    getPostsForPostRowAbortControllerRef.current = abortController;
    const getPostsFromSubredditState: GetPostsFromSubredditState = JSON.parse(
      JSON.stringify(currentGetPostsFromSubredditValues.current)
    );
    const redditService = new RedditService(redditCredentials);
    return new Promise<{
      getPostsFromSubredditResponse: GetPostsFromSubredditResponse;
      getPostsFromSubredditState: GetPostsFromSubredditState;
    }>((resolve, reject) => {
      abortController.signal.addEventListener("abort", () => reject());
      redditService
        .getPostsForPostRow(getPostsFromSubredditState)
        .then((response) => {
          resolve({
            getPostsFromSubredditResponse: response,
            getPostsFromSubredditState: getPostsFromSubredditState,
          });
        })
        .catch((err) => reject(err));
    });
  }, [redditCredentials]);

  const applyUpdatedStateValues = useCallback(
    (
      getPostsFromSubredditState: GetPostsFromSubredditState,
      getPostsResponse: GetPostsFromSubredditResponse
    ) => {
      if (getPostsResponse.subredditQueueItemToRemove != undefined) {
        subredditQueueDispatch({
          type: SubredditQueueActionType.REMOVE_SUBREDDIT_QUEUE_ITEM,
          payload: getPostsResponse.subredditQueueItemToRemove,
        });
      }
      if (getPostsResponse.mostRecentSubredditGotten != undefined) {
        sideBarDispatch({
          type: SideBarActionType.SET_MOST_RECENT_SUBREDDIT_GOTTEN,
          payload: getPostsResponse.mostRecentSubredditGotten,
        });
      }
      if (getPostsResponse.postRowRemoveAt != undefined) {
        postRowsDispatch({
          type: PostRowsActionType.POST_ROW_REMOVE_AT,
          payload: getPostsResponse.postRowRemoveAt,
        });
      }
      if (getPostsResponse.subredditsToShowInSideBar != undefined) {
        sideBarDispatch({
          type: SideBarActionType.SET_SUBREDDITS_TO_SHOW_IN_SIDEBAR,
          payload: {
            subreddits: getPostsResponse.subredditsToShowInSideBar,
            subredditLists: subredditLists,
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
      if (getPostsResponse.lastPostRowWasSortOrderNew != undefined) {
        redditServiceDispatch({
          type: RedditServiceActions.SET_LAST_POST_ROW_WAS_SORT_ORDER_NEW,
          payload: getPostsResponse.lastPostRowWasSortOrderNew,
        });
      }
      if (getPostsResponse.createPostRowAndInsertAtBeginning != undefined) {
        postRowsDispatch({
          type: PostRowsActionType.CREATE_POST_ROW_AND_INSERT_AT_BEGINNING,
          payload: {
            posts: getPostsResponse.createPostRowAndInsertAtBeginning,
            postsToShowInRow: postsToShowInRow,
            subredditSourceOption:
              getPostsFromSubredditState.subredditSourceOption,
          },
        });
      }
      if (getPostsResponse.shiftPostsAndUiPosts != undefined) {
        postRowsDispatch({
          type: PostRowsActionType.ADD_POSTS_TO_FRONT_OF_ROW,
          payload: {
            postRowUuid: getPostsResponse.shiftPostsAndUiPosts.postRowUuid,
            posts: getPostsResponse.shiftPostsAndUiPosts.posts,
            postsToShowInRow: postsToShowInRow,
            subredditSourceOption:
              getPostsFromSubredditState.subredditSourceOption,
          },
        });
      }
    },
    [
      postRowsDispatch,
      postsToShowInRow,
      redditServiceDispatch,
      sideBarDispatch,
      subredditLists,
      subredditQueueDispatch,
    ]
  );

  const addPostRow = useCallback(
    (
      getPostsResponse: GetPostsFromSubredditResponse,
      getPostsFromSubredditsState: GetPostsFromSubredditState
    ) => {
      const postRows = getPostsFromSubredditsState.postRows;
      const lastPostRowWasSortOrderNew =
        getPostsFromSubredditsState.lastPostRowWasSortOrderNew;

      let posts = getPostsResponse.posts;

      if (posts.length == 0) {
        return;
      }
      if (
        getPostsFromSubredditsState.subredditSourceOption ===
          SubredditSourceOptionsEnum.FrontPage &&
        getPostsFromSubredditsState.postSortOrder ===
          PostSortOrderOptionsEnum.New
      ) {
        posts = sortPostsByCreate(posts);
        if (postRows.length === 0) {
          getPostsResponse.createPostRowAndInsertAtBeginning = posts;
          getPostsResponse.lastPostRowWasSortOrderNew = true;
        } else {
          const firstPostRow = postRows[0];
          const mostRecentPost = firstPostRow.posts[0];
          const mostRecentPostCreated = mostRecentPost.created;
          const postsToAddToViewModel = posts.filter((post) => {
            return post.created > mostRecentPostCreated;
          });
          if (lastPostRowWasSortOrderNew) {
            getPostsResponse.shiftPostsAndUiPosts = {
              postRowUuid: firstPostRow.postRowUuid,
              posts: postsToAddToViewModel,
            };
          } else {
            getPostsResponse.createPostRowAndInsertAtBeginning =
              postsToAddToViewModel;
          }
          getPostsResponse.lastPostRowWasSortOrderNew = true;
        }
      } else {
        getPostsResponse.createPostRowAndInsertAtBeginning = posts;
        getPostsResponse.lastPostRowWasSortOrderNew = false;
      }
    },
    []
  );

  const handleGottenPosts = useCallback(
    async (
      getPostsFromSubredditState: GetPostsFromSubredditState,
      getPostsResponse: GetPostsFromSubredditResponse
    ) => {
      const posts = getPostsResponse.posts;
      const fromSubreddits = getPostsResponse.fromSubreddits;
      if (posts.length > 0) {
        if (getPostsFromSubredditState.postRows.length == 10) {
          getPostsResponse.postRowRemoveAt =
            getPostsFromSubredditState.postRows.length - 1;
        }
        addPostRow(getPostsResponse, getPostsFromSubredditState);
      } else {
        let msg = `Got 0 posts. Trying again in a little bit.`;
        if (getPostsResponse.fromSubreddits.length == 1) {
          msg = `Got 0 posts from ${fromSubreddits[0].displayNamePrefixed}. Trying again in a little bit.`;
        }
        appNotificationDispatch({
          type: AppNotificationsActionType.SUBMIT_APP_NOTIFICATION,
          payload: {
            message: msg,
            displayTimeMS: 10000,
            notificationUuid: uuidV4(),
          },
        });
        console.log(msg);
      }

      applyUpdatedStateValues(getPostsFromSubredditState, getPostsResponse);
    },
    [addPostRow, appNotificationDispatch, applyUpdatedStateValues]
  );

  return {
    loadSubscribedSubreddits,
    getPostsForPostRow,
    handleGottenPosts,
  };
}
