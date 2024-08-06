import { FC, useContext, useEffect, useRef, useState } from "react";
import SideBar from "../components/SideBar.tsx";
import PostRow from "../components/PostRow.tsx";
import "../theme/post-row-page.scss";
import { AppConfigStateContext } from "../context/app-config-context.ts";
import {
  PostRowsContext,
  PostRowsDispatchContext,
} from "../context/post-rows-context.ts";
import { PostRowsActionType } from "../reducer/post-rows-reducer.ts";
import IndividualPostRowContext from "../context/individual-post-row-context.ts";
import useRedditService from "../hook/use-reddit-service.ts";
import { SideBarDispatchContext } from "../context/side-bar-context.ts";
import { SideBarActionType } from "../reducer/side-bar-reducer.ts";

const PostRowPage: FC = () => {
  const { postRows, mouseOverAPostRow, scrollY } = useContext(PostRowsContext);
  const { pauseGetPostsLoop } = useContext(PostRowsContext);
  const postRowsDispatch = useContext(PostRowsDispatchContext);
  const { postsToShowInRow, postRowsToShowInView } = useContext(
    AppConfigStateContext
  );
  const sideBarDispatch = useContext(SideBarDispatchContext);
  const postRowsDivRef = useRef<HTMLDivElement>(null);
  const postRowPageRef = useRef<HTMLDivElement>(null);
  const redditSearchBarFocused = useRef(false);

  const [scrollBarWidth, setScrollBarWidth] = useState(0);
  const [postCardWidthPercentage, setPostCardWidthPercentage] = useState(0);
  const redditService = useRedditService();

  const loopForPostIntervalRef = useRef<NodeJS.Timeout>();
  const mouseOverAPostRowRef = useRef(mouseOverAPostRow);
  const scrollYRef = useRef(scrollY);

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

  useEffect(() => {
    const postRowsDiv = postRowsDivRef.current;
    if (postRowsDiv !== null) {
      const postRowContentDivWidth = postRowsDiv.getBoundingClientRect().width;
      const postCardWidthPx = postRowContentDivWidth / postsToShowInRow;
      setPostCardWidthPercentage(
        (postCardWidthPx / postRowContentDivWidth) * 100
      );
    }
  }, [postsToShowInRow]);

  useEffect(() => {
    if (loopForPostIntervalRef.current !== undefined) {
      return;
    }
    sideBarDispatch({
      type: SideBarActionType.SET_SECONDS_TILL_GETTING_NEXT_POSTS,
      payload: 10,
    });
    loopForPostIntervalRef.current = setInterval(async () => {
      try {
        const {
          posts,
          fromSubreddits,
          getPostsFromSubredditState,
          getPostsUpdatedValues,
        } = await redditService.getPostsForPostRow();

        while (mouseOverAPostRowRef.current || scrollYRef.current !== 0) {
          await new Promise<void>((resolve) =>
            setTimeout(() => resolve(), 100)
          );
        }

        await redditService.handleGottenPosts(
          posts,
          fromSubreddits,
          getPostsFromSubredditState,
          getPostsUpdatedValues
        );
      } catch (e) {
        console.log("Caught error while fetching posts for first post row", e);
      }
      sideBarDispatch({
        type: SideBarActionType.SET_SECONDS_TILL_GETTING_NEXT_POSTS,
        payload: 10,
      });
    }, 10000);
  }, [redditService, sideBarDispatch]);

  useEffect(() => {
    return () => {
      if (loopForPostIntervalRef.current !== undefined) {
        clearInterval(loopForPostIntervalRef.current);
      }
      loopForPostIntervalRef.current = undefined;
    };
  }, []);

  useEffect(() => {
    mouseOverAPostRowRef.current = mouseOverAPostRow;
    scrollYRef.current = scrollY;
  }, [mouseOverAPostRow, scrollY]);

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
        {postRows.map((postRow) => (
          <div
            key={"post-row-" + postRow.postRowUuid}
            style={{
              height: `calc(100%/${postRowsToShowInView})`,
              maxHeight: `calc(100%/${postRowsToShowInView})`,
            }}
          >
            <IndividualPostRowContext.Provider
              value={{
                posts: postRow.posts,
                postRowUuid: postRow.postRowUuid,
                shouldAutoScroll: postRow.shouldAutoScroll,
                postCardWidthPercentage: postCardWidthPercentage,
              }}
            >
              <PostRow />
            </IndividualPostRowContext.Provider>
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
