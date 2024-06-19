import { useCallback, useContext, useEffect, useRef } from "react";
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
  PostRowsContext,
  PostRowsDispatchContext,
} from "../context/post-rows-context.ts";
import { SideBarDispatchContext } from "../context/side-bar-context.ts";
import {
  SubredditQueueDispatchContext,
  SubredditQueueStateContext,
} from "../context/sub-reddit-queue-context.ts";
import { RedditListStateContext } from "../context/reddit-list-context.ts";
import { AppConfigStateContext } from "../context/app-config-context.ts";
import RedditServiceContext from "../context/reddit-service-context.ts";
import { AppNotificationsDispatchContext } from "../context/app-notifications-context.ts";

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
  const redditCredentialsRef = useRef(redditCredentials);
  const postRowsRef = useRef(postRows);
  const subredditSortOrderOptionRef = useRef(subredditSortOrderOption);
  const userFrontPagePostSortOrderOptionRef = useRef(
    userFrontPagePostSortOrderOption
  );
  const contentFilteringRef = useRef(contentFiltering);
  const subredditQueueRef = useRef(subredditQueue);
  const concatRedditUrlMaxLengthRef = useRef(concatRedditUrlMaxLength);
  const postSortOrderRef = useRef(postSortOrder);
  const topTimeFrameRef = useRef(topTimeFrame);
  const redditApiItemLimitRef = useRef(redditApiItemLimit);
  const selectSubredditIterationMethodOptionRef = useRef(
    selectSubredditIterationMethodOption
  );
  const sortOrderDirectionRef = useRef(sortOrderDirection);
  const subredditListsRef = useRef(subredditLists);
  const randomIterationSelectWeightOptionRef = useRef(
    randomIterationSelectWeightOption
  );
  const selectedSubredditListSortOptionRef = useRef(
    selectedSubredditListSortOption
  );
  const postsToShowInRowRef = useRef(postsToShowInRow);

  useEffect(() => {
    getPostRowsPausedRef.current = getPostRowsPaused;
    redditCredentialsRef.current = redditCredentials;
    postRowsRef.current = postRows;
    subredditSortOrderOptionRef.current = subredditSortOrderOption;
    userFrontPagePostSortOrderOptionRef.current =
      userFrontPagePostSortOrderOption;
    contentFilteringRef.current = contentFiltering;
    subredditQueueRef.current = subredditQueue;
    concatRedditUrlMaxLengthRef.current = concatRedditUrlMaxLength;
    postSortOrderRef.current = postSortOrder;
    topTimeFrameRef.current = topTimeFrame;
    redditApiItemLimitRef.current = redditApiItemLimit;
    selectSubredditIterationMethodOptionRef.current =
      selectSubredditIterationMethodOption;
    sortOrderDirectionRef.current = sortOrderDirection;
    subredditListsRef.current = subredditLists;
    randomIterationSelectWeightOptionRef.current =
      randomIterationSelectWeightOption;
    selectedSubredditListSortOptionRef.current =
      selectedSubredditListSortOption;
    postsToShowInRowRef.current = postsToShowInRow;
  }, [
    concatRedditUrlMaxLength,
    contentFiltering,
    getPostRowsPaused,
    postRows,
    postSortOrder,
    postsToShowInRow,
    randomIterationSelectWeightOption,
    redditApiItemLimit,
    redditCredentials,
    selectSubredditIterationMethodOption,
    selectedSubredditListSortOption,
    sortOrderDirection,
    subredditLists,
    subredditQueue,
    subredditSortOrderOption,
    topTimeFrame,
    userFrontPagePostSortOrderOption,
  ]);

  const createCurrentStateObj = useCallback((): GetPostsFromSubredditState => {
    return JSON.parse(
      JSON.stringify({
        postRows: postRowsRef.current,
        subredditSortOrderOption: subredditSortOrderOptionRef.current,
        userFrontPagePostSortOrderOption:
          userFrontPagePostSortOrderOptionRef.current,
        contentFiltering: contentFilteringRef.current,
        subredditQueue: subredditQueueRef.current,
        concatRedditUrlMaxLength: concatRedditUrlMaxLengthRef.current,
        postSortOrder: postSortOrderRef.current,
        topTimeFrame: topTimeFrameRef.current,
        redditApiItemLimit: redditApiItemLimitRef.current,
        selectSubredditIterationMethodOption:
          selectSubredditIterationMethodOptionRef.current,
        sortOrderDirection: sortOrderDirectionRef.current,
        nsfwSubredditIndex:
          redditServiceContextState.nsfwRedditListIndex.current,
        masterSubredditList:
          redditServiceContextState.masterSubscribedSubredditList.current,
        subredditIndex: redditServiceContextState.subredditIndex.current,
        subredditLists: subredditListsRef.current,
        lastPostRowWasSortOrderNew:
          redditServiceContextState.lastPostRowWasSortOrderNew.current,
        randomIterationSelectWeightOption:
          randomIterationSelectWeightOptionRef.current,
        selectedSubredditListSortOption:
          selectedSubredditListSortOptionRef.current,
      })
    );
  }, [
    redditServiceContextState.lastPostRowWasSortOrderNew,
    redditServiceContextState.masterSubscribedSubredditList,
    redditServiceContextState.nsfwRedditListIndex,
    redditServiceContextState.subredditIndex,
  ]);

  const getPostRow = useCallback(
    async (abortController: AbortController) => {
      const redditService = new RedditService(redditCredentialsRef.current);
      const getPostsFromSubredditState: GetPostsFromSubredditState =
        createCurrentStateObj();
      if (abortController.signal.aborted) return;
      let postsGotten = new Array<Post>();
      let postsFromSubreddits = new Array<Subreddit>();
      const getPostsUpdatedValues: GetPostsUpdatedValues =
        {} as GetPostsUpdatedValues;

      try {
        const { posts, fromSubreddits } =
          await redditService.getPostsForPostRow(
            getPostsFromSubredditState,
            getPostsUpdatedValues
          );
        if (abortController.signal.aborted) return;
        postsGotten = posts;
        postsFromSubreddits = fromSubreddits;

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
        while (pauseGetPostsLoopRef.current) {
          await new Promise<void>((res) => setTimeout(() => res(), 100));
        }
        if (abortController.signal.aborted) return;
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
      if (abortController.signal.aborted) return;
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
        userFrontPagePostSortOrderOptionRef.current,
        postsToShowInRowRef.current,
        postRowsDispatch,
        sideBarDispatch,
        subredditListsRef.current
      );
    },
    [
      appNotificationsDispatch,
      createCurrentStateObj,
      postRowsDispatch,
      redditServiceContextState.lastPostRowWasSortOrderNew,
      redditServiceContextState.nsfwRedditListIndex,
      redditServiceContextState.subredditIndex,
      sideBarDispatch,
      subredditQueueDispatch,
    ]
  );

  return {
    getPostRow: getPostRow,
    createCurrentStateObj: createCurrentStateObj,
  };
}
