import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import getPlatform from "../util/PlatformUtil.ts";
import { Platform } from "../model/Platform.ts";
import useMovePostRow from "../hook/use-move-post-row.ts";
import "../theme/post-row.scss";
import { AppConfigStateContext } from "../context/app-config-context.ts";
import IndividualPostRowContext from "../context/individual-post-row-context.ts";
import { PostCardContext } from "../context/post-card-context.ts";
import PostCard from "../components/PostCard.tsx";
import {
  PostRowPageContext,
  PostRowPageDispatchContext,
} from "../context/post-row-page-context.ts";
import { PostRowPageActionType } from "../reducer/post-row-page-reducer.ts";
import { NAVIGATION_HAMBURGER_TOOLBAR_HEIGHT } from "../RedditWatcherConstants.ts";

const PostRow: FC = () => {
  const { darkMode, postsToShowInRow, postRowsToShowInView } = useContext(
    AppConfigStateContext
  );
  const postRowPageDispatch = useContext(PostRowPageDispatchContext);
  const {
    postRowUuid,
    allPosts,
    postSliderLeft,
    postSliderLeftTransitionTime,
    postCards,
    gottenWithSubredditSourceOption,
  } = useContext(IndividualPostRowContext);
  const { scrollY, postRows } = useContext(PostRowPageContext);

  const postRowDivRef = useRef<HTMLDivElement>(null);
  const postRowContentDivRef = useRef<HTMLDivElement>(null);
  const scrollPostRowLeftButtonRef = useRef<HTMLDivElement>(null);
  const scrollPostRowRightButtonRef = useRef<HTMLDivElement>(null);

  const [renderPostRowContent, setRenderPostRowContent] = useState(true);

  const hideScrollButtonDivs = useCallback(() => {
    return getPlatform() == Platform.Android || getPlatform() == Platform.Ios;
  }, []);

  useMovePostRow(
    postRowUuid,
    allPosts,
    postRowDivRef,
    postRowContentDivRef,
    postSliderLeft,
    postCards,
    gottenWithSubredditSourceOption,
    scrollPostRowLeftButtonRef,
    scrollPostRowRightButtonRef
  );

  useEffect(() => {
    const postRowDiv = postRowDivRef.current;
    if (postRowDiv === null) {
      return;
    }
    const postRowDivBoundingRec = postRowDiv.getBoundingClientRect();
    const navToolbarHeightPxNumber = parseInt(
      NAVIGATION_HAMBURGER_TOOLBAR_HEIGHT.replace("px", "")
    );

    setRenderPostRowContent(
      postRowDivBoundingRec.top < window.innerHeight &&
        postRowDivBoundingRec.bottom > navToolbarHeightPxNumber
    );
  }, [scrollY, setRenderPostRowContent, postRows]);

  return (
    <div
      ref={postRowDivRef}
      className="postRow"
      style={{
        height: `calc(100%/${postRowsToShowInView})`,
      }}
      onMouseEnter={() => {
        postRowPageDispatch({
          type: PostRowPageActionType.SET_MOUSE_OVER_POST_ROW_UUID,
          payload: postRowUuid,
        });
      }}
      onMouseLeave={() => {
        postRowPageDispatch({
          type: PostRowPageActionType.SET_MOUSE_OVER_POST_ROW_UUID,
          payload: undefined,
        });
      }}
      onTouchStart={() => {
        postRowPageDispatch({
          type: PostRowPageActionType.SET_MOUSE_OVER_POST_ROW_UUID,
          payload: postRowUuid,
        });
      }}
      onTouchEnd={() => {
        postRowPageDispatch({
          type: PostRowPageActionType.SET_MOUSE_OVER_POST_ROW_UUID,
          payload: undefined,
        });
      }}
    >
      {(() => {
        if (!renderPostRowContent) {
          return <></>;
        } else {
          return (
            <>
              <div
                ref={scrollPostRowLeftButtonRef}
                hidden={hideScrollButtonDivs()}
                className="postRowScrollButton leftPostRowScrollButton"
                style={{
                  visibility:
                    postCards.length > postsToShowInRow ? "visible" : "hidden",
                }}
              >
                <img
                  alt={""}
                  src={
                    darkMode
                      ? "assets/left_chevron_dark_mode.png"
                      : "assets/left_chevron_light_mode.png"
                  }
                  className="postRowScrollImg"
                />
              </div>
              <div
                className="postRowContent"
                style={{
                  left: `${postSliderLeft.toFixed(2)}%`,
                  transition:
                    postSliderLeftTransitionTime === 0
                      ? ""
                      : `left ${postSliderLeftTransitionTime}s linear`,
                }}
                ref={postRowContentDivRef}
              >
                {postCards.map((postCard) => {
                  return (
                    <PostCardContext.Provider
                      value={{
                        postRowUuid: postRowUuid,
                        postCard: postCard,
                      }}
                      key={postCard.postCardUuid}
                    >
                      <PostCard />
                    </PostCardContext.Provider>
                  );
                })}
              </div>
              <div
                ref={scrollPostRowRightButtonRef}
                hidden={hideScrollButtonDivs()}
                className="postRowScrollButton rightPostRowScrollButton"
                style={{
                  visibility:
                    postCards.length > postsToShowInRow ? "visible" : "hidden",
                }}
              >
                <img
                  alt={""}
                  src={
                    darkMode
                      ? "assets/right_chevron_dark_mode.png"
                      : "assets/right_chevron_light_mode.png"
                  }
                  className="postRowScrollImg"
                />
              </div>
            </>
          );
        }
      })()}
    </div>
  );
};

export default PostRow;
