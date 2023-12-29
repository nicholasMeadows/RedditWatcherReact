import {
  Touch,
  TouchEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
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
    if (dualTouching || imgScale != 1) {
      return;
    }
    setTouchEnd(null); // otherwise the swipe is fired even with usual touch events
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (dualTouching || imgScale != 1) {
      return;
    }
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || dualTouching || imgScale != 1) return;
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
  const [dualTouching, setDualTouching] = useState(false);

  const [lastImgTouchX, setLastImgTouchX] = useState(0);
  const [lastImgTouchY, setLastImgTouchY] = useState(0);

  const [initialTouchDistance, setInitialTouchDistance] = useState(0);
  const [lastTouchDistance, setLastTouchDistance] = useState(0);

  const [imgScale, setImgScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  const handleDragImage = (
    img: HTMLImageElement,
    movementX: number,
    movementY: number
  ) => {
    if (mouseDownOnImg) {
      const divWrapper =
        postElementDivWrapperRef.current as unknown as HTMLDivElement;
      const divWrapperRect = divWrapper.getBoundingClientRect();
      const divWrapperHeight = divWrapperRect.height;
      const divWrapperWidth = divWrapperRect.width;

      const rect = img.getBoundingClientRect();
      const imgHeight = rect.height;
      const imgWidth = rect.width;

      console.log(imgHeight, divWrapperHeight);
      if (imgHeight <= divWrapperHeight) {
        setTranslateY(0);
      } else {
        const maxTranslateY = (imgHeight - divWrapperHeight) / 2;
        const minTranslateY = maxTranslateY * -1;

        const updatedTranslateY = translateY + movementY;
        if (
          updatedTranslateY > minTranslateY &&
          updatedTranslateY < maxTranslateY
        ) {
          setTranslateY(updatedTranslateY);
        }
      }

      if (imgWidth <= divWrapperWidth) {
        setTranslateX(0);
      } else {
        const maxTranslateX = (imgWidth - divWrapperWidth) / 2;
        const minTranslateX = maxTranslateX * -1;

        const updatedTranslateX = translateX + movementX;
        if (
          updatedTranslateX > minTranslateX &&
          updatedTranslateX < maxTranslateX
        ) {
          setTranslateX(updatedTranslateX);
        }
      }
    }
  };
  const handlePostElementImageScale = (
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
        setTranslateX(0);
        setTranslateY(0);
      }
      return;
    }
    setImgScale(updatedScale);

    const rect = postElementImageElement.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const scaledWidth = (width / imgScale) * updatedScale;
    const scaledHeight = (height / imgScale) * updatedScale;

    const scaledLeft = rect.left + (width - scaledWidth) / 2;
    const scaledTop = rect.top + (height - scaledHeight) / 2;

    const currentRelativeX = eventClientX - rect.left;
    const currentRelativeY = eventClientY - rect.top;

    const scaledRelativeX = (currentRelativeX / imgScale) * updatedScale;
    const scaledRelativeY = (currentRelativeY / imgScale) * updatedScale;

    setTranslateX(translateX + (eventClientX - (scaledLeft + scaledRelativeX)));

    setTranslateY(translateY + (eventClientY - (scaledTop + scaledRelativeY)));
  };
  const calTouchDistance = (touch1: Touch, touch2: Touch) => {
    const x1 = touch1.clientX;
    const y1 = touch1.clientY;
    const x2 = touch2.clientX;
    const y2 = touch2.clientY;

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
                translateX={translateX}
                translateY={translateY}
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
                    event.movementY
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
                  const dualTouch = event.targetTouches.length == 2;
                  if (dualTouch) {
                    setMouseDownOnImg(false);
                    setInitialTouchDistance(
                      calTouchDistance(
                        event.targetTouches[0],
                        event.targetTouches[1]
                      )
                    );
                  } else {
                    if (event.targetTouches.length == 1) {
                      setMouseDownOnImg(true);
                      setLastImgTouchX(event.targetTouches[0].clientX);
                      setLastImgTouchY(event.targetTouches[0].clientY);
                    }

                    setInitialTouchDistance(0);
                    setLastTouchDistance(0);
                  }
                  setDualTouching(dualTouch);
                }}
                onTouchEnd={(event) => {
                  const dualTouch = event.targetTouches.length == 2;
                  if (dualTouch) {
                    setMouseDownOnImg(false);
                    setInitialTouchDistance(
                      calTouchDistance(
                        event.targetTouches[0],
                        event.targetTouches[1]
                      )
                    );
                  } else {
                    if (event.targetTouches.length == 1) {
                      if (event.targetTouches.length == 1) {
                        setMouseDownOnImg(false);
                        setLastImgTouchX(0);
                        setLastImgTouchY(0);
                      }
                    }

                    setInitialTouchDistance(0);
                    setLastTouchDistance(0);
                  }
                  setDualTouching(dualTouch);
                }}
                onTouchMove={(event) => {
                  if (mouseDownOnImg && event.targetTouches.length == 1) {
                    const touch = event.targetTouches[0];
                    handleDragImage(
                      event.target as HTMLImageElement,
                      touch.clientX - lastImgTouchX,
                      touch.clientY - lastImgTouchY
                    );
                    setLastImgTouchX(touch.clientX);
                    setLastImgTouchY(touch.clientY);
                  }

                  if (dualTouching) {
                    const touch1 = event.touches[0];
                    const touch2 = event.touches[1];
                    const currentTouchDistance = calTouchDistance(
                      touch1,
                      touch2
                    );

                    if (
                      Math.abs(currentTouchDistance - lastTouchDistance) < 8
                    ) {
                      return;
                    }
                    setLastTouchDistance(currentTouchDistance);
                    const delta =
                      currentTouchDistance < initialTouchDistance ? 1 : -1;
                    const rect = (
                      event.target as HTMLImageElement
                    ).getBoundingClientRect();
                    const relativeX1 = touch1.clientX - rect.left; //x position within the element.
                    const relativeY1 = touch1.clientY - rect.top; //y position within the element.
                    const relativeX2 = touch2.clientX - rect.left; //x position within the element.
                    const relativeY2 = touch2.clientY - rect.top; //y position within the element.

                    const midpointX = (relativeX1 + relativeX2) / 2;
                    const midpointY = (relativeY1 + relativeY2) / 2;
                    handlePostElementImageScale(
                      delta,
                      event.target as HTMLImageElement,
                      midpointX,
                      midpointY
                    );
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
