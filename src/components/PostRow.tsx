import {
  FC,
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import getPlatform from "../util/PlatformUtil.ts";
import { Platform } from "../model/Platform.ts";
import useMovePostRow from "../hook/use-move-post-row.ts";
import { PostCardContext } from "../context/post-card-context.ts";
import PostCard from "./PostCard.tsx";
import "../theme/post-row.scss";
import { AppConfigStateContext } from "../context/app-config-context.ts";
import { PostRowsDispatchContext } from "../context/post-rows-context.ts";
import { PostRowsActionType } from "../reducer/post-rows-reducer.ts";
import IndividualPostRowContext from "../context/individual-post-row-context.ts";

const PostRow: FC = memo(() => {
  const darkMode = useContext(AppConfigStateContext).darkMode;
  const postsToShowInRow = useContext(AppConfigStateContext).postsToShowInRow;
  const postRowsDispatch = useContext(PostRowsDispatchContext);
  const { postRowUuid, posts, shouldAutoScroll } = useContext(
    IndividualPostRowContext
  );

  const postRowContentDivRef = useRef<HTMLDivElement>(null);
  const [postCardWidthPercentage, setPostCardWidthPercentage] = useState(0);

  const hideScrollButtonDivs = useCallback(() => {
    return getPlatform() == Platform.Android || getPlatform() == Platform.Ios;
  }, []);

  useEffect(() => {
    const postRowContentDiv = postRowContentDivRef.current;
    if (postRowContentDiv !== null) {
      const postRowContentDivWidth =
        postRowContentDiv.getBoundingClientRect().width;
      const postCardWidthPx = postRowContentDivWidth / postsToShowInRow;
      setPostCardWidthPercentage(
        (postCardWidthPx / postRowContentDivWidth) * 100
      );
    }
  }, [postsToShowInRow]);

  const postsToShow = useMovePostRow(
    postRowUuid,
    posts,
    postRowContentDivRef,
    shouldAutoScroll,
    postCardWidthPercentage,
    postsToShowInRow
  );

  return (
    <div className="postRow">
      <div
        hidden={hideScrollButtonDivs()}
        className="postRowScrollButton leftPostRowScrollButton"
        style={{
          visibility:
            postsToShow.length > postsToShowInRow ? "visible" : "hidden",
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
        ref={postRowContentDivRef}
        onMouseEnter={() => {
          postRowsDispatch({
            type: PostRowsActionType.SET_MOUSE_OVER_A_POST_ROW,
            payload: true,
          });
        }}
        onMouseLeave={() => {
          postRowsDispatch({
            type: PostRowsActionType.SET_MOUSE_OVER_A_POST_ROW,
            payload: false,
          });
        }}
      >
        {postsToShow.map((post) => (
          <div
            style={{
              width: `${postCardWidthPercentage}%`,
              minWidth: `calc(${postCardWidthPercentage}%)`,
            }}
            className={"post-card-wrapper"}
            key={post.postToShowUuid}
          >
            <PostCardContext.Provider
              value={{
                postRowUuid: postRowUuid,
                post: post,
              }}
            >
              <PostCard />
            </PostCardContext.Provider>
          </div>
        ))}
      </div>
      <div
        hidden={hideScrollButtonDivs()}
        className="postRowScrollButton rightPostRowScrollButton"
        style={{
          visibility:
            postsToShow.length > postsToShowInRow ? "visible" : "hidden",
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
