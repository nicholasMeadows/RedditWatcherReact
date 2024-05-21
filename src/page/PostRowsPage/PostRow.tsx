import { PostRow } from "../../model/PostRow.ts";
import { useAppDispatch, useAppSelector } from "../../redux/store.ts";
import getPlatform from "../../util/PlatformUtil.ts";
import { Platform } from "../../model/Platform.ts";
import { FC, memo, useCallback, useEffect, useRef, useState } from "react";
import "../../theme/post-row.scss";
import { PostCardContext } from "../../context/post-card-context.ts";
import PostCard from "./PostCard.tsx";
import { Post } from "../../model/Post/Post.ts";
import useMovePostRow from "../../hook/use-move-post-row.ts";
import {
  mouseEnterPostRow,
  mouseLeavePostRow,
} from "../../redux/slice/PostRowsSlice.ts";

type Props = { postRow: PostRow };
const PostRow: FC<Props> = memo(({ postRow }) => {
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((state) => state.appConfig.darkMode);
  const postsToShowInRow = useAppSelector(
    (state) => state.appConfig.postsToShowInRow
  );

  const postRowContentDivRef = useRef<HTMLDivElement>(null);

  const [postsToShow, setPostsToShow] = useState<Array<Post>>(postRow.posts);
  useEffect(() => {
    const postRowContentDiv = postRowContentDivRef.current;
    if (postRowContentDiv !== null) {
      postRowContentDiv.scroll({ left: 1 });
    }
  }, []);

  const hideScrollButtonDivs = useCallback(() => {
    return getPlatform() == Platform.Android || getPlatform() == Platform.Ios;
  }, []);

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
        onMouseEnter={() => dispatch(mouseEnterPostRow(postRow.postRowUuid))}
        onMouseLeave={() => dispatch(mouseLeavePostRow(postRow.postRowUuid))}
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
