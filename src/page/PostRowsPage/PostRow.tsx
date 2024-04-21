import { PostRow } from "../../model/PostRow.ts";
import { useAppSelector } from "../../redux/store.ts";
import getPlatform from "../../util/PlatformUtil.ts";
import { Platform } from "../../model/Platform.ts";
import { FC, useCallback, useRef } from "react";
import PostCard from "./PostCard.tsx";
import { PostCardContext } from "../../context/post-card-context.ts";
import useMovePostRow from "../../hook/use-move-post-row.ts";

type Props = { postRow: PostRow };
const PostRow: FC<Props> = ({ postRow }) => {
  const darkMode = useAppSelector((state) => state.appConfig.darkMode);

  const postsToShowInRow = useAppSelector(
    (state) => state.appConfig.postsToShowInRow
  );

  const postRowDivRef = useRef(null);
  const postRowContentDivRef = useRef(null);

  const movePostRow = useMovePostRow(
    postRowDivRef,
    postRowContentDivRef,
    postRow,
    postsToShowInRow
  );

  const hideScrollButtonDivs = useCallback(() => {
    return getPlatform() == Platform.Android || getPlatform() == Platform.Ios;
  }, []);

  return (
    <div className="postRow" ref={postRowDivRef}>
      <div
        hidden={hideScrollButtonDivs()}
        className="postRowScrollButton leftPostRowScrollButton"
        onClick={() =>
          movePostRow.postRowScrollLeftPressed(postRow.postRowUuid)
        }
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
              postRow.posts.length > postsToShowInRow ? "visible" : "hidden",
          }}
        />
      </div>
      <div className="postRowContent" ref={postRowContentDivRef}>
        {postRow.uiPosts.map((uiPost) => (
          <PostCardContext.Provider
            value={{
              uiPost: uiPost,
              postRowUuid: postRow.postRowUuid,
              userFrontPagePostSortOrderOptionAtRowCreation:
                postRow.userFrontPagePostSortOrderOptionAtRowCreation,
              mouseOverPostRow: postRow.mouseOverPostRow,
              totalMovementX: movePostRow.totalMovementX,
            }}
            key={uiPost.uiUuid}
          >
            <PostCard />
          </PostCardContext.Provider>
        ))}
      </div>
      <div
        hidden={hideScrollButtonDivs()}
        className="postRowScrollButton rightPostRowScrollButton"
        onClick={() =>
          movePostRow.postRowScrollRightPressed(postRow.postRowUuid)
        }
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
              postRow.posts.length > postsToShowInRow ? "visible" : "hidden",
          }}
        />
      </div>
    </div>
  );
};

export default PostRow;
