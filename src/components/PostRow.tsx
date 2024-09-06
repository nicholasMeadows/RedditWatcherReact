import { FC, memo, useCallback, useContext, useRef } from "react";
import getPlatform from "../util/PlatformUtil.ts";
import { Platform } from "../model/Platform.ts";
import useMovePostRow from "../hook/use-move-post-row.ts";
import "../theme/post-row.scss";
import { AppConfigStateContext } from "../context/app-config-context.ts";
import IndividualPostRowContext from "../context/individual-post-row-context.ts";
import { PostCardContext } from "../context/post-card-context.ts";
import PostCard from "../components/PostCard.tsx";
import { PostRowPageDispatchContext } from "../context/post-row-page-context.ts";
import { PostRowPageActionType } from "../reducer/post-row-page-reducer.ts";

const PostRow: FC = memo(() => {
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

  const postRowContentDivRef = useRef<HTMLDivElement>(null);

  const hideScrollButtonDivs = useCallback(() => {
    return getPlatform() == Platform.Android || getPlatform() == Platform.Ios;
  }, []);

  useMovePostRow(
    postRowUuid,
    allPosts,
    postRowContentDivRef,
    postSliderLeft,
    postCards,
    gottenWithSubredditSourceOption
  );

  return (
    <div
      className="postRow"
      style={{
        height: `calc(100%/${postRowsToShowInView})`,
      }}
    >
      <div
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
          left: `${postSliderLeft}%`,
          transition: `left ${postSliderLeftTransitionTime}s linear`,
        }}
        ref={postRowContentDivRef}
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
    </div>
  );
});

export default PostRow;
