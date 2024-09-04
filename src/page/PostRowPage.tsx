import { FC, useContext, useEffect, useRef, useState } from "react";
import SideBar from "../components/SideBar.tsx";
import PostRow from "../components/PostRow.tsx";
import "../theme/post-row-page.scss";
import {
  PostRowsContext,
  PostRowsDispatchContext,
} from "../context/post-rows-context.ts";
import IndividualPostRowContext from "../context/individual-post-row-context.ts";
import LoopForPostsProvider from "../components/LoopForPostsProvider.tsx";
import { PostRowsActionType } from "../reducer/post-rows-reducer.ts";
import useGetPostLoopPaused from "../hook/use-get-post-loop-paused.ts";

const PostRowPage: FC = () => {
  const { postRows, playPauseButtonIsClicked } = useContext(PostRowsContext);
  const postRowsDispatch = useContext(PostRowsDispatchContext);
  // const { postRowsToShowInView } = useContext(AppConfigStateContext);
  const postRowsDivRef = useRef<HTMLDivElement>(null);
  const postRowPageRef = useRef<HTMLDivElement>(null);
  const redditSearchBarFocused = useRef(false);

  const [scrollBarWidth, setScrollBarWidth] = useState(0);
  const { isGetPostLoopPaused } = useGetPostLoopPaused();

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
          type: PostRowsActionType.SET_PLAY_PAUSE_BUTTON_IS_CLICKED,
          payload: !playPauseButtonIsClicked,
        });
      }
    };

    postRowPage.addEventListener("keyup", documentKeyUpEvent);
    return () => {
      postRowPage.removeEventListener("keyup", documentKeyUpEvent);
    };
  }, [playPauseButtonIsClicked, postRowsDispatch]);

  return (
    <LoopForPostsProvider>
      <div className="post-row-page" ref={postRowPageRef}>
        <div
          className="post-rows-side-bar-div"
          style={{
            right: `${scrollBarWidth}px`,
          }}
        >
          <SideBar
            onRedditSearchBarFocus={() =>
              (redditSearchBarFocused.current = true)
            }
            onRedditSearchBarBlur={() =>
              (redditSearchBarFocused.current = false)
            }
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
            <IndividualPostRowContext.Provider
              value={{
                posts: postRow.posts,
                postRowUuid: postRow.postRowUuid,
                postSliderLeft: postRow.postSliderLeft,
                postSliderLeftTransitionTime:
                  postRow.postSliderLeftTransitionTime,
                postsToShowUuids: postRow.postsToShowUuids,
                gottenWithSubredditSourceOption:
                  postRow.gottenWithSubredditSourceOption,
              }}
              key={"post-row-" + postRow.postRowUuid}
            >
              <PostRow />
            </IndividualPostRowContext.Provider>
          ))}
        </div>

        <div
          className={"play-pause-button-div"}
          onClick={() => {
            postRowsDispatch({
              type: PostRowsActionType.SET_PLAY_PAUSE_BUTTON_IS_CLICKED,
              payload: !playPauseButtonIsClicked,
            });
          }}
        >
          <img
            src={`assets/${isGetPostLoopPaused ? "pause" : "play"}_black.png`}
            className={"play-pause-button-img"}
          />
        </div>
      </div>
    </LoopForPostsProvider>
  );
};

export default PostRowPage;
