import { useAppDispatch, useAppSelector } from "../../redux/store";
import PostElement from "./PostElement";
import {
  goToNextPost,
  goToPreviousPost,
} from "../../redux/slice/SinglePostPageSlice";
import PostContextMenuEvent from "../../model/Events/PostContextMenuEvent";
import { setPostContextMenuEvent } from "../../redux/slice/ContextMenuSlice";
import { TouchEvent, useState } from "react";

const SinglePostView: React.FC = () => {
  const dispatch = useAppDispatch();

  const postRow = useAppSelector((state) => state.singlePostPage.postRow);
  const post = useAppSelector((state) => state.singlePostPage.postToShow);

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
      dispatch(goToNextPost());
    }

    if (isRightSwipe) {
      dispatch(goToPreviousPost());
    }
  };

  return (
    <>
      {post != undefined && (
        <div
          className="flex flex-column max-width-height-percentage background"
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
            <div className="post-control-button-wrapper post-control-button-wrapper-padding-right">
              <button
                className="post-control-button"
                onClick={() => dispatch(goToPreviousPost())}
              >
                Previous Post
              </button>
            </div>
            <div className="post-control-button-wrapper post-control-button-wrapper-padding-left">
              <button
                className="post-control-button"
                onClick={() => dispatch(goToNextPost())}
              >
                Next Post
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SinglePostView;
