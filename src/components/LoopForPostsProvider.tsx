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
import { RedditServiceDispatchContext } from "../context/reddit-service-context.ts";
import useGetPostLoopPaused from "../hook/use-get-post-loop-paused.ts";

type Props = {
  children: ReactNode;
};

const LoopForPostsProvider: FC<Props> = ({ children }) => {
  const redditServiceDispatch = useContext(RedditServiceDispatchContext);

  const redditService = useRedditService();
  const { isGetPostLoopPaused } = useGetPostLoopPaused();

  const loopForPostsAbortControllerRef = useRef<AbortController>();
  const isGetPostLoopPausedRef = useRef(isGetPostLoopPaused);

  useEffect(() => {
    isGetPostLoopPausedRef.current = isGetPostLoopPaused;
  }, [isGetPostLoopPaused]);

  const loopForPosts = useCallback(
    async (abortSignal: AbortSignal) => {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (abortSignal.aborted) {
          break;
        }
        redditServiceDispatch({
          type: RedditServiceActions.SET_SECONDS_TILL_GETTING_NEXT_POSTS,
          payload: 10,
        });
        await new Promise<void>((resolve) =>
          setTimeout(() => resolve(), 10000)
        );
        if (abortSignal.aborted) {
          break;
        }
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
            break;
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
      }
    },
    [redditService, redditServiceDispatch]
  );

  useEffect(() => {
    let abortController = loopForPostsAbortControllerRef.current;
    if (abortController !== undefined) {
      return;
    }
    abortController = new AbortController();
    loopForPostsAbortControllerRef.current = abortController;
    loopForPosts(abortController.signal);
  }, [loopForPosts]);

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
