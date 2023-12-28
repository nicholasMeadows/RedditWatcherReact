import { TouchEvent, useCallback, useEffect, useState } from "react";
import PostContextMenuEvent from "../../model/Events/PostContextMenuEvent";
import { setPostContextMenuEvent } from "../../redux/slice/ContextMenuSlice";
import {
  goToNexPostInRow,
  goToPreviousPostInRow,
} from "../../redux/slice/SinglePostPageSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import PostElement from "./PostElement";

const SinglePostView: React.FC = () => {
  const dispatch = useAppDispatch();
  const post = useAppSelector((state) => state.singlePostPage.post);
  const postRowUuid = useAppSelector(
    (state) => state.singlePostPage.postRowUuid
  );

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
    dispatch(goToNexPostInRow());
  }, [dispatch]);

  const goToPreviousPost = useCallback(() => {
    dispatch(goToPreviousPostInRow());
  }, [dispatch]);

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

          {post != undefined && postRowUuid != undefined && (
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
              className="flex flex-column max-width-height-percentage single-post-view-post-element"
            >
              <PostElement postRowUuid={postRowUuid} post={post} />
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
