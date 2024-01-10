import { TouchEvent, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SINGPLE_POST_ROUTE } from "../../RedditWatcherConstants";
import PostContextMenuEvent from "../../model/Events/PostContextMenuEvent";
import { PostRow } from "../../model/PostRow";
import { setPostContextMenuEvent } from "../../redux/slice/ContextMenuSlice";
import {
  mouseEnterPostRow,
  mouseLeavePostRow,
  postRowLeftButtonClicked,
  postRowRightButtonClicked,
} from "../../redux/slice/PostRowsSlice";
import { setPostAndRowUuid } from "../../redux/slice/SinglePostPageSlice";
import store, { useAppDispatch, useAppSelector } from "../../redux/store";
import PostMediaElement from "./PostMediaElement.tsx";
import getPlatform from "../../util/PlatformUtil.ts";
import { Platform } from "../../model/Platform.ts";

type Props = { postRow: PostRow };
const PostRowView: React.FC<Props> = ({ postRow }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const postRowsToShowInView = useAppSelector(
    (state) => state.appConfig.postRowsToShowInView
  );
  const postsToShowInRow = useAppSelector(
    (state) => state.appConfig.postsToShowInRow
  );
  const darkMode = useAppSelector((state) => state.appConfig.darkMode);
  const postRowContentDiv = useRef(null);

  useEffect(() => {
    const scrollToIndex = postRow.scrollToIndex;
    const div = postRowContentDiv.current as unknown as HTMLDivElement;
    const postCards = div.children;
    if (scrollToIndex < postCards.length) {
      const scrollToLeft =
        (postCards[scrollToIndex] as HTMLDivElement).offsetLeft - 5;
      div.scrollTo({ left: scrollToLeft, behavior: "smooth" });
    }
  }, [postRow.scrollToIndex]);

  const touchStartX = useRef<number | undefined>(undefined);
  const touchEndX = useRef<number | undefined>(undefined);
  const minSwipeDistance = 50;

  function onTouchStart(event: TouchEvent<HTMLDivElement>) {
    dispatch(mouseEnterPostRow(postRow.postRowUuid));
    touchEndX.current = undefined;
    touchStartX.current = event.touches[0].clientX;
  }

  function onTouchMove(event: TouchEvent<HTMLDivElement>) {
    touchEndX.current = event.touches[0].clientX;
  }

  function onTouchEnd() {
    if (getPlatform() == Platform.Android || getPlatform() == Platform.Ios) {
      dispatch(mouseLeavePostRow());
    }

    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (postRow.posts.length > store.getState().appConfig.postsToShowInRow) {
      if (isLeftSwipe) {
        dispatch(
          postRowRightButtonClicked({
            postRowUuid: postRow.postRowUuid,
            postsToShowInRow: store.getState().appConfig.postsToShowInRow,
          })
        );
      }

      if (isRightSwipe) {
        dispatch(
          postRowLeftButtonClicked({
            postRowUuid: postRow.postRowUuid,
          })
        );
      }
    }
  }

  return (
    <div
      className="postRow"
      onTouchStart={(event) => onTouchStart(event)}
      onTouchMove={(event) => onTouchMove(event)}
      onTouchEnd={() => onTouchEnd()}
      onMouseEnter={() => {
        if (
          getPlatform() == Platform.Electron ||
          getPlatform() == Platform.Web ||
          getPlatform() == Platform.Unknown
        ) {
          dispatch(mouseEnterPostRow(postRow.postRowUuid));
        }
      }}
      onMouseLeave={() => {
        if (
          getPlatform() == Platform.Electron ||
          getPlatform() == Platform.Web ||
          getPlatform() == Platform.Unknown
        ) {
          dispatch(mouseLeavePostRow());
        }
      }}
    >
      <div className="postRowScrollButton leftPostRowScrollButton">
        <img
          src={
            darkMode
              ? "assets/left_chevron_dark_mode.png"
              : "assets/left_chevron_light_mode.png"
          }
          className="postRowScrollImg"
          style={{
            visibility:
              postRow.posts.length > postRowsToShowInView
                ? "visible"
                : "hidden",
          }}
          onClick={() =>
            dispatch(
              postRowLeftButtonClicked({
                postRowUuid: postRow.postRowUuid,
              })
            )
          }
        />
      </div>
      <div className="postRowContent" ref={postRowContentDiv}>
        {postRow.posts.map((post) => (
          <div
            key={`${post.postUuid}`}
            className="postCard"
            style={{
              minWidth: `calc((100% - (10px * ${postsToShowInRow} ) )/${postsToShowInRow})`,
              maxWidth: `calc((100% - (10px * ${postsToShowInRow} ) )/${postsToShowInRow})`,
            }}
            onContextMenu={(event) => {
              event.preventDefault();
              event.stopPropagation();
              const postContextMenuEvent: PostContextMenuEvent = {
                post: post,
                x: event.clientX,
                y: event.clientY,
              };
              dispatch(
                setPostContextMenuEvent({ event: postContextMenuEvent })
              );
            }}
            onClick={() => {
              dispatch(
                setPostAndRowUuid({
                  postRowUuid: postRow.postRowUuid,
                  postUuid: post.postUuid,
                })
              );
              navigate(`${SINGPLE_POST_ROUTE}`);
            }}
          >
            <div className="postCardHeader">
              <p className="postCardHeaderText">{`${
                post.subreddit.displayName
              }${post.attachments.length > 1 ? " (Gallery)" : ""}`}</p>
              {post.subreddit.fromList.length > 0 && (
                <p className="postCardHeaderText">{`From List: ${post.subreddit.fromList}`}</p>
              )}

              <p className="postCardHeaderText">
                {new Date(post.created * 1000).toLocaleDateString("en-us", {
                  month: "long",
                  day: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              {!post.subreddit.displayName.startsWith("u_") && (
                <p className="postCardHeaderText">{`Subscribers: ${post.subreddit.subscribers.toLocaleString()}`}</p>
              )}
              <p className="postCardHeaderText">{post.randomSourceString}</p>
            </div>

            <div className="post-card-content">
              <PostMediaElement postRowUuid={postRow.postRowUuid} post={post} />
            </div>
          </div>
        ))}
      </div>
      <div className="postRowScrollButton rightPostRowScrollButton">
        <img
          src={
            darkMode
              ? "assets/right_chevron_dark_mode.png"
              : "assets/right_chevron_light_mode.png"
          }
          className="postRowScrollImg"
          onClick={() =>
            dispatch(
              postRowRightButtonClicked({
                postRowUuid: postRow.postRowUuid,
                postsToShowInRow: store.getState().appConfig.postsToShowInRow,
              })
            )
          }
          style={{
            visibility:
              postRow.posts.length > postRowsToShowInView
                ? "visible"
                : "hidden",
          }}
        />
      </div>
    </div>
  );
};

export default PostRowView;
