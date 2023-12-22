import { TouchEvent, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PostContextMenuEvent from "../../model/Events/PostContextMenuEvent";
import { Post } from "../../model/Post/Post";
import { PostRow } from "../../model/PostRow";
import { setPostContextMenuEvent } from "../../redux/slice/ContextMenuSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import PostElement from "./PostElement";

const SinglePostView: React.FC = () => {
  const dispatch = useAppDispatch();
  const [queryParams] = useSearchParams();
  const postRows = useAppSelector((state) => state.postRows.postRows);
  const [postRow, setPostRow] = useState<PostRow | undefined>();
  const [post, setPost] = useState<Post | undefined>();

  useEffect(() => {
    const postRowUuid = queryParams.get("postRowUuid");
    const postUuid = queryParams.get("postUuid");
    const foundPostRow = postRows.find((row) => row.postRowUuid == postRowUuid);
    if (foundPostRow != undefined) {
      const foundPost = foundPostRow.posts.find(
        (post) => post.postUuid == postUuid
      );
      if (foundPost != undefined) {
        setPostRow(foundPostRow);
        setPost(foundPost);
      }
    }
  }, [queryParams, postRows]);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  // the required distance between touchStart and touchEnd to be detected as a swipe
  const minSwipeDistance = 50;
  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setTouchEnd(null); // otherwise the swipe is fired even with usual touch events
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent<HTMLDivElement>) =>
    setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNextPost();
    }

    if (isRightSwipe) {
      goToPreviousPost();
    }
  };

  const goToNextPost = useCallback(() => {
    const currentPostShownIndex = findCurrentPostShownIndex(postRow, post);
    if (currentPostShownIndex > -1 && postRow != undefined) {
      if (currentPostShownIndex == postRow.posts.length - 1) {
        setPost(postRow.posts[0]);
      } else {
        setPost(postRow.posts[currentPostShownIndex + 1]);
      }
    }
  }, [post, postRow]);

  const goToPreviousPost = useCallback(() => {
    const currentPostShownIndex = findCurrentPostShownIndex(postRow, post);
    if (currentPostShownIndex > -1 && postRow != undefined) {
      if (currentPostShownIndex == 0) {
        setPost(postRow.posts[postRow.posts.length - 1]);
      } else {
        setPost(postRow.posts[currentPostShownIndex - 1]);
      }
    }
  }, [post, postRow]);

  const findCurrentPostShownIndex = (
    postRow: PostRow | undefined,
    postToShow: Post | undefined
  ): number => {
    if (postRow != undefined && postToShow != undefined) {
      return postRow.posts.findIndex(
        (post) => post.postUuid == postToShow.postUuid
      );
    }
    return -1;
  };

  useEffect(() => {
    const documentKeyUpEvent = (keyboardEvent: globalThis.KeyboardEvent) => {
      const key = keyboardEvent.key;

      if (key == "ArrowRight") {
        goToNextPost();
      } else if (key == "ArrowLeft") {
        goToPreviousPost();
      }
    };

    document.body.addEventListener("keyup", documentKeyUpEvent);
    return () => {
      document.body.removeEventListener("keyup", documentKeyUpEvent);
    };
  }, [goToNextPost, goToPreviousPost]);
  return (
    <>
      {post != undefined && (
        <div
          className="single-post-view flex flex-column max-width-height-percentage"
          onTouchStart={(event) => onTouchStart(event)}
          onTouchMove={(event) => onTouchMove(event)}
          onTouchEnd={() => onTouchEnd()}
        >
          <h4 className="text-align-center text-color">
            {post.subreddit.displayNamePrefixed}
          </h4>

          {post != undefined && postRow != undefined && (
            <div
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
              className="flex flex-column max-width-height-percentage"
            >
              <PostElement postRowUuid={postRow.postRowUuid} post={post} />
            </div>
          )}
          <div className="post-control-button-box">
            <div className="post-control-button-wrapper">
              <button
                className="post-control-button"
                onClick={() => goToPreviousPost()}
              >
                Previous
              </button>
            </div>
            <div className="post-control-button-wrapper">
              <button
                className="post-control-button"
                onClick={() => goToNextPost()}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SinglePostView;
