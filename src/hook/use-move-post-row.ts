import {
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Post } from "../model/Post/Post.ts";
import { AppConfigStateContext } from "../context/app-config-context.ts";
import { AutoScrollPostRowDirectionOptionEnum } from "../model/config/enums/AutoScrollPostRowDirectionOptionEnum.ts";
import { v4 as uuidV4 } from "uuid";
import { MOVE_POST_ROW_SESSION_STORAGE_KEY_SUFFIX } from "../RedditWatcherConstants.ts";

type MovePostRowStateSessionStorage = {
  postsToShow: Array<Post>;
  scrollLeft: number;
};
export default function useMovePostRow(
  postRowUuid: string,
  masterPosts: Array<Post>,
  postRowContentDivRef: RefObject<HTMLDivElement>,
  shouldAutoScroll: boolean,
  postCardWidthPercentage: number,
  postsToShowInRow: number
) {
  const POST_ROW_STATE_SESSION_STORAGE_KEY = `${postRowUuid}${MOVE_POST_ROW_SESSION_STORAGE_KEY_SUFFIX}`;

  const autoScrollPostRowRateSecondsForSinglePostCard = useContext(
    AppConfigStateContext
  ).autoScrollPostRowRateSecondsForSinglePostCard;
  const autoScrollPostRowDirectionOption = useContext(
    AppConfigStateContext
  ).autoScrollPostRowDirectionOption;
  const [postsToShow, setPostsToShow] = useState<Array<Post>>([]);

  const currentPostRowScrollLeft = useRef<number>(0);
  const autoScrollInterval = useRef<NodeJS.Timeout>();
  const mouseDownOrTouchOnPostRow = useRef<boolean>(false);
  const lastMouseDownOrTouchX = useRef<number>(0);

  const updatePostsToShowAndScrollLeft = useCallback(
    (
      postRowContentDiv: HTMLDivElement,
      postsToShow: Array<Post>,
      scrollLeft: number
    ) => {
      setPostsToShow(postsToShow);
      setTimeout(() => postRowContentDiv.scrollTo({ left: scrollLeft }), 0);
      const sessionStorageState: MovePostRowStateSessionStorage = {
        postsToShow: postsToShow,
        scrollLeft: scrollLeft,
      };
      sessionStorage.setItem(
        POST_ROW_STATE_SESSION_STORAGE_KEY,
        JSON.stringify(sessionStorageState)
      );
    },
    [POST_ROW_STATE_SESSION_STORAGE_KEY]
  );

  useEffect(() => {
    const postRowContentDiv = postRowContentDivRef.current;
    if (postRowContentDiv === null) {
      return;
    }

    const sessionStorageStateString = sessionStorage.getItem(
      POST_ROW_STATE_SESSION_STORAGE_KEY
    );

    let sessionStorageObj: MovePostRowStateSessionStorage | undefined;

    try {
      if (
        sessionStorageStateString !== null &&
        sessionStorageStateString !== ""
      ) {
        sessionStorageObj = JSON.parse(sessionStorageStateString);
      }
    } finally {
      if (sessionStorageObj === undefined) {
        if (masterPosts.length <= postsToShowInRow) {
          sessionStorageObj = {
            postsToShow: masterPosts,
            scrollLeft: 0,
          };
        } else {
          const postRowContentDivWidth =
            postRowContentDiv.getBoundingClientRect().width;
          const cardWidthPx =
            postRowContentDivWidth * (postCardWidthPercentage / 100);

          const postsToShowToSet = new Array<Post>();
          const lastPost = masterPosts[masterPosts.length - 1];
          postsToShowToSet.push({
            ...lastPost,
            postUuid: `${uuidV4()}:${lastPost.postUuid}`,
          });
          postsToShowToSet.push(...masterPosts.slice(0, postsToShowInRow + 1));
          sessionStorageObj = {
            postsToShow: postsToShowToSet,
            scrollLeft: cardWidthPx,
          };
        }
      }

      updatePostsToShowAndScrollLeft(
        postRowContentDiv,
        sessionStorageObj.postsToShow,
        sessionStorageObj.scrollLeft
      );
    }
  }, [
    POST_ROW_STATE_SESSION_STORAGE_KEY,
    masterPosts,
    postCardWidthPercentage,
    postRowContentDivRef,
    postsToShowInRow,
    updatePostsToShowAndScrollLeft,
  ]);

  const createAutoScrollInterval = useCallback(() => {
    const postRowContentDiv = postRowContentDivRef.current;
    if (postRowContentDiv === null || !shouldAutoScroll) {
      return;
    }
    const scrollPxPerStep = 1;
    const postCardWidthPx =
      postRowContentDiv.getBoundingClientRect().width *
      (postCardWidthPercentage / 100);
    const steps = postCardWidthPx / scrollPxPerStep;
    const intervalMs =
      (autoScrollPostRowRateSecondsForSinglePostCard * 1000) / steps;

    autoScrollInterval.current = setInterval(() => {
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
    shouldAutoScroll,
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

  const onPostRowContentScroll = useCallback(() => {
    const postRowContentDiv = postRowContentDivRef.current;
    if (postRowContentDiv === null) {
      return;
    }
    const updatedPostsToShow = [...postsToShow];

    const scrollLeft = postRowContentDiv.scrollLeft;
    let updatedScrollLeft = scrollLeft;
    const postRowContentDivWidth =
      postRowContentDiv.getBoundingClientRect().width;
    const postRowContentDivScrollWidth = postRowContentDiv.scrollWidth;
    const postCardWidthPx =
      postRowContentDivWidth * (postCardWidthPercentage / 100);

    if (currentPostRowScrollLeft.current > scrollLeft) {
      if (scrollLeft === 0) {
        const firstPostShowing = postsToShow[0];
        const indexInMaster = masterPosts.findIndex((post) =>
          firstPostShowing.postUuid.endsWith(post.postUuid)
        );
        if (indexInMaster === -1) {
          return;
        }
        const postToInsert =
          masterPosts[
            indexInMaster === 0 ? masterPosts.length - 1 : indexInMaster - 1
          ];

        updatedPostsToShow.unshift({
          ...postToInsert,
          postUuid: `${uuidV4()}:${postToInsert.postUuid}`,
        });
        updatedScrollLeft = postCardWidthPx;
      }
      if (
        Math.abs(
          scrollLeft + postRowContentDivWidth - postRowContentDivScrollWidth
        ) > postCardWidthPx
      ) {
        updatedPostsToShow.pop();
      }
      updatePostsToShowAndScrollLeft(
        postRowContentDiv,
        updatedPostsToShow,
        updatedScrollLeft
      );
    } else if (currentPostRowScrollLeft.current < scrollLeft) {
      if (
        Math.round(scrollLeft + postRowContentDivWidth) >=
        postRowContentDivScrollWidth
      ) {
        const lastPostBeingShown = postsToShow[postsToShow.length - 1];
        const lastPostBeingShownIndexInMaster = masterPosts.findIndex((post) =>
          lastPostBeingShown.postUuid.endsWith(post.postUuid)
        );
        if (lastPostBeingShownIndexInMaster === -1) {
          return;
        }
        const masterIndexToInsert =
          lastPostBeingShownIndexInMaster === masterPosts.length - 1
            ? 0
            : lastPostBeingShownIndexInMaster + 1;
        const masterPostToInsert = masterPosts[masterIndexToInsert];
        const postToInsert = {
          ...masterPostToInsert,
          postUuid: `${uuidV4()}:${masterPostToInsert.postUuid}`,
        };
        updatedPostsToShow.push(postToInsert);
      }
      if (scrollLeft > postCardWidthPx) {
        updatedPostsToShow.shift();
        updatedScrollLeft = scrollLeft - postCardWidthPx;
      }
      updatePostsToShowAndScrollLeft(
        postRowContentDiv,
        updatedPostsToShow,
        updatedScrollLeft
      );
    }
    currentPostRowScrollLeft.current = scrollLeft;
  }, [
    masterPosts,
    postCardWidthPercentage,
    postRowContentDivRef,
    postsToShow,
    updatePostsToShowAndScrollLeft,
  ]);

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

  useEffect(() => {
    const postRowContentDiv = postRowContentDivRef.current;
    if (postRowContentDiv === null) {
      return;
    }

    const mouseEnter = () => {
      clearAutoScrollInterval();
    };
    const mouseLeave = () => {
      mouseDownOrTouchOnPostRow.current = false;
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

    postRowContentDiv.addEventListener("scroll", onPostRowContentScroll);
    postRowContentDiv.addEventListener("mouseenter", mouseEnter);
    postRowContentDiv.addEventListener("mouseleave", mouseLeave);
    postRowContentDiv.addEventListener("mousedown", mouseDownTouchStart);
    postRowContentDiv.addEventListener("touchstart", mouseDownTouchStart);
    postRowContentDiv.addEventListener("mouseup", mouseUpTouchEnd);
    postRowContentDiv.addEventListener("touchend", mouseUpTouchEnd);
    postRowContentDiv.addEventListener("mousemove", mouseMoveTouchMove);
    postRowContentDiv.addEventListener("touchmove", mouseMoveTouchMove);
    return () => {
      postRowContentDiv.removeEventListener("scroll", onPostRowContentScroll);
      postRowContentDiv.removeEventListener("mouseenter", mouseEnter);
      postRowContentDiv.removeEventListener("mouseleave", mouseLeave);
      postRowContentDiv.removeEventListener("mousedown", mouseDownTouchStart);
      postRowContentDiv.removeEventListener("touchstart", mouseDownTouchStart);
      postRowContentDiv.removeEventListener("mouseup", mouseUpTouchEnd);
      postRowContentDiv.removeEventListener("touchend", mouseUpTouchEnd);
      postRowContentDiv.removeEventListener("mousemove", mouseMoveTouchMove);
      postRowContentDiv.removeEventListener("touchmove", mouseMoveTouchMove);
    };
  }, [
    clearAutoScrollInterval,
    createAutoScrollInterval,
    movePostRow,
    onPostRowContentScroll,
    postRowContentDivRef,
  ]);

  return postsToShow;
}
