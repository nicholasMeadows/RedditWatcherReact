import { TouchEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  SINGLE_POST_PAGE_MAX_SCALE,
  SINGLE_POST_PAGE_MIN_SCALE,
  SINGLE_POST_PAGE_SCALE_STEP,
} from "../../RedditWatcherConstants";
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
  const postRowUuid = useAppSelector(
    (state) => state.singlePostPage.postRowUuid
  );
  const post = useAppSelector((state) => {
    const postRowUuid = state.singlePostPage.postRowUuid;
    const postUuid = state.singlePostPage.postUuid;
    if (postRowUuid == undefined || postUuid == undefined) {
      return;
    }

    const postRow = state.postRows.postRows.find(
      (pr) => pr.postRowUuid == postRowUuid
    );
    if (postRow != undefined) {
      return postRow.posts.find((p) => p.postUuid == postUuid);
    }
  });

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  // the required distance between touchStart and touchEnd to be detected as a swipe
  const minSwipeDistance = 50;
  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setTouchEnd(null); // otherwise the swipe is fired even with usual touch events
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || imgScale != 1) return;
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

  const postElementDivWrapperRef = useRef(null);

  const [mouseDownOnImg, setMouseDownOnImg] = useState(false);

  const [touch1X, setTouch1X] = useState(0);
  const [touch1Y, setTouch1Y] = useState(0);
  const [touch2X, setTouch2X] = useState(0);
  const [touch2Y, setTouch2Y] = useState(0);

  const [imgScale, setImgScale] = useState(1);
  const [imgXPercent, setImgXPercent] = useState(50);
  const [imgYPercent, setImgYPercent] = useState(50);

  const handleDragImage = useCallback(
    (
      img: HTMLImageElement,
      movementX: number,
      movementY: number,
      mouseDownOnImg: boolean
    ) => {
      if (mouseDownOnImg) {
        const parent =
          postElementDivWrapperRef.current as unknown as HTMLDivElement;
        const parentRect = parent.getBoundingClientRect();
        const imgRect = img.getBoundingClientRect();

        const percentageMovementX = (movementX / parentRect.width) * 100;
        const percentageMovementY = (movementY / parentRect.height) * 100;

        const updatedImgXPercent = imgXPercent + percentageMovementX;
        const updatedImgYPercent = imgYPercent + percentageMovementY;

        const maxXDelta = Math.max(
          0,
          ((imgRect.width - parentRect.width) / 2 / parentRect.width) * 100
        );
        const maxYDelta = Math.max(
          0,
          ((imgRect.height - parentRect.height) / 2 / parentRect.height) * 100
        );

        if (Math.abs(updatedImgXPercent - 50) < maxXDelta) {
          setImgXPercent(updatedImgXPercent);
        }

        if (Math.abs(updatedImgYPercent - 50) < maxYDelta) {
          setImgYPercent(updatedImgYPercent);
        }
      }
    },
    [imgXPercent, imgYPercent]
  );

  const handlePostElementImageScale = useCallback(
    (
      inputDelta: number,
      postElementImageElement: HTMLImageElement,
      eventClientX: number,
      eventClientY: number
    ) => {
      const updatedScale =
        imgScale +
        (inputDelta > 0
          ? SINGLE_POST_PAGE_SCALE_STEP * -1
          : SINGLE_POST_PAGE_SCALE_STEP);

      if (
        updatedScale < SINGLE_POST_PAGE_MIN_SCALE ||
        updatedScale > SINGLE_POST_PAGE_MAX_SCALE
      ) {
        if (updatedScale < SINGLE_POST_PAGE_MIN_SCALE) {
          setImgXPercent(50);
          setImgYPercent(50);
        }
        return;
      }
      setImgScale(updatedScale);

      const rect = postElementImageElement.getBoundingClientRect();

      const width = rect.width;
      const scaledWidth = (width / imgScale) * updatedScale;
      const scaledLeft = rect.left + (width - scaledWidth) / 2;
      const currentRelativeX = eventClientX - rect.left;
      const scaledRelativeX = (currentRelativeX / imgScale) * updatedScale;

      const height = rect.height;
      const scaledHeight = (height / imgScale) * updatedScale;
      const scaledTop = rect.top + (height - scaledHeight) / 2;
      const currentRelativeY = eventClientY - rect.top;
      const scaledRelativeY = (currentRelativeY / imgScale) * updatedScale;

      handleDragImage(
        postElementImageElement,
        eventClientX - (scaledLeft + scaledRelativeX),
        eventClientY - (scaledTop + scaledRelativeY),
        true
      );
    },
    [handleDragImage, imgScale]
  );

  const calcTouchDistance = (
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

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
              ref={postElementDivWrapperRef}
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
              <PostElement
                postRowUuid={postRowUuid}
                post={post}
                scale={imgScale}
                imgXPercent={imgXPercent}
                imgYPercent={imgYPercent}
                onMouseOut={() => {
                  setMouseDownOnImg(false);
                }}
                onMouseDown={() => {
                  setMouseDownOnImg(true);
                }}
                onMouseUp={() => {
                  setMouseDownOnImg(false);
                }}
                onMouseMove={(event) => {
                  handleDragImage(
                    event.target as HTMLImageElement,
                    event.movementX,
                    event.movementY,
                    mouseDownOnImg
                  );
                }}
                onWheel={(event) => {
                  handlePostElementImageScale(
                    event.deltaY,
                    event.target as HTMLImageElement,
                    event.clientX,
                    event.clientY
                  );
                }}
                onTouchStart={(event) => {
                  const touches = event.touches;
                  if (touches.length == 1) {
                    setTouch1X(touches[0].clientX);
                    setTouch1Y(touches[0].clientY);
                  } else if (touches.length == 2) {
                    setTouch1X(touches[0].clientX);
                    setTouch1Y(touches[0].clientY);
                    setTouch2X(touches[1].clientX);
                    setTouch2Y(touches[1].clientY);
                  }
                }}
                onTouchMove={(event) => {
                  const image = event.target as HTMLImageElement;
                  const touches = event.touches;
                  const currentTouch1X = touches[0].clientX;
                  const currentTouch1Y = touches[0].clientY;

                  if (event.targetTouches.length == 1) {
                    handleDragImage(
                      image,
                      currentTouch1X - touch1X,
                      currentTouch1Y - touch1Y,
                      true
                    );
                    setTouch1X(currentTouch1X);
                    setTouch1Y(currentTouch1Y);
                  } else if (event.targetTouches.length == 2) {
                    const currentTouch2X = touches[1].clientX;
                    const currentTouch2Y = touches[1].clientY;

                    const initialDistance = calcTouchDistance(
                      touch1X,
                      touch1Y,
                      touch2X,
                      touch2Y
                    );
                    const currentDistance = calcTouchDistance(
                      currentTouch1X,
                      currentTouch1Y,
                      currentTouch2X,
                      currentTouch2Y
                    );

                    if (Math.abs(initialDistance - currentDistance) > 8) {
                      handlePostElementImageScale(
                        initialDistance - currentDistance,
                        image,
                        (currentTouch1X + currentTouch2X) / 2,
                        (currentTouch1Y + currentTouch2Y) / 2
                      );
                      setTouch1X(currentTouch1X);
                      setTouch1Y(currentTouch1Y);
                      setTouch2X(currentTouch2X);
                      setTouch2Y(currentTouch2Y);
                    }
                  }
                }}
              />
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
