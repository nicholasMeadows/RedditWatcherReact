import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import {
  SINGLE_POST_PAGE_MAX_SCALE,
  SINGLE_POST_PAGE_MIN_SCALE,
  SINGLE_POST_PAGE_SCALE_STEP,
} from "../RedditWatcherConstants.ts";

export default function useSinglePostPageZoom(
  postElementDivWrapperRef: RefObject<HTMLDivElement>,
  goToNextPostClicked: () => void,
  goToPrevPostClicked: () => void
) {
  const minSwipeDistance = 50;

  const [imgScale, setImgScale] = useState(1);
  const [imgXPercent, setImgXPercentage] = useState(50);
  const [imgYPercent, setImgYPercentage] = useState(50);

  const mouseDownOnImgRef = useRef(false);

  const lastSwipeX = useRef(0);
  const lastSwipeY = useRef(0);
  const totalSwipeDistance = useRef(0);
  const swipedToAnotherPost = useRef(false);
  const lastPinchDistance = useRef(0);

  const resetImgPositionAndScale = useCallback(() => {
    setImgXPercentage(50);
    setImgYPercentage(50);
    setImgScale(1);
  }, []);

  const moveImage = useCallback(
    (
      movementX: number,
      movementY: number,
      imgWidth: number,
      imgHeight: number,
      imgLeft: number,
      imgRight: number,
      imgTop: number,
      imgBottom: number
    ) => {
      const parent =
        postElementDivWrapperRef.current as unknown as HTMLDivElement;
      const parentRect = parent.getBoundingClientRect();
      const parentWidth = parentRect.width;
      const parentHeight = parentRect.height;
      const parentLeft = parentRect.left;
      const parentRight = parentRect.right;
      const parentTop = parentRect.top;
      const parentBottom = parentRect.bottom;

      if (parentLeft < imgLeft && imgRight < parentRight) {
        setImgXPercentage(50);
      } else if (parentLeft < imgLeft) {
        const diff = imgLeft - parentLeft;
        setImgXPercentage(imgXPercent - (diff / parentWidth) * 100);
      } else if (parentRight > imgRight) {
        const diff = parentRight - imgRight;
        setImgXPercentage(imgXPercent + (diff / parentWidth) * 100);
      } else {
        const percentageMovementX = (movementX / parentWidth) * 100;
        const updatedImgXPercent = imgXPercent + percentageMovementX;
        const maxXDelta = Math.max(
          0,
          ((imgWidth - parentWidth) / 2 / parentWidth) * 100
        );
        if (Math.abs(updatedImgXPercent - 50) < maxXDelta) {
          setImgXPercentage(updatedImgXPercent);
        }
      }

      if (parentTop < imgTop && imgBottom < parentBottom) {
        setImgYPercentage(50);
      } else if (parentTop < imgTop) {
        const diff = imgTop - parentTop;
        setImgYPercentage(imgYPercent - (diff / parentHeight) * 100);
      } else if (imgBottom < parentBottom) {
        const diff = parentBottom - imgBottom;
        setImgYPercentage(imgYPercent + (diff / parentHeight) * 100);
      } else {
        const percentageMovementY = (movementY / parentHeight) * 100;
        const updatedImgYPercent = imgYPercent + percentageMovementY;
        const maxYDelta = Math.max(
          0,
          ((imgHeight - parentHeight) / 2 / parentHeight) * 100
        );
        if (Math.abs(updatedImgYPercent - 50) < maxYDelta) {
          setImgYPercentage(updatedImgYPercent);
        }
      }
    },
    [imgXPercent, imgYPercent, postElementDivWrapperRef]
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
        return;
      }
      setImgScale(updatedScale);

      const rect = postElementImageElement.getBoundingClientRect();

      const width = rect.width;
      const scaledWidth = (width / imgScale) * updatedScale;
      const scaledLeft = rect.left + (width - scaledWidth) / 2;
      const scaledRight = rect.right - (width - scaledWidth) / 2;
      const currentRelativeX = eventClientX - rect.left;
      const scaledRelativeX = (currentRelativeX / imgScale) * updatedScale;

      const height = rect.height;
      const scaledHeight = (height / imgScale) * updatedScale;
      const scaledTop = rect.top + (height - scaledHeight) / 2;
      const scaledBottom = rect.bottom - (height - scaledHeight) / 2;
      const currentRelativeY = eventClientY - rect.top;
      const scaledRelativeY = (currentRelativeY / imgScale) * updatedScale;

      moveImage(
        eventClientX - (scaledLeft + scaledRelativeX),
        eventClientY - (scaledTop + scaledRelativeY),
        scaledWidth,
        scaledHeight,
        scaledLeft,
        scaledRight,
        scaledTop,
        scaledBottom
      );
    },
    [imgScale, moveImage]
  );

  const calcTouchDistance = useCallback(
    (x1: number, y1: number, x2: number, y2: number) => {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },
    []
  );

  const postMediaElementOnTouchStart = useCallback(
    (event: TouchEvent) => {
      const touches = event.touches;
      if (touches.length == 1) {
        lastSwipeX.current = touches[0].clientX;
        lastSwipeY.current = touches[0].clientY;
        totalSwipeDistance.current = 0;
        swipedToAnotherPost.current = false;
      } else if (touches.length === 2) {
        const touch1 = touches[0];
        const touch2 = touches[1];
        lastPinchDistance.current = calcTouchDistance(
          touch1.clientX,
          touch1.clientY,
          touch2.clientX,
          touch2.clientY
        );
      }
    },
    [calcTouchDistance]
  );

  const postMediaElementOnTouchMove = useCallback(
    (event: TouchEvent) => {
      const touches = event.touches;
      if (touches.length == 1) {
        const deltaX = touches[0].clientX - lastSwipeX.current;
        const deltaY = touches[0].clientY - lastSwipeY.current;
        totalSwipeDistance.current += deltaX;
        lastSwipeX.current = touches[0].clientX;
        lastSwipeY.current = touches[0].clientY;
        if (
          Math.abs(totalSwipeDistance.current) > minSwipeDistance &&
          imgScale === 1 &&
          !swipedToAnotherPost.current
        ) {
          swipedToAnotherPost.current = true;
          if (totalSwipeDistance.current < 0) {
            goToNextPostClicked();
          } else if (totalSwipeDistance.current > 0) {
            goToPrevPostClicked();
          }
        } else {
          const img = event.target as HTMLImageElement;
          const rect = img.getBoundingClientRect();
          moveImage(
            deltaX,
            deltaY,
            rect.width,
            rect.height,
            rect.left,
            rect.right,
            rect.top,
            rect.bottom
          );
        }
      } else if (touches.length === 2) {
        const touch1 = touches[0];
        const touch2 = touches[1];
        const currentTouchDistance = calcTouchDistance(
          touch1.clientX,
          touch1.clientY,
          touch2.clientX,
          touch2.clientY
        );
        if (Math.abs(lastPinchDistance.current - currentTouchDistance) > 6) {
          handlePostElementImageScale(
            lastPinchDistance.current - currentTouchDistance,
            event.target as HTMLImageElement,
            (touch1.clientX + touch2.clientX) / 2,
            (touch1.clientY + touch2.clientY) / 2
          );

          lastPinchDistance.current = currentTouchDistance;
        }
      }
    },
    [
      calcTouchDistance,
      goToNextPostClicked,
      goToPrevPostClicked,
      handlePostElementImageScale,
      imgScale,
      moveImage,
    ]
  );

  const onTouchEnd = useCallback((event: TouchEvent) => {
    const touches = event.touches;
    if (touches.length == 0) {
      swipedToAnotherPost.current = false;
    } else if (touches.length === 1) {
      lastSwipeX.current = touches[0].clientX;
      lastSwipeY.current = touches[0].clientY;
      totalSwipeDistance.current = 0;
    }
  }, []);

  useEffect(() => {
    const postElementDivWrapper = postElementDivWrapperRef.current;
    if (postElementDivWrapper === null) {
      return;
    }

    const handleMouseOut = () => {
      mouseDownOnImgRef.current = false;
    };
    const handleMouseDown = () => {
      mouseDownOnImgRef.current = true;
    };
    const handleMouseUp = () => {
      mouseDownOnImgRef.current = false;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (mouseDownOnImgRef.current) {
        const imgElement = event.target as HTMLImageElement;
        const imgRect = imgElement.getBoundingClientRect();
        const imgWidth = imgRect.width;
        const imgHeight = imgRect.height;
        const imgLeft = imgRect.left;
        const imgRight = imgRect.right;
        const imgTop = imgRect.top;
        const imgBottom = imgRect.bottom;
        moveImage(
          event.movementX,
          event.movementY,
          imgWidth,
          imgHeight,
          imgLeft,
          imgRight,
          imgTop,
          imgBottom
        );
      }
    };

    const handleWheel = (event: WheelEvent) => {
      handlePostElementImageScale(
        event.deltaY,
        event.target as HTMLImageElement,
        event.clientX,
        event.clientY
      );
    };
    postElementDivWrapper.addEventListener("mouseout", handleMouseOut);
    postElementDivWrapper.addEventListener("mousedown", handleMouseDown);
    postElementDivWrapper.addEventListener("mouseup", handleMouseUp);
    postElementDivWrapper.addEventListener("mousemove", handleMouseMove);
    postElementDivWrapper.addEventListener("wheel", handleWheel);
    postElementDivWrapper.addEventListener(
      "touchstart",
      postMediaElementOnTouchStart
    );
    postElementDivWrapper.addEventListener(
      "touchmove",
      postMediaElementOnTouchMove
    );
    postElementDivWrapper.addEventListener("touchend", onTouchEnd);

    return () => {
      postElementDivWrapper.removeEventListener("mouseout", handleMouseOut);
      postElementDivWrapper.removeEventListener("mousedown", handleMouseDown);
      postElementDivWrapper.removeEventListener("mouseup", handleMouseUp);
      postElementDivWrapper.removeEventListener("mousemove", handleMouseMove);
      postElementDivWrapper.removeEventListener("wheel", handleWheel);
      postElementDivWrapper.removeEventListener(
        "touchstart",
        postMediaElementOnTouchStart
      );
      postElementDivWrapper.removeEventListener(
        "touchmove",
        postMediaElementOnTouchMove
      );
      postElementDivWrapper.removeEventListener("touchend", onTouchEnd);
    };
  }, [
    handlePostElementImageScale,
    moveImage,
    onTouchEnd,
    postElementDivWrapperRef,
    postMediaElementOnTouchMove,
    postMediaElementOnTouchStart,
  ]);

  return {
    resetImgPositionAndScale,
    imgXPercent,
    imgYPercent,
    imgScale,
  };
}
