import {
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import {
  RedditServiceDispatchContext,
  RedditServiceStateContext,
} from "../context/reddit-service-context.ts";
import { RedditServiceActions } from "../reducer/reddit-service-reducer.ts";
import useRedditService from "../hook/use-reddit-service.ts";
import useGetPostLoopPaused from "../hook/use-get-post-loop-paused.ts";
import { AppConfigStateContext } from "../context/app-config-context.ts";
import { CountdownTimerOnCLickContext } from "../page/PostRowPage.tsx";

type Props = {
  children: ReactNode;
};

const LoopForPostsProvider: FC<Props> = ({ children }) => {
  const redditServiceDispatch = useContext(RedditServiceDispatchContext);
  const { secondsTillGettingNextPosts } = useContext(RedditServiceStateContext);
  const { getPostsForPostRow, handleGottenPosts } = useRedditService();
  const { isGetPostLoopPaused } = useGetPostLoopPaused();

  const { getPostRowIterationTime } = useContext(AppConfigStateContext);
  const { onCountdownClickRef } = useContext(CountdownTimerOnCLickContext);

  const isGetPostLoopPausedRef = useRef(isGetPostLoopPaused);

  useEffect(() => {
    isGetPostLoopPausedRef.current = isGetPostLoopPaused;
  }, [isGetPostLoopPaused]);

  const getPostRow = useCallback(async () => {
    try {
      const getPostsResponse = await getPostsForPostRow();
      while (isGetPostLoopPausedRef.current) {
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 100));
      }
      handleGottenPosts(
        getPostsResponse.getPostsFromSubredditState,
        getPostsResponse.getPostsFromSubredditResponse
      );
    } catch (error) {
      console.log(
        "Caught error while fetching posts for first post row",
        error
      );
    }
  }, [getPostsForPostRow, handleGottenPosts]);

  const getPostRowAndResetCounter = useCallback(() => {
    getPostRow().then(() => {
      redditServiceDispatch({
        type: RedditServiceActions.SET_SECONDS_TILL_GETTING_NEXT_POSTS,
        payload: getPostRowIterationTime,
      });
    });
  }, [getPostRow, getPostRowIterationTime, redditServiceDispatch]);

  useEffect(() => {
    if (secondsTillGettingNextPosts > 0) {
      const timeout = setTimeout(() => {
        redditServiceDispatch({
          type: RedditServiceActions.SET_SECONDS_TILL_GETTING_NEXT_POSTS,
          payload: secondsTillGettingNextPosts - 1,
        });
      }, 1000);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [redditServiceDispatch, secondsTillGettingNextPosts]);

  useEffect(() => {
    if (secondsTillGettingNextPosts === 0) {
      getPostRowAndResetCounter();
    }
  }, [
    getPostRow,
    getPostRowIterationTime,
    redditServiceDispatch,
    secondsTillGettingNextPosts,
  ]);
  onCountdownClickRef.current = getPostRowAndResetCounter;
  return <>{children}</>;
};
export default LoopForPostsProvider;
