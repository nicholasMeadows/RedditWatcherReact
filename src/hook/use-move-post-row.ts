import {
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Post } from "../model/Post/Post.ts";
import { v4 as uuidV4 } from "uuid";
import { AppConfigStateContext } from "../context/app-config-context.ts";
import { AutoScrollPostRowDirectionOptionEnum } from "../model/config/enums/AutoScrollPostRowDirectionOptionEnum.ts";
import { ContextMenuStateContext } from "../context/context-menu-context.ts";
import { MOVE_POST_ROW_SESSION_STORAGE_KEY_SUFFIX } from "../RedditWatcherConstants.ts";

type MovePostRowStateSessionStorage = {
  postsToShowUuids: Array<PostsToShowUuidsObj>;
  postSliderLeft: number;
};

type PostsToShowUuidsObj = {
  postUuid: string;
  uiUuid: string;
};
export default function useMovePostRow(
  postRowUuid: string,
  masterPosts: Array<Post>,
  postRowContentDivRef: RefObject<HTMLDivElement>,
  // shouldAutoScroll: boolean,
  postCardWidthPercentage: number,
  postsToShowInRow: number
) {
  const POST_ROW_STATE_SESSION_STORAGE_KEY = `${postRowUuid}${MOVE_POST_ROW_SESSION_STORAGE_KEY_SUFFIX}`;

  const {
    autoScrollPostRowRateSecondsForSinglePostCard,
    autoScrollPostRowDirectionOption,
  } = useContext(AppConfigStateContext);
  const { menuOpenOnPostRowUuid } = useContext(ContextMenuStateContext);

  const [postsToShowUuids, setPostsToShowUuids] = useState<
    Array<PostsToShowUuidsObj>
  >([]);

  const [postSliderLeft, setPostSliderLeft] = useState(0);
  const [postSliderLeftTransitionTime, setPostSliderLeftTransitionTime] =
    useState(0);

  const postSliderLeftOnNextRenderRef = useRef<number | undefined>(undefined);
  const postSliderLeftTransitionTimeOnNextRenderRef = useRef<
    number | undefined
  >(undefined);

  const contextMenuOpenOnPostRowRef = useRef(false);
  const mouseDownOnPostRow = useRef(false);
  const lastMouseDownX = useRef(0);
  const makePostsToShowUuidObj = (post: Post): PostsToShowUuidsObj => {
    return {
      uiUuid: `${uuidV4()}:${post.postUuid}`,
      postUuid: post.postUuid,
    };
  };

  // const setPostRowAutoScrollParams = useCallback(
  //   (
  //     postsToShowUuidsToSet: Array<PostsToShowUuidsObj>,
  //     postSliderLeftToSet: number,
  //     postSliderLeftTransitionTimeToSet: number
  //   ) => {
  //     setPostsToShowUuids(postsToShowUuidsToSet);
  //     setPostSliderLeft(postSliderLeftToSet);
  //     setPostSliderLeftTransitionTime(postSliderLeftTransitionTimeToSet);
  //
  //     const storageObj: MovePostRowStateSessionStorage = {
  //       postsToShowUuids: postsToShowUuids,
  //       postSliderLeft: postSliderLeft,
  //     };
  //     sessionStorage.setItem(
  //       POST_ROW_STATE_SESSION_STORAGE_KEY,
  //       JSON.stringify(storageObj)
  //     );
  //   },
  //   [POST_ROW_STATE_SESSION_STORAGE_KEY, postSliderLeft, postsToShowUuids]
  // );

  // const getSavedStateFromSession = useCallback(():
  //   | MovePostRowStateSessionStorage
  //   | undefined => {
  //   const sessionStorageString = sessionStorage.getItem(
  //     POST_ROW_STATE_SESSION_STORAGE_KEY
  //   );
  //   if (sessionStorageString === null) {
  //     return undefined;
  //   }
  //   try {
  //     return JSON.parse(sessionStorageString);
  //   } catch (e) {
  //     return undefined;
  //   }
  // }, [POST_ROW_STATE_SESSION_STORAGE_KEY]);

  useEffect(() => {
    if (postSliderLeftOnNextRenderRef.current !== undefined) {
      setPostSliderLeft(postSliderLeftOnNextRenderRef.current);
      postSliderLeftOnNextRenderRef.current = undefined;
    }
    if (postSliderLeftTransitionTimeOnNextRenderRef.current !== undefined) {
      setPostSliderLeftTransitionTime(
        postSliderLeftTransitionTimeOnNextRenderRef.current
      );
      postSliderLeftTransitionTimeOnNextRenderRef.current = undefined;
    }
  }, [postSliderLeft, postSliderLeftTransitionTime]);

  useLayoutEffect(() => {
    if (masterPosts.length <= postsToShowInRow) {
      const postsToShowUuidsToSet = masterPosts.map((post) =>
        makePostsToShowUuidObj(post)
      );
      setPostsToShowUuids(postsToShowUuidsToSet);
      setPostSliderLeft(0);
      setPostSliderLeftTransitionTime(0);
    } else if (
      autoScrollPostRowDirectionOption ===
      AutoScrollPostRowDirectionOptionEnum.Left
    ) {
      const postUuidsToPush = masterPosts
        .slice(0, postsToShowInRow + 1)
        .map<PostsToShowUuidsObj>((post) => makePostsToShowUuidObj(post));
      setPostsToShowUuids(postUuidsToPush);
      setPostSliderLeft(0);
      setPostSliderLeftTransitionTime(0);
      postSliderLeftOnNextRenderRef.current = postCardWidthPercentage * -1;
      postSliderLeftTransitionTimeOnNextRenderRef.current =
        autoScrollPostRowRateSecondsForSinglePostCard;
    } else if (
      autoScrollPostRowDirectionOption ===
      AutoScrollPostRowDirectionOptionEnum.Right
    ) {
      const firstPostUuidObj = makePostsToShowUuidObj(
        masterPosts[masterPosts.length - 1]
      );
      const postUuidObjsToPush = masterPosts
        .slice(0, postsToShowInRow)
        .map<PostsToShowUuidsObj>((post) => makePostsToShowUuidObj(post));
      setPostsToShowUuids([firstPostUuidObj, ...postUuidObjsToPush]);
      setPostSliderLeft(postCardWidthPercentage * -1);
      setPostSliderLeftTransitionTime(0);
      postSliderLeftOnNextRenderRef.current = 0;
      postSliderLeftTransitionTimeOnNextRenderRef.current =
        autoScrollPostRowRateSecondsForSinglePostCard;
    }
  }, [
    autoScrollPostRowDirectionOption,
    autoScrollPostRowRateSecondsForSinglePostCard,
    masterPosts,
    postCardWidthPercentage,
    postsToShowInRow,
  ]);

  const handleShiftUIPostsAndResetLeft = useCallback(
    (leftPercentage: number) => {
      const postRowContentDiv = postRowContentDivRef.current;
      if (postRowContentDiv === null) {
        return;
      }

      if (leftPercentage <= postCardWidthPercentage * -1) {
        const lastPostShowingUuidObj =
          postsToShowUuids[postsToShowUuids.length - 1];
        const masterPostIndex = masterPosts.findIndex(
          (post) => post.postUuid === lastPostShowingUuidObj.postUuid
        );
        if (masterPostIndex === -1) {
          return;
        }
        let postUuidObjToPush: PostsToShowUuidsObj;
        if (masterPostIndex === masterPosts.length - 1) {
          postUuidObjToPush = makePostsToShowUuidObj(masterPosts[0]);
        } else {
          postUuidObjToPush = makePostsToShowUuidObj(
            masterPosts[masterPostIndex + 1]
          );
        }
        const updatedPostsUuidsToShow = [...postsToShowUuids];
        updatedPostsUuidsToShow.push(postUuidObjToPush);
        updatedPostsUuidsToShow.shift();
        setPostsToShowUuids(updatedPostsUuidsToShow);
        setPostSliderLeft(0);
        setPostSliderLeftTransitionTime(0);
      } else if (leftPercentage >= 0) {
        const firstPostShowingUuidObj = postsToShowUuids[0];
        const masterPostIndex = masterPosts.findIndex(
          (post) => post.postUuid === firstPostShowingUuidObj.postUuid
        );
        if (masterPostIndex === -1) {
          return;
        }
        let postUuidObjToUnshift: PostsToShowUuidsObj;
        if (masterPostIndex === 0) {
          postUuidObjToUnshift = makePostsToShowUuidObj(
            masterPosts[masterPosts.length - 1]
          );
        } else {
          postUuidObjToUnshift = makePostsToShowUuidObj(
            masterPosts[masterPostIndex - 1]
          );
        }
        const updatedPostsUuidsToShow = [...postsToShowUuids];
        updatedPostsUuidsToShow.unshift(postUuidObjToUnshift);
        updatedPostsUuidsToShow.pop();
        setPostsToShowUuids(updatedPostsUuidsToShow);
        setPostSliderLeft(postCardWidthPercentage * -1);
        setPostSliderLeftTransitionTime(0);
      }
    },
    [
      masterPosts,
      postCardWidthPercentage,
      postRowContentDivRef,
      postsToShowUuids,
    ]
  );

  const handleTransitionEnd = useCallback(() => {
    handleShiftUIPostsAndResetLeft(postSliderLeft);
    if (
      autoScrollPostRowDirectionOption ===
      AutoScrollPostRowDirectionOptionEnum.Right
    ) {
      setTimeout(() => {
        setPostSliderLeft(0);
        setPostSliderLeftTransitionTime(
          autoScrollPostRowRateSecondsForSinglePostCard
        );
      }, 0);
    } else if (
      autoScrollPostRowDirectionOption ===
      AutoScrollPostRowDirectionOptionEnum.Left
    ) {
      setTimeout(() => {
        setPostSliderLeft(postCardWidthPercentage * -1);
        setPostSliderLeftTransitionTime(
          autoScrollPostRowRateSecondsForSinglePostCard
        );
      }, 0);
    }
  }, [
    autoScrollPostRowDirectionOption,
    autoScrollPostRowRateSecondsForSinglePostCard,
    handleShiftUIPostsAndResetLeft,
    postCardWidthPercentage,
    postSliderLeft,
  ]);

  const handleMouseEnter = useCallback(() => {
    const postRowContentDiv = postRowContentDivRef.current;
    if (postRowContentDiv === null) {
      return;
    }
    const postRowContentDivBoundingRect =
      postRowContentDiv.getBoundingClientRect();
    const leftPercentage =
      (postRowContentDivBoundingRect.left /
        postRowContentDivBoundingRect.width) *
      100;
    setPostSliderLeft(leftPercentage);
    setPostSliderLeftTransitionTime(0);
  }, [postRowContentDivRef]);

  const handleMouseLeave = useCallback(() => {
    mouseDownOnPostRow.current = false;
    const postRowContentDiv = postRowContentDivRef.current;
    if (postRowContentDiv === null || menuOpenOnPostRowUuid === postRowUuid) {
      return;
    }
    const postCardWidthPx =
      (postCardWidthPercentage / 100) * postRowContentDiv.clientWidth;
    const rect = postRowContentDiv.getBoundingClientRect();
    if (
      autoScrollPostRowDirectionOption ===
      AutoScrollPostRowDirectionOptionEnum.Right
    ) {
      const distanceLeftToTravelPx = Math.abs(rect.left);
      setPostSliderLeft(0);
      setPostSliderLeftTransitionTime(
        (distanceLeftToTravelPx *
          autoScrollPostRowRateSecondsForSinglePostCard) /
          postCardWidthPx
      );
    } else if (
      autoScrollPostRowDirectionOption ===
      AutoScrollPostRowDirectionOptionEnum.Left
    ) {
      const distanceLeftToTravelPx = postCardWidthPx - Math.abs(rect.left);
      setPostSliderLeft(postCardWidthPercentage * -1);
      setPostSliderLeftTransitionTime(
        (distanceLeftToTravelPx *
          autoScrollPostRowRateSecondsForSinglePostCard) /
          postCardWidthPx
      );
    }
  }, [
    autoScrollPostRowDirectionOption,
    autoScrollPostRowRateSecondsForSinglePostCard,
    menuOpenOnPostRowUuid,
    postCardWidthPercentage,
    postRowContentDivRef,
    postRowUuid,
  ]);

  const handleMouseDownOrTouchStart = useCallback(
    (event: MouseEvent | TouchEvent) => {
      mouseDownOnPostRow.current = true;
      if (event instanceof MouseEvent) {
        lastMouseDownX.current = event.x;
      } else if (event instanceof TouchEvent) {
        const touches = event.touches;
        if (touches.length == 1) {
          lastMouseDownX.current = touches[0].clientX;
        } else if (touches.length == 2) {
          const touch1 = touches[0];
          const touch2 = touches[1];
          lastMouseDownX.current = (touch1.clientX + touch2.clientX) / 2;
        }
      }
    },
    []
  );
  const handleMouseUpTouchEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (event instanceof MouseEvent) {
        mouseDownOnPostRow.current = false;
        lastMouseDownX.current = 0;
      } else if (event instanceof TouchEvent) {
        const touches = event.touches;
        if (touches.length === 0) {
          mouseDownOnPostRow.current = false;
          lastMouseDownX.current = 0;
        } else if (touches.length === 1) {
          mouseDownOnPostRow.current = true;
          lastMouseDownX.current = touches[0].clientX;
        } else if (touches.length == 2) {
          mouseDownOnPostRow.current = true;
          const touch1 = touches[0];
          const touch2 = touches[1];
          lastMouseDownX.current = (touch1.clientX + touch2.clientX) / 2;
        }
      }
    },
    []
  );

  const handleMouseOrTouchMove = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const postRowContentDiv = postRowContentDivRef.current;
      if (postRowContentDiv === null || !mouseDownOnPostRow.current) {
        return;
      }

      let eventX: number;
      if (event instanceof MouseEvent) {
        eventX = event.clientX;
      } else if (event instanceof TouchEvent) {
        const touches = event.touches;
        if (touches.length === 1) {
          eventX = touches[0].clientX;
        } else if (touches.length === 2) {
          const touch1 = touches[0];
          const touch2 = touches[1];
          eventX = (touch1.clientX + touch2.clientX) / 2;
        } else {
          return;
        }
      } else {
        return;
      }

      const deltaX = eventX - lastMouseDownX.current;
      const deltaXPercentage =
        (Math.abs(deltaX) / postRowContentDiv.clientWidth) * 100;
      let leftToSet: number | undefined = undefined;
      if (deltaX < 0) {
        leftToSet = postSliderLeft - deltaXPercentage;
      } else if (deltaX > 0) {
        leftToSet = postSliderLeft + deltaXPercentage;
      }

      if (leftToSet !== undefined) {
        if (leftToSet <= postCardWidthPercentage * -1 || leftToSet >= 0) {
          handleShiftUIPostsAndResetLeft(leftToSet);
        } else {
          setPostSliderLeft(leftToSet);
          setPostSliderLeftTransitionTime(0);
        }
      }
      lastMouseDownX.current = eventX;
    },
    [
      handleShiftUIPostsAndResetLeft,
      postCardWidthPercentage,
      postRowContentDivRef,
      postSliderLeft,
    ]
  );

  useEffect(() => {
    const postRowContentDiv = postRowContentDivRef.current;
    if (postRowContentDiv === null) {
      return;
    }
    postRowContentDiv.addEventListener("transitionend", handleTransitionEnd);
    postRowContentDiv.addEventListener("mouseenter", handleMouseEnter);
    postRowContentDiv.addEventListener("mouseover", handleMouseEnter);
    postRowContentDiv.addEventListener("mouseleave", handleMouseLeave);
    postRowContentDiv.addEventListener(
      "mousedown",
      handleMouseDownOrTouchStart
    );
    postRowContentDiv.addEventListener("mouseup", handleMouseUpTouchEnd);
    postRowContentDiv.addEventListener("mousemove", handleMouseOrTouchMove);

    postRowContentDiv.addEventListener(
      "touchstart",
      handleMouseDownOrTouchStart
    );
    postRowContentDiv.addEventListener("touchend", handleMouseUpTouchEnd);
    postRowContentDiv.addEventListener("touchmove", handleMouseOrTouchMove);

    return () => {
      postRowContentDiv.removeEventListener(
        "transitionend",
        handleTransitionEnd
      );
      postRowContentDiv.removeEventListener("mouseenter", handleMouseEnter);
      postRowContentDiv.removeEventListener("mouseover", handleMouseEnter);
      postRowContentDiv.removeEventListener("mouseleave", handleMouseLeave);
      postRowContentDiv.removeEventListener(
        "mousedown",
        handleMouseDownOrTouchStart
      );
      postRowContentDiv.removeEventListener("mouseup", handleMouseUpTouchEnd);
      postRowContentDiv.removeEventListener(
        "mousemove",
        handleMouseOrTouchMove
      );

      postRowContentDiv.removeEventListener(
        "touchstart",
        handleMouseDownOrTouchStart
      );
      postRowContentDiv.removeEventListener("touchend", handleMouseUpTouchEnd);
      postRowContentDiv.removeEventListener(
        "touchmove",
        handleMouseOrTouchMove
      );
    };
  }, [
    handleMouseDownOrTouchStart,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseOrTouchMove,
    handleMouseUpTouchEnd,
    handleTransitionEnd,
    postRowContentDivRef,
  ]);

  useEffect(() => {
    if (
      menuOpenOnPostRowUuid === undefined &&
      contextMenuOpenOnPostRowRef.current
    ) {
      handleMouseLeave();
    }
    contextMenuOpenOnPostRowRef.current = menuOpenOnPostRowUuid === postRowUuid;
  }, [handleMouseLeave, menuOpenOnPostRowUuid, postRowUuid]);

  return {
    postsToShowUuids,
    postSliderLeft,
    postSliderLeftTransitionTime,
  };
}
