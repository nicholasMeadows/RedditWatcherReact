import {
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import useRedditService from "../hook/use-reddit-service.ts";
import { RedditServiceActions } from "../reducer/reddit-service-reducer.ts";
import {
  RedditServiceDispatchContext,
  RedditServiceStateContext,
} from "../context/reddit-service-context.ts";
import useGetPostLoopPaused from "../hook/use-get-post-loop-paused.ts";

type Props = {
  children: ReactNode;
};

const LoopForPostsProvider: FC<Props> = ({ children }) => {
  const redditServiceDispatch = useContext(RedditServiceDispatchContext);
  const { secondsTillGettingNextPosts } = useContext(RedditServiceStateContext);
  const redditService = useRedditService();
  const { isGetPostLoopPaused } = useGetPostLoopPaused();

  const loopForPostsAbortControllerRef = useRef<AbortController>();
  const isGetPostLoopPausedRef = useRef(isGetPostLoopPaused);

  useEffect(() => {
    isGetPostLoopPausedRef.current = isGetPostLoopPaused;
  }, [isGetPostLoopPaused]);

  const getPostRow = useCallback(
    async (abortSignal: AbortSignal) => {
      try {
        const getPostsResponse = await redditService.getPostsForPostRow(
          abortSignal
        );
        while (isGetPostLoopPausedRef.current) {
          await new Promise<void>((resolve) =>
            setTimeout(() => resolve(), 100)
          );
        }
        if (abortSignal.aborted) {
          return;
        }
        redditService.handleGottenPosts(
          getPostsResponse.getPostsFromSubredditState,
          getPostsResponse.getPostsFromSubredditResponse
        );
      } catch (error) {
        console.log(
          "Caught error while fetching posts for first post row",
          error
        );
      }
      redditServiceDispatch({
        type: RedditServiceActions.SET_SECONDS_TILL_GETTING_NEXT_POSTS,
        payload: 10,
      });
    },
    [redditService, redditServiceDispatch]
  );

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
    } else {
      const abortController = new AbortController();
      loopForPostsAbortControllerRef.current = abortController;
      getPostRow(abortController.signal);
    }
  }, [getPostRow, redditServiceDispatch, secondsTillGettingNextPosts]);

  useEffect(() => {
    const loopForPostsAbortController = loopForPostsAbortControllerRef.current;
    return () => {
      if (loopForPostsAbortController !== undefined) {
        loopForPostsAbortController.abort();
        loopForPostsAbortControllerRef.current = undefined;
      }
    };
  }, []);
  return <>{children}</>;
};
export default LoopForPostsProvider;
