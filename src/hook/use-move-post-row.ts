import { MutableRefObject, useCallback, useEffect, useRef } from "react";
import { v4 as uuidV4 } from "uuid";
import { useAppSelector } from "../redux/store.ts";
import { Post } from "../model/Post/Post.ts";
import { PostRow } from "../model/PostRow.ts";
import { AutoScrollPostRowDirectionOptionEnum } from "../model/config/enums/AutoScrollPostRowDirectionOptionEnum.ts";

export default function useMovePostRow(
  postRow: PostRow,
  postRowContentDivRef: MutableRefObject<HTMLDivElement | null>,
  postsToShow: Array<Post>,
  setPostsToShow: (updatedPostsToShow: Array<Post>) => void
) {
  const autoScrollPostRowRateSecondsForSinglePostCard = useAppSelector(
    (state) => state.appConfig.autoScrollPostRowRateSecondsForSinglePostCard
  );
  const postCardWidthPercentage = useAppSelector(
    (state) => state.postRows.postCardWidthPercentage
  );
  const autoScrollPostRowDirectionOption = useAppSelector(
    (state) => state.appConfig.autoScrollPostRowDirectionOption
  );
  const lastMouseDownOrTouchX = useRef(0);
  const mouseDownOrTouchOnPostRow = useRef(false);

  const scrollToPx = useRef(0);
  const autoScrollInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const postRowContentDiv = postRowContentDivRef.current;
    if (postRowContentDiv === null || scrollToPx.current === 0) {
      return;
    }
    postRowContentDiv.scrollTo({
      left: scrollToPx.current,
    });
    scrollToPx.current = 0;
  }, [postRowContentDivRef, postsToShow]);

  const movePostRow = useCallback(
    (updatedX: number) => {
      if (!mouseDownOrTouchOnPostRow.current) {
        return;
      }
      const postRowContentDiv = postRowContentDivRef.current;
      if (postRowContentDiv !== null) {
        const deltaX = lastMouseDownOrTouchX.current - updatedX;
        postRowContentDiv.scrollBy({ left: deltaX });
        lastMouseDownOrTouchX.current = updatedX;
      }
    },
    [postRowContentDivRef]
  );

  const onPostRowContentScroll = useCallback(() => {
    const postRowContentDiv = postRowContentDivRef.current;
    if (postRowContentDiv === null) {
      return;
    }
    const scrollLeft = postRowContentDiv.scrollLeft;
    const scrollWidth = postRowContentDiv.scrollWidth;
    const clientWidth = postRowContentDiv.clientWidth;

    const postCardWidthPx = (postCardWidthPercentage / 100) * clientWidth;

    const updatedPostsToShow = [...postsToShow];

    if (scrollLeft === 0 || scrollLeft + clientWidth >= scrollWidth) {
      const postsToInsert = postRow.posts.map((post) => {
        return {
          ...post,
          postUuid: `${uuidV4()}:${post.postUuid}`,
        };
      });
      if (scrollLeft === 0) {
        updatedPostsToShow.unshift(...postsToInsert);
        setPostsToShow(updatedPostsToShow);
        scrollToPx.current = postCardWidthPx * postRow.posts.length;
      } else if (scrollLeft + clientWidth >= scrollWidth) {
        updatedPostsToShow.push(...postsToInsert);
        setPostsToShow(updatedPostsToShow);
      }
    }

    if (scrollLeft > postCardWidthPx * postRow.posts.length) {
      updatedPostsToShow.splice(0, postRow.posts.length);
      setPostsToShow(updatedPostsToShow);
      postRowContentDiv.scrollTo({ left: 0 });
    }

    if (
      postsToShow.length === postRow.posts.length * 2 &&
      scrollLeft + clientWidth < postCardWidthPx * postRow.posts.length
    ) {
      updatedPostsToShow.splice(postRow.posts.length);
      setPostsToShow(updatedPostsToShow);
    }
  }, [
    postCardWidthPercentage,
    postRow.posts,
    postRowContentDivRef,
    postsToShow,
    setPostsToShow,
  ]);

  const createAutoScrollInterval = useCallback(() => {
    const postRowContentDiv = postRowContentDivRef.current;
    if (postRowContentDiv === null) {
      return;
    }
    const scrollPxPerStep = 1;
    const postCardWidthPx =
      postRowContentDiv.clientWidth * (postCardWidthPercentage / 100);
    const steps = postCardWidthPx / scrollPxPerStep;
    const intervalMs =
      (autoScrollPostRowRateSecondsForSinglePostCard * 1000) / steps;

    autoScrollInterval.current = setInterval(() => {
      console.log(
        "autoScrollPostRowDirectionOption",
        autoScrollPostRowDirectionOption
      );
      if (
        autoScrollPostRowDirectionOption ===
        AutoScrollPostRowDirectionOptionEnum.Left
      ) {
        postRowContentDiv.scroll({
          left: postRowContentDiv.scrollLeft + scrollPxPerStep,
        });
      } else if (
        autoScrollPostRowDirectionOption ===
        AutoScrollPostRowDirectionOptionEnum.Right
      ) {
        postRowContentDiv.scroll({
          left: postRowContentDiv.scrollLeft - scrollPxPerStep,
        });
      }
    }, intervalMs);
  }, [
    autoScrollPostRowDirectionOption,
    autoScrollPostRowRateSecondsForSinglePostCard,
    postCardWidthPercentage,
    postRowContentDivRef,
  ]);

  const clearAutoScrollInterval = useCallback(() => {
    if (autoScrollInterval.current !== null) {
      clearInterval(autoScrollInterval.current);
    }
  }, []);

  useEffect(() => {
    createAutoScrollInterval();
    return () => {
      clearAutoScrollInterval();
    };
  }, [
    autoScrollPostRowRateSecondsForSinglePostCard,
    clearAutoScrollInterval,
    createAutoScrollInterval,
    postCardWidthPercentage,
  ]);

  useEffect(() => {
    const mouseEnter = () => {
      clearAutoScrollInterval();
    };
    const mouseLeave = () => {
      clearAutoScrollInterval();
      createAutoScrollInterval();
    };
    const mouseDownTouchStart = (event: MouseEvent | TouchEvent) => {
      mouseDownOrTouchOnPostRow.current = true;
      clearAutoScrollInterval();
      if (event instanceof MouseEvent) {
        lastMouseDownOrTouchX.current = event.clientX;
      } else if (event instanceof TouchEvent) {
        const touches = event.touches;
        if (touches.length == 1) {
          lastMouseDownOrTouchX.current = touches[0].clientX;
        } else if (touches.length == 2) {
          const touch1 = touches[0];
          const touch2 = touches[1];
          lastMouseDownOrTouchX.current = (touch1.clientX + touch2.clientX) / 2;
        }
      }
    };
    const mouseUpTouchEnd = (event: MouseEvent | TouchEvent) => {
      if (event instanceof MouseEvent) {
        mouseDownOrTouchOnPostRow.current = false;
        lastMouseDownOrTouchX.current = 0;
        clearAutoScrollInterval();
        createAutoScrollInterval();
      } else if (event instanceof TouchEvent) {
        const touches = event.touches;
        if (touches.length === 0) {
          mouseDownOrTouchOnPostRow.current = false;
          lastMouseDownOrTouchX.current = 0;
          clearAutoScrollInterval();
          createAutoScrollInterval();
        } else if (touches.length === 1) {
          mouseDownOrTouchOnPostRow.current = true;
          lastMouseDownOrTouchX.current = touches[0].clientX;
        } else if (touches.length == 2) {
          mouseDownOrTouchOnPostRow.current = true;
          const touch1 = touches[0];
          const touch2 = touches[1];
          lastMouseDownOrTouchX.current = (touch1.clientX + touch2.clientX) / 2;
        }
      }
    };

    const mouseMoveTouchMove = (event: MouseEvent | TouchEvent) => {
      if (event instanceof MouseEvent) {
        movePostRow(event.clientX);
      } else if (event instanceof TouchEvent) {
        const touches = event.touches;
        if (touches.length === 1) {
          movePostRow(touches[0].clientX);
        } else if (touches.length === 2) {
          const touch1 = touches[0];
          const touch2 = touches[1];
          movePostRow((touch1.clientX + touch2.clientX) / 2);
        }
      }
    };

    const postRowContentDiv = postRowContentDivRef.current;
    if (postRowContentDiv !== null) {
      postRowContentDiv.addEventListener("mouseenter", mouseEnter);
      postRowContentDiv.addEventListener("mouseleave", mouseLeave);
      postRowContentDiv.addEventListener("mousedown", mouseDownTouchStart);
      postRowContentDiv.addEventListener("touchstart", mouseDownTouchStart);
      postRowContentDiv.addEventListener("mouseup", mouseUpTouchEnd);
      postRowContentDiv.addEventListener("touchend", mouseUpTouchEnd);
      postRowContentDiv.addEventListener("mousemove", mouseMoveTouchMove);
      postRowContentDiv.addEventListener("touchmove", mouseMoveTouchMove);
      postRowContentDiv.addEventListener("scroll", onPostRowContentScroll);
    }
    return () => {
      if (postRowContentDiv !== null) {
        postRowContentDiv.removeEventListener("mouseenter", mouseEnter);
        postRowContentDiv.removeEventListener("mouseleave", mouseLeave);
        postRowContentDiv.removeEventListener("mousedown", mouseDownTouchStart);
        postRowContentDiv.removeEventListener(
          "touchstart",
          mouseDownTouchStart
        );
        postRowContentDiv.removeEventListener("mouseup", mouseUpTouchEnd);
        postRowContentDiv.removeEventListener("touchend", mouseUpTouchEnd);
        postRowContentDiv.removeEventListener("mousemove", mouseMoveTouchMove);
        postRowContentDiv.removeEventListener("touchmove", mouseMoveTouchMove);
        postRowContentDiv.removeEventListener("scroll", onPostRowContentScroll);
      }
    };
  }, [
    clearAutoScrollInterval,
    createAutoScrollInterval,
    movePostRow,
    onPostRowContentScroll,
    postRowContentDivRef,
  ]);
}
