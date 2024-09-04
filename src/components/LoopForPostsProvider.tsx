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

type Props = {
  children: ReactNode;
};

const LoopForPostsProvider: FC<Props> = ({ children }) => {
  const redditServiceDispatch = useContext(RedditServiceDispatchContext);
  const { secondsTillGettingNextPosts } = useContext(RedditServiceStateContext);
  const { getPostsForPostRow, handleGottenPosts } = useRedditService();
  const { isGetPostLoopPaused } = useGetPostLoopPaused();

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
      getPostRow().then(() => {
        redditServiceDispatch({
          type: RedditServiceActions.SET_SECONDS_TILL_GETTING_NEXT_POSTS,
          payload: 10,
        });
      });
    }
  }, [getPostRow, redditServiceDispatch, secondsTillGettingNextPosts]);
  return <>{children}</>;
};
export default LoopForPostsProvider;
