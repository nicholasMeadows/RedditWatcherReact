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
  const postRowsState = useContext(PostRowsContext);
  const postRowsDispatch = useContext(PostRowsDispatchContext);

  const postRowsToShowInView = useContext(
    AppConfigStateContext
  ).postRowsToShowInView;

  const postRowsDivRef = useRef(null);
  const postRowPageRef = useRef<HTMLDivElement>(null);

  const redditSearchBarFocused = useRef(false);

  const [scrollBarWidth, setScrollBarWidth] = useState(0);

  useEffect(() => {
    const scrollDiv = postRowsDivRef.current as unknown as HTMLDivElement;
    setScrollBarWidth(scrollDiv.offsetWidth - scrollDiv.clientWidth);
  }, [postRowsDivRef, postRowsState.postRows]);

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
  const isLoopingForPostsRef = useRef(false);
  const loopForPostRowsAbortControllerRef = useRef(new AbortController());
  const loopForPostRows = useCallback(async () => {
    isLoopingForPostsRef.current = true;
    while (isLoopingForPostsRef.current) {
      if (loopForPostRowsAbortControllerRef.current.signal.aborted) {
        break;
      }
      await getPostRow();
      sideBarDispatch({
        type: SideBarActionType.SET_SECONDS_TILL_GETTING_NEXT_POSTS,
        payload: 10,
      });
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 10000));
    }
  }, [getPostRow, sideBarDispatch]);
  useEffect(() => {
    const timeout = setTimeout(() => {
      loopForPostRowsAbortControllerRef.current = new AbortController();
      if (!isLoopingForPostsRef.current) {
        loopForPostRows();
      }
    }, 10000);
    const loopForPostRowsAbortController =
      loopForPostRowsAbortControllerRef.current;
    return () => {
      clearTimeout(timeout);
      loopForPostRowsAbortController.abort();
    };
  }, [getPostRow, loopForPostRows]);
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
      >
        {postRowsState.postRows.map((postRow) => (
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
          src={`assets/${
            postRowsState.playPauseButtonIsPaused ? "pause" : "play"
          }_black.png`}
          className={"play-pause-button-img"}
        />
      </div>
    </div>
  );
};

export default PostRowPage;
