import store, { useAppSelector } from "../redux/store.ts";
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
import { WaitUtil } from "../util/WaitUtil.ts";
import { AppNotificationsActionType } from "../reducer/app-notifications-reducer.ts";
import { v4 as uuidV4 } from "uuid";
import { PostRow } from "../model/PostRow.ts";
import {
  SubredditQueueDispatchContext,
  SubredditQueueStateContext,
} from "../context/sub-reddit-queue-context.ts";

export default function useRedditService() {
  const postRowsRef = useRef<Array<PostRow>>([]);
  const postRows = useAppSelector((state) => state.postRows.postRows);
  useEffect(() => {
    postRowsRef.current = postRows;
  }, [postRows]);

  const subredditQueueDispatch = useContext(SubredditQueueDispatchContext);

  const subredditLists = useAppSelector(
    (state) => state.redditLists.subredditLists
  );
  const subredditSortOrderOption = useAppSelector(
    (state) => state.appConfig.subredditSortOrderOption
  );
  const userFrontPagePostSortOrderOption = useAppSelector(
    (state) => state.appConfig.userFrontPagePostSortOrderOption
  );
  const contentFiltering = useAppSelector(
    (state) => state.appConfig.contentFiltering
  );
  const subredditQueue = useContext(SubredditQueueStateContext).subredditQueue;
  const concatRedditUrlMaxLength = useAppSelector(
    (state) => state.appConfig.concatRedditUrlMaxLength
  );
  const postSortOrder = useAppSelector(
    (state) => state.appConfig.postSortOrderOption
  );
  const topTimeFrame = useAppSelector(
    (state) => state.appConfig.topTimeFrameOption
  );
  const redditApiItemLimit = useAppSelector(
    (state) => state.appConfig.redditApiItemLimit
  );
  const selectSubredditIterationMethodOption = useAppSelector(
    (state) => state.appConfig.selectSubredditIterationMethodOption
  );
  const sortOrderDirection = useAppSelector(
    (state) => state.appConfig.sortOrderDirectionOption
  );

  const randomIterationSelectWeightOption = useAppSelector(
    (state) => state.appConfig.randomIterationSelectWeightOption
  );
  const selectedSubredditListSortOption = useAppSelector(
    (state) => state.appConfig.selectedSubredditListSortOption
  );
  const redditServiceContextState = useContext(RedditServiceContext);

  const appNotificationsDispatch = useContext(AppNotificationsDispatchContext);
  const getPostRow = useCallback(async () => {
    const redditService = new RedditService();
    const getPostsFromSubredditState: GetPostsFromSubredditState = JSON.parse(
      JSON.stringify({
        postRows: postRowsRef.current,
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
    let postsGotten = new Array<Post>();
    let postsFromSubreddits = new Array<Subreddit>();
    const getPostsUpdatedValues: GetPostsUpdatedValues =
      {} as GetPostsUpdatedValues;

    try {
      if (getPostsFromSubredditState.postRows.length == 0) {
        while (postsGotten.length == 0) {
          const { posts, fromSubreddits } =
            await redditService.getPostsForPostRow(
              getPostsFromSubredditState,
              getPostsUpdatedValues
            );
          if (postsGotten.length == 0) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
          postsGotten = posts;
          postsFromSubreddits = fromSubreddits;
        }
      } else {
        const { posts, fromSubreddits } =
          await redditService.getPostsForPostRow(
            getPostsFromSubredditState,
            getPostsUpdatedValues
          );
        postsGotten = posts;
        postsFromSubreddits = fromSubreddits;
      }
      await WaitUtil.WaitUntilGetPostsIsNotPaused(
        () => store.getState().postRows.getPostRowsPaused
      );

      if (postRowsRef.current.length == 10) {
        getPostsUpdatedValues.postRowRemoveAt = postRowsRef.current.length - 1;
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
      subredditQueueDispatch
    );
  }, [
    appNotificationsDispatch,
    concatRedditUrlMaxLength,
    contentFiltering,
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
    subredditQueueDispatch,
    subredditSortOrderOption,
    topTimeFrame,
    userFrontPagePostSortOrderOption,
  ]);

  return {
    getPostRow: getPostRow,
  };
}
