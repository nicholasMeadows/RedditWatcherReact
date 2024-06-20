import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import SideBar from "../components/SideBar.tsx";
import PostRow from "../components/PostRow.tsx";
import "../theme/post-row-page.scss";
import { AppConfigStateContext } from "../context/app-config-context.ts";
import {
  PostRowsContext,
  PostRowsDispatchContext,
} from "../context/post-rows-context.ts";
import { PostRowsActionType } from "../reducer/post-rows-reducer.ts";
import { SideBarDispatchContext } from "../context/side-bar-context.ts";
import useRedditService from "../hook/use-reddit-service.ts";
import { SideBarActionType } from "../reducer/side-bar-reducer.ts";

const PostRowPage: FC = () => {
  const sideBarDispatch = useContext(SideBarDispatchContext);
  const postRows = useContext(PostRowsContext).postRows;
  const pauseGetPostsLoop = useContext(PostRowsContext).pauseGetPostsLoop;
  const postRowsDispatch = useContext(PostRowsDispatchContext);

  const postRowsToShowInView = useContext(
    AppConfigStateContext
  ).postRowsToShowInView;

  const postRowsDivRef = useRef(null);
  const postRowPageRef = useRef<HTMLDivElement>(null);

  const redditSearchBarFocused = useRef(false);

  const mouseDownOnPostRowDiv = useRef(false);
  const lastMouseDownY = useRef(0);
  const totalMoveY = useRef(0);

  const [scrollBarWidth, setScrollBarWidth] = useState(0);

  useEffect(() => {
    const scrollDiv = postRowsDivRef.current as unknown as HTMLDivElement;
    setScrollBarWidth(scrollDiv.offsetWidth - scrollDiv.clientWidth);
  }, [postRowsDivRef, postRows]);

  useEffect(() => {
    const postRowPage = postRowPageRef.current;
    if (postRowPage === null) {
      return;
    }
    const documentKeyUpEvent = (keyboardEvent: globalThis.KeyboardEvent) => {
      const key = keyboardEvent.key;
      if (key == " " && !redditSearchBarFocused.current) {
        postRowsDispatch({
          type: PostRowsActionType.TOGGLE_PLAY_PAUSE_BUTTON,
        });
      }
    };

    postRowPage.addEventListener("keyup", documentKeyUpEvent);
    return () => {
      postRowPage.removeEventListener("keyup", documentKeyUpEvent);
    };
  }, [postRowsDispatch]);

  const { getPostRow } = useRedditService();
  const getPostsAbortController = useRef(new AbortController());

  const startLoopingForPosts = useCallback(
    async (abortController: AbortController) => {
      while (!abortController.signal.aborted) {
        await new Promise<void>((resolve) => {
          if (abortController.signal.aborted) resolve();
          const timeout = setTimeout(() => resolve(), 10000);
          abortController.signal.onabort = () => {
            clearTimeout(timeout);
            resolve();
          };
        });
        if (abortController.signal.aborted) break;
        await getPostRow(abortController);
        sideBarDispatch({
          type: SideBarActionType.SET_SECONDS_TILL_GETTING_NEXT_POSTS,
          payload: 10,
        });
      }
    },
    [getPostRow, sideBarDispatch]
  );

  useEffect(() => {
    if (!getPostsAbortController.current.signal.aborted) {
      getPostsAbortController.current.abort();
    }
    const abortController = new AbortController();
    getPostsAbortController.current = abortController;
    startLoopingForPosts(getPostsAbortController.current);
    return () => {
      abortController.abort();
    };
  }, [startLoopingForPosts]);

  return (
    <div className="post-row-page" ref={postRowPageRef}>
      <div
        className="post-rows-side-bar-div"
        style={{
          right: `${scrollBarWidth}px`,
        }}
      >
        <SideBar
          onRedditSearchBarFocus={() => (redditSearchBarFocused.current = true)}
          onRedditSearchBarBlur={() => (redditSearchBarFocused.current = false)}
        />
      </div>
      <div
        className="post-rows-div"
        ref={postRowsDivRef}
        onScroll={(event) => {
          const target = event.target as HTMLElement;
          postRowsDispatch({
            type: PostRowsActionType.SET_SCROLL_Y,
            payload: target.scrollTop,
          });
        }}
        onMouseDown={(event) => {
          totalMoveY.current = 0;
          lastMouseDownY.current = event.clientY;
          mouseDownOnPostRowDiv.current = true;
        }}
        onMouseUp={() => {
          lastMouseDownY.current = 0;
          mouseDownOnPostRowDiv.current = false;
        }}
        onMouseLeave={() => {
          totalMoveY.current = 0;
          lastMouseDownY.current = 0;
          mouseDownOnPostRowDiv.current = false;
        }}
        onMouseMove={(event) => {
          if (mouseDownOnPostRowDiv.current) {
            const deltaY = lastMouseDownY.current - event.clientY;
            totalMoveY.current += Math.abs(deltaY);
            const postRowDiv = event.currentTarget as HTMLDivElement;
            postRowDiv.scrollBy({ top: deltaY });
            lastMouseDownY.current = event.clientY;
          }
        }}
        onClickCapture={(event) => {
          console.log(totalMoveY.current);
          if (totalMoveY.current >= 20) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
      >
        {postRows.map((postRow) => (
          <div
            key={"post-row-" + postRow.postRowUuid}
            style={{
              height: `calc(100%/${postRowsToShowInView})`,
              maxHeight: `calc(100%/${postRowsToShowInView})`,
            }}
          >
            <PostRow postRow={postRow} />
          </div>
        ))}
      </div>

      <div
        className={"play-pause-button-div"}
        onClick={() => {
          postRowsDispatch({
            type: PostRowsActionType.TOGGLE_PLAY_PAUSE_BUTTON,
          });
        }}
      >
        <img
          src={`assets/${pauseGetPostsLoop ? "pause" : "play"}_black.png`}
          className={"play-pause-button-img"}
        />
      </div>
    </div>
  );
};

export default PostRowPage;
