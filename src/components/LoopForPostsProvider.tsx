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
import useGetPostLoopPaused from "../hook/use-get-post-loop-paused.ts";
import { AppConfigStateContext } from "../context/app-config-context.ts";
import { CountdownTimerOnCLickContext } from "../page/PostRowPage.tsx";
import useReddit from "../hook/use-reddit.ts";

type Props = {
  children: ReactNode;
};

const LoopForPostsProvider: FC<Props> = ({ children }) => {
  const redditServiceDispatch = useContext(RedditServiceDispatchContext);
  const { secondsTillGettingNextPosts, isGettingPosts } = useContext(RedditServiceStateContext);
  const { getPostsForPostRow, applyUpdatedStateValues } = useReddit();
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
      applyUpdatedStateValues(getPostsResponse);
    } catch (error) {
      console.log(
        "Caught error while fetching posts for post row",
        error
      );
    }
  }, [getPostsForPostRow, applyUpdatedStateValues]);

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
  }, [getPostRow, getPostRowAndResetCounter, getPostRowIterationTime, redditServiceDispatch, secondsTillGettingNextPosts]);
  onCountdownClickRef.current = () => {
    if(!isGettingPosts) {
      getPostRowAndResetCounter()
    }
  };
  return <>{children}</>;
};
export default LoopForPostsProvider;
