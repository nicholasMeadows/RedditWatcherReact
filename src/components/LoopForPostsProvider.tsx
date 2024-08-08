import {
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import useRedditService from "../hook/use-reddit-service.ts";
import { PostRowsContext } from "../context/post-rows-context.ts";
import { SideBarDispatchContext } from "../context/side-bar-context.ts";
import { SideBarActionType } from "../reducer/side-bar-reducer.ts";

type Props = {
  children: ReactNode;
};

const LoopForPostsProvider: FC<Props> = ({ children }) => {
  const { scrollY, mouseOverAPostRow } = useContext(PostRowsContext);
  const sideBarDispatch = useContext(SideBarDispatchContext);

  const redditService = useRedditService();

  const loopingForPostRow = useRef(false);

  const scrollYRef = useRef(scrollY);
  const mouseOverAPostRowRef = useRef(mouseOverAPostRow);

  useEffect(() => {
    scrollYRef.current = scrollY;
    mouseOverAPostRowRef.current = mouseOverAPostRow;
  }, [mouseOverAPostRow, scrollY]);

  const loopForPosts = useCallback(async () => {
    if (loopingForPostRow.current) {
      return;
    }
    loopingForPostRow.current = true;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      sideBarDispatch({
        type: SideBarActionType.SET_SECONDS_TILL_GETTING_NEXT_POSTS,
        payload: 10,
      });
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 10000));
      try {
        const getPostsResposne = await redditService.getPostsForPostRow();
        while (scrollYRef.current !== 0 || mouseOverAPostRowRef.current) {
          await new Promise<void>((resolve) =>
            setTimeout(() => resolve(), 100)
          );
        }
        redditService.handleGottenPosts(
          getPostsResposne.getPostsFromSubredditState,
          getPostsResposne.getPostsFromSubredditResponse
        );
      } catch (error) {
        console.log(
          "Caught error while fetching posts for first post row",
          error
        );
      }
    }
  }, [redditService]);

  useEffect(() => {
    loopForPosts();
  }, [loopForPosts]);
  return <>{children}</>;
};
export default LoopForPostsProvider;
