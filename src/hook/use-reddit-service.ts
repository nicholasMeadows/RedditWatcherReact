import { useCallback, useContext, useEffect, useRef } from "react";
import RedditServiceContext from "../context/reddit-service-context.ts";
import { AppNotificationsDispatchContext } from "../context/app-notifications-context.ts";
import RedditService from "../service/RedditService.ts";
import {
  GetPostsFromSubredditState,
  GetPostsUpdatedValues,
} from "../model/converter/GetPostsFromSubredditStateConverter.ts";
import { Post } from "../model/Post/Post.ts";
import { Subreddit } from "../model/Subreddit/Subreddit.ts";
import { AppNotificationsActionType } from "../reducer/app-notifications-reducer.ts";
import { v4 as uuidV4 } from "uuid";
import {
  SubredditQueueDispatchContext,
  SubredditQueueStateContext,
} from "../context/sub-reddit-queue-context.ts";
import { AppConfigStateContext } from "../context/app-config-context.ts";
import {
  PostRowsContext,
  PostRowsDispatchContext,
} from "../context/post-rows-context.ts";
import { SideBarDispatchContext } from "../context/side-bar-context.ts";
import { RedditListStateContext } from "../context/reddit-list-context.ts";

export default function useRedditService() {
  const postRows = useContext(PostRowsContext).postRows;
  const getPostRowsPaused = useContext(PostRowsContext).playPauseButtonIsPaused;
  const pauseGetPostsLoop = useContext(PostRowsContext).pauseGetPostsLoop;
  const pauseGetPostsLoopRef = useRef(pauseGetPostsLoop);
  useEffect(() => {
    pauseGetPostsLoopRef.current = pauseGetPostsLoop;
  }, [pauseGetPostsLoop]);
  const sideBarDispatch = useContext(SideBarDispatchContext);

  const postRowsDispatch = useContext(PostRowsDispatchContext);
  const subredditQueueDispatch = useContext(SubredditQueueDispatchContext);

  const subredditLists = useContext(RedditListStateContext).subredditLists;
  const subredditSortOrderOption = useContext(
    AppConfigStateContext
  ).subredditSortOrderOption;
  const userFrontPagePostSortOrderOption = useContext(
    AppConfigStateContext
  ).userFrontPagePostSortOrderOption;
  const contentFiltering = useContext(AppConfigStateContext).contentFiltering;
  const subredditQueue = useContext(SubredditQueueStateContext).subredditQueue;
  const concatRedditUrlMaxLength = useContext(
    AppConfigStateContext
  ).concatRedditUrlMaxLength;
  const postSortOrder = useContext(AppConfigStateContext).postSortOrderOption;
  const topTimeFrame = useContext(AppConfigStateContext).topTimeFrameOption;
  const redditApiItemLimit = useContext(
    AppConfigStateContext
  ).redditApiItemLimit;
  const selectSubredditIterationMethodOption = useContext(
    AppConfigStateContext
  ).selectSubredditIterationMethodOption;
  const sortOrderDirection = useContext(
    AppConfigStateContext
  ).sortOrderDirectionOption;

  const randomIterationSelectWeightOption = useContext(
    AppConfigStateContext
  ).randomIterationSelectWeightOption;
  const selectedSubredditListSortOption = useContext(
    AppConfigStateContext
  ).selectedSubredditListSortOption;
  const redditServiceContextState = useContext(RedditServiceContext);

  const appNotificationsDispatch = useContext(AppNotificationsDispatchContext);
  const redditCredentials = useContext(AppConfigStateContext).redditCredentials;
  const postsToShowInRow = useContext(AppConfigStateContext).postsToShowInRow;

  const getPostRowsPausedRef = useRef<boolean>(false);
  useEffect(() => {
    getPostRowsPausedRef.current = getPostRowsPaused;
  }, [getPostRowsPaused]);

  const createCurrentStateObj = useCallback((): GetPostsFromSubredditState => {
    return JSON.parse(
      JSON.stringify({
        postRows: postRows,
        subredditSortOrderOption: subredditSortOrderOption,
        userFrontPagePostSortOrderOption: userFrontPagePostSortOrderOption,
        contentFiltering: contentFiltering,
        subredditQueue: subredditQueue,
        concatRedditUrlMaxLength: concatRedditUrlMaxLength,
        postSortOrder: postSortOrder,
        topTimeFrame: topTimeFrame,
        redditApiItemLimit: redditApiItemLimit,
        selectSubredditIterationMethodOption:
          selectSubredditIterationMethodOption,
        sortOrderDirection: sortOrderDirection,
        nsfwSubredditIndex:
          redditServiceContextState.nsfwRedditListIndex.current,
        masterSubredditList:
          redditServiceContextState.masterSubscribedSubredditList.current,
        subredditIndex: redditServiceContextState.subredditIndex.current,
        subredditLists: subredditLists,
        lastPostRowWasSortOrderNew:
          redditServiceContextState.lastPostRowWasSortOrderNew.current,
        randomIterationSelectWeightOption: randomIterationSelectWeightOption,
        selectedSubredditListSortOption: selectedSubredditListSortOption,
      })
    );
  }, [
    concatRedditUrlMaxLength,
    contentFiltering,
    postRows,
    postSortOrder,
    randomIterationSelectWeightOption,
    redditApiItemLimit,
    redditServiceContextState.lastPostRowWasSortOrderNew,
    redditServiceContextState.masterSubscribedSubredditList,
    redditServiceContextState.nsfwRedditListIndex,
    redditServiceContextState.subredditIndex,
    selectSubredditIterationMethodOption,
    selectedSubredditListSortOption,
    sortOrderDirection,
    subredditLists,
    subredditQueue,
    subredditSortOrderOption,
    topTimeFrame,
    userFrontPagePostSortOrderOption,
  ]);

  const getPostRow = useCallback(async () => {
    const redditService = new RedditService(redditCredentials);
    const getPostsFromSubredditState: GetPostsFromSubredditState =
      createCurrentStateObj();
    let postsGotten = new Array<Post>();
    let postsFromSubreddits = new Array<Subreddit>();
    const getPostsUpdatedValues: GetPostsUpdatedValues =
      {} as GetPostsUpdatedValues;

    try {
      const { posts, fromSubreddits } = await redditService.getPostsForPostRow(
        getPostsFromSubredditState,
        getPostsUpdatedValues
      );
      postsGotten = posts;
      postsFromSubreddits = fromSubreddits;

      while (pauseGetPostsLoopRef.current) {
        await new Promise<void>((res) => setTimeout(() => res(), 100));
      }

      if (getPostsFromSubredditState.postRows.length == 10) {
        getPostsUpdatedValues.postRowRemoveAt =
          getPostsFromSubredditState.postRows.length - 1;
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
    redditService.addPostRow(
      postsGotten,
      postsFromSubreddits,
      getPostsFromSubredditState,
      getPostsUpdatedValues,
      appNotificationsDispatch
    );
    redditService.applyUpdatedStateValues(
      getPostsUpdatedValues,
      redditServiceContextState.subredditIndex,
      redditServiceContextState.nsfwRedditListIndex,
      redditServiceContextState.lastPostRowWasSortOrderNew,
      subredditQueueDispatch,
      userFrontPagePostSortOrderOption,
      postsToShowInRow,
      postRowsDispatch,
      sideBarDispatch,
      subredditLists
    );
  }, [
    appNotificationsDispatch,
    createCurrentStateObj,
    postRowsDispatch,
    postsToShowInRow,
    redditCredentials,
    redditServiceContextState.lastPostRowWasSortOrderNew,
    redditServiceContextState.nsfwRedditListIndex,
    redditServiceContextState.subredditIndex,
    sideBarDispatch,
    subredditLists,
    subredditQueueDispatch,
    userFrontPagePostSortOrderOption,
  ]);

  return {
    getPostRow: getPostRow,
    createCurrentStateObj: createCurrentStateObj,
  };
}
