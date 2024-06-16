import { FC, memo, useCallback, useContext, useRef, useState } from "react";
import { Post } from "../model/Post/Post.ts";
import getPlatform from "../util/PlatformUtil.ts";
import { Platform } from "../model/Platform.ts";
import useInitializePostRow from "../hook/use-initialize-post-row.ts";
import useMovePostRow from "../hook/use-move-post-row.ts";
import { PostCardContext } from "../context/post-card-context.ts";
import PostCard from "./PostCard.tsx";
import { PostRow } from "../model/PostRow.ts";
import "../theme/post-row.scss";
import { AppConfigStateContext } from "../context/app-config-context.ts";
import { PostRowsDispatchContext } from "../context/post-rows-context.ts";
import { PostRowsActionType } from "../reducer/post-rows-reducer.ts";

type Props = { postRow: PostRow };
const PostRow: FC<Props> = memo(({ postRow }) => {
  const darkMode = useContext(AppConfigStateContext).darkMode;
  const postsToShowInRow = useContext(AppConfigStateContext).postsToShowInRow;
  const postRowsDispatch = useContext(PostRowsDispatchContext);
  const postRowContentDivRef = useRef<HTMLDivElement>(null);

  const [postsToShow, setPostsToShow] = useState<Array<Post>>([]);

  const hideScrollButtonDivs = useCallback(() => {
    return getPlatform() == Platform.Android || getPlatform() == Platform.Ios;
  }, []);

  useInitializePostRow(
    postRow,
    postRowContentDivRef,
    postsToShow,
    setPostsToShow
  );

  useMovePostRow(postRow, postRowContentDivRef, postsToShow, setPostsToShow);
  return (
    <div className="postRow">
      <div
        hidden={hideScrollButtonDivs()}
        className="postRowScrollButton leftPostRowScrollButton"
      >
        <img
          alt={""}
          src={
            darkMode
              ? "assets/left_chevron_dark_mode.png"
              : "assets/left_chevron_light_mode.png"
          }
          className="postRowScrollImg"
          style={{
            visibility:
              postsToShow.length > postsToShowInRow ? "visible" : "hidden",
          }}
        />
      </div>
      <div
        className="postRowContent"
        ref={postRowContentDivRef}
        onMouseEnter={() => {
          postRowsDispatch({
            type: PostRowsActionType.MOUSE_ENTER_POST_ROW,
            payload: postRow.postRowUuid,
          });
        }}
        onMouseLeave={() => {
          postRowsDispatch({
            type: PostRowsActionType.MOUSE_LEAVE_POST_ROW,
            payload: postRow.postRowUuid,
          });
        }}
      >
        {postsToShow.map((post) => (
          <PostCardContext.Provider
            value={{
              postRowUuid: postRow.postRowUuid,
              post: post,
              userFrontPagePostSortOrderOptionAtRowCreation:
                postRow.userFrontPagePostSortOrderOptionAtRowCreation,
              mouseOverPostRow: postRow.mouseOverPostRow,
            }}
            key={post.postUuid}
          >
            <PostCard />
          </PostCardContext.Provider>
        ))}
      </div>
      <div
        hidden={hideScrollButtonDivs()}
        className="postRowScrollButton rightPostRowScrollButton"
      >
        <img
          alt={""}
          src={
            darkMode
              ? "assets/right_chevron_dark_mode.png"
              : "assets/right_chevron_light_mode.png"
          }
          className="postRowScrollImg"
          style={{
            visibility:
              postsToShow.length > postsToShowInRow ? "visible" : "hidden",
          }}
        />
      </div>
    </div>
  );
});

export default PostRow;
