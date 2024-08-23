import { FC, memo, useCallback, useContext, useRef } from "react";
import getPlatform from "../util/PlatformUtil.ts";
import { Platform } from "../model/Platform.ts";
import useMovePostRow from "../hook/use-move-post-row.ts";
import { PostCardContext } from "../context/post-card-context.ts";
import PostCard from "./PostCard.tsx";
import "../theme/post-row.scss";
import { AppConfigStateContext } from "../context/app-config-context.ts";
import IndividualPostRowContext from "../context/individual-post-row-context.ts";
import { PostRowsActionType } from "../reducer/post-rows-reducer.ts";
import { PostRowsDispatchContext } from "../context/post-rows-context.ts";

const PostRow: FC = memo(() => {
  const { darkMode } = useContext(AppConfigStateContext);
  const { postsToShowInRow } = useContext(AppConfigStateContext);
  const postRowsDispatch = useContext(PostRowsDispatchContext);
  const { postCardWidthPercentage, postRowUuid, posts } = useContext(
    IndividualPostRowContext
  );

  const postRowContentDivRef = useRef<HTMLDivElement>(null);

  const hideScrollButtonDivs = useCallback(() => {
    return getPlatform() == Platform.Android || getPlatform() == Platform.Ios;
  }, []);

  const { postsToShowUuids, postSliderLeft, postSliderLeftTransitionTime } =
    useMovePostRow(
      postRowUuid,
      posts,
      postRowContentDivRef,
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
            postsToShowUuids.length > postsToShowInRow ? "visible" : "hidden",
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
          postRowsDispatch({
            type: PostRowsActionType.SET_MOUSE_OVER_POST_ROW_UUID,
            payload: postRowUuid,
          });
        }}
        onMouseLeave={() => {
          postRowsDispatch({
            type: PostRowsActionType.SET_MOUSE_OVER_POST_ROW_UUID,
            payload: undefined,
          });
        }}
      >
        {(() => {
          const mapOfPosts = new Map(
            posts.map((post) => [post.postUuid, post])
          );
          return postsToShowUuids.map((uuidObj) => {
            const post = mapOfPosts.get(uuidObj.postUuid);
            if (post === undefined) {
              return <></>;
            }
            return (
              <div
                style={{
                  width: `${postCardWidthPercentage}%`,
                  minWidth: `calc(${postCardWidthPercentage}%)`,
                }}
                className={"post-card-wrapper"}
                key={uuidObj.uiUuid}
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
            );
          });
        })()}
      </div>
      <div
        hidden={hideScrollButtonDivs()}
        className="postRowScrollButton rightPostRowScrollButton"
        style={{
          visibility:
            postsToShowUuids.length > postsToShowInRow ? "visible" : "hidden",
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
