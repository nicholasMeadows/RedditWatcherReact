import { useCallback, useContext, useEffect, useRef, useState } from "react";
import SideBar from "../components/SideBar.tsx";
import PostRow from "../components/PostRow.tsx";
import "../theme/post-row-page.scss";
import useRedditService from "../hook/use-reddit-service.ts";
import { AppConfigStateContext } from "../context/app-config-context.ts";
import {
  PostRowsContext,
  PostRowsDispatchContext,
} from "../context/post-rows-context.ts";
import { PostRowsActionType } from "../reducer/post-rows-reducer.ts";
import { SideBarDispatchContext } from "../context/side-bar-context.ts";
import { SideBarActionType } from "../reducer/side-bar-reducer.ts";

const PostRowPage: React.FC = () => {
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
          type: PostRowsActionType.TOGGLE_CLICKED_ON_PLAY_PAUSE_BUTTON,
        });
      }
    };

    postRowPage.addEventListener("keyup", documentKeyUpEvent);
    return () => {
      postRowPage.removeEventListener("keyup", documentKeyUpEvent);
    };
  }, []);

  const { getPostRow } = useRedditService();
  const getPostRowIntervalRef = useRef<NodeJS.Timeout>();
  const clearGetPostRowInterval = useCallback(() => {
    if (getPostRowIntervalRef.current !== undefined) {
      clearInterval(getPostRowIntervalRef.current);
      getPostRowIntervalRef.current = undefined;
    }
  }, []);
  useEffect(() => {
    const timeout = setTimeout(() => {
      clearGetPostRowInterval();
      getPostRowIntervalRef.current = setInterval(() => {
        getPostRow();
        sideBarDispatch({
          type: SideBarActionType.SET_SECONDS_TILL_GETTING_NEXT_POSTS,
          payload: 10,
        });
      }, 10000);
    }, 250);
    return () => {
      clearTimeout(timeout);
      clearGetPostRowInterval();
    };
  }, [clearGetPostRowInterval, getPostRow]);

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
          const scrollTop = target.scrollTop;
          postRowsDispatch({
            type: PostRowsActionType.SET_SCROLL_Y,
            payload: scrollTop,
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
            type: PostRowsActionType.TOGGLE_CLICKED_ON_PLAY_PAUSE_BUTTON,
          });
        }}
      >
        <img
          src={`assets/${
            postRowsState.getPostRowsPaused ? "pause" : "play"
          }_black.png`}
          className={"play-pause-button-img"}
        />
      </div>
    </div>
  );
};

export default PostRowPage;
