import { TouchEvent, useEffect, useRef, useState } from "react";
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
import store, { useAppDispatch, useAppSelector } from "../../redux/store";
import PostElement from "./PostElement";

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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
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

  // the required distance between touchStart and touchEnd to be detected as a swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setTouchEnd(null); // otherwise the swipe is fired even with usual touch events
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent<HTMLDivElement>) =>
    setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = (postRow: PostRow) => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
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
            postsToShowInRow: store.getState().appConfig.postsToShowInRow,
          })
        );
      }
    }
  };
  return (
    <>
      <div
        key={"post-row-" + postRow.postRowUuid}
        className="postRow"
        style={{
          height: `calc(100%/${postRowsToShowInView})`,
          maxHeight: `calc(100%/${postRowsToShowInView})`,
        }}
        onTouchStart={(event) => onTouchStart(event)}
        onTouchMove={(event) => onTouchMove(event)}
        onTouchEnd={() => onTouchEnd(postRow)}
        onMouseEnter={() => {
          dispatch(mouseEnterPostRow(postRow.postRowUuid));
        }}
        onMouseLeave={() => {
          dispatch(mouseLeavePostRow());
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
                  postsToShowInRow: store.getState().appConfig.postsToShowInRow,
                })
              )
            }
          />
        </div>
        <div className="postRowContent" ref={postRowContentDiv}>
          {postRow.runningPostsForPostRow.map((post) => (
            <div
              key={"post-row-post-" + post.postUuid}
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
                navigate(
                  `${SINGPLE_POST_ROUTE}?postRowUuid=${postRow.postRowUuid}&postUuid=${post.postUuid}`
                );
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
                  {new Date(post.created * 1000).toLocaleString()}
                </p>
                {!post.subreddit.displayName.startsWith("u_") && (
                  <p className="postCardHeaderText">{`Subscribers: ${post.subreddit.subscribers.toLocaleString()}`}</p>
                )}
                <p className="postCardHeaderText">{post.randomSourceString}</p>
              </div>

              <PostElement postRowUuid={postRow.postRowUuid} post={post} />
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
    </>
  );
};

export default PostRowView;
