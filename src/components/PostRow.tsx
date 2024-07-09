import {
  FC,
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Post } from "../model/Post/Post.ts";
import getPlatform from "../util/PlatformUtil.ts";
import { Platform } from "../model/Platform.ts";
import useMovePostRow from "../hook/use-move-post-row.ts";
import { PostCardContext } from "../context/post-card-context.ts";
import PostCard from "./PostCard.tsx";
import { PostRow } from "../model/PostRow.ts";
import "../theme/post-row.scss";
import { AppConfigStateContext } from "../context/app-config-context.ts";
import { PostRowsDispatchContext } from "../context/post-rows-context.ts";
import { PostRowsActionType } from "../reducer/post-rows-reducer.ts";

const POSTS_TO_SHOW_AND_SCROLL_LEFT_SESSION_STORAGE_SUFFIX =
  "_POSTS_TO_SHOW_AND_SCROLL_LEFT";
type PostsToShowAndScrollLeftSessionStorageObj = {
  postsToShow: Post[];
  scrollLeft: number;
};
type Props = { postRow: PostRow };
const PostRow: FC<Props> = memo(({ postRow }) => {
  const darkMode = useContext(AppConfigStateContext).darkMode;
  const postsToShowInRow = useContext(AppConfigStateContext).postsToShowInRow;
  const postRowsDispatch = useContext(PostRowsDispatchContext);
  const postRowContentDivRef = useRef<HTMLDivElement>(null);
  const postRowScrollLeft = useRef(0);
  const [postsToShow, setPostsToShow] = useState<Array<Post>>([]);

  const hideScrollButtonDivs = useCallback(() => {
    return getPlatform() == Platform.Android || getPlatform() == Platform.Ios;
  }, []);

  useMovePostRow(postRow, postRowContentDivRef, postsToShow, setPostsToShow);

  const saveCurrentPostsToShowAndScrollLeftToSessionStorage = useCallback(
    (postsToShowToSet: Post[], scrollLeftToSet: number) => {
      const postsToShowAndScrollLeft: PostsToShowAndScrollLeftSessionStorageObj =
        {
          postsToShow: postsToShowToSet,
          scrollLeft: scrollLeftToSet,
        };
      sessionStorage.setItem(
        `${postRow.postRowUuid}${POSTS_TO_SHOW_AND_SCROLL_LEFT_SESSION_STORAGE_SUFFIX}`,
        JSON.stringify(postsToShowAndScrollLeft)
      );
    },
    [postRow.postRowUuid]
  );

  useEffect(() => {
    const sessionStorageVal = sessionStorage.getItem(
      `${postRow.postRowUuid}${POSTS_TO_SHOW_AND_SCROLL_LEFT_SESSION_STORAGE_SUFFIX}`
    );
    let postsToShowToSet = postRow.posts;
    let scrollTo = 1;
    if (sessionStorageVal === null) {
      saveCurrentPostsToShowAndScrollLeftToSessionStorage(postRow.posts, 1);
    } else {
      const postsToShowAndScrollLeft: PostsToShowAndScrollLeftSessionStorageObj =
        JSON.parse(sessionStorageVal);
      postsToShowToSet = postRow.posts;
      scrollTo = postsToShowAndScrollLeft.scrollLeft;
    }
    setPostsToShow(postsToShowToSet);
    const postRowContentDiv = postRowContentDivRef.current;
    if (postRowContentDiv !== null) {
      postRowScrollLeft.current = scrollTo;
      setTimeout(() => postRowContentDiv.scrollTo({ left: scrollTo }), 0);
    }
    return () => {
      if (postRowContentDiv !== null) {
        saveCurrentPostsToShowAndScrollLeftToSessionStorage(
          postsToShowToSet,
          postRowScrollLeft.current
        );
      }
    };
  }, [
    postRow.postRowUuid,
    postRow.posts,
    saveCurrentPostsToShowAndScrollLeftToSessionStorage,
  ]);

  useEffect(() => {
    const onScroll = (event: Event) => {
      postRowScrollLeft.current = (event.target as HTMLDivElement).scrollLeft;
    };
    const postRowContentDiv = postRowContentDivRef.current;
    if (postRowContentDiv !== null) {
      postRowContentDiv.addEventListener("scroll", onScroll);
    }
    return () => {
      if (postRowContentDiv !== null) {
        postRowContentDiv.removeEventListener("scroll", onScroll);
      }
    };
  }, [postRowContentDivRef]);

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
          <PostCardContext.Provider
            value={{
              postRowUuid: postRow.postRowUuid,
              post: post,
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
