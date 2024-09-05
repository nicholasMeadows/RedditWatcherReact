import {
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { Post } from "../model/Post/Post.ts";
import { PostsToShowUuidsObj } from "../model/PostRow.ts";
import { v4 as uuidV4 } from "uuid";
import { AppConfigStateContext } from "../context/app-config-context.ts";
import { ContextMenuStateContext } from "../context/context-menu-context.ts";
import { AutoScrollPostRowDirectionOptionEnum } from "../model/config/enums/AutoScrollPostRowDirectionOptionEnum.ts";
import SubredditSourceOptionsEnum from "../model/config/enums/SubredditSourceOptionsEnum.ts";
import { PostRowPageDispatchContext } from "../context/post-row-page-context.ts";
import { PostRowPageActionType } from "../reducer/post-row-page-reducer.ts";

export default function useMovePostRow(
  postRowUuid: string,
  masterPosts: Array<Post>,
  postRowContentDivRef: RefObject<HTMLDivElement>,
  postSliderLeft: number,
  postsToShowUuids: Array<PostsToShowUuidsObj>,
  gottenWithSubredditSourceOption: SubredditSourceOptionsEnum
) {
  const { postsToShowInRow } = useContext(AppConfigStateContext);
  const postRowPageDispatch = useContext(PostRowPageDispatchContext);
  const {
    autoScrollPostRowRateSecondsForSinglePostCard,
    autoScrollPostRowDirectionOption,
    autoScrollPostRow,
  } = useContext(AppConfigStateContext);
  const { menuOpenOnPostRowUuid } = useContext(ContextMenuStateContext);

  const contextMenuOpenOnPostRowRef = useRef(false);
  const mouseDownOnPostRow = useRef(false);
  const lastMouseDownX = useRef(0);
  const postRowInitialized = useRef(false);

  const shouldAutoScroll =
    gottenWithSubredditSourceOption !== SubredditSourceOptionsEnum.FrontPage &&
    autoScrollPostRow;

  const calcPostCardWidthPercentage = useCallback(() => {
    const postRowContentDiv = postRowContentDivRef.current;
    if (postRowContentDiv === null) {
      return 0;
    }
    const rect = postRowContentDiv.getBoundingClientRect();
    const widthPx = rect.width / postsToShowInRow;
    return (widthPx / rect.width) * 100;
  }, [postRowContentDivRef, postsToShowInRow]);

  const updatePostRowLayoutParams = useCallback(
    (
      postsToShowUuids: Array<PostsToShowUuidsObj> | undefined,
      postSliderLeft: number | undefined,
      postSliderTransitionTime: number | undefined
    ) => {
      if (postsToShowUuids !== undefined) {
        postRowPageDispatch({
          type: PostRowPageActionType.SET_POSTS_TO_SHOW_UUIDS,
          payload: {
            postRowUuid,
            postsToShowUuids: postsToShowUuids,
          },
        });
      }

      if (postSliderLeft !== undefined) {
        postRowPageDispatch({
          type: PostRowPageActionType.SET_POST_SLIDER_LEFT,
          payload: {
            postRowUuid,
            value: postSliderLeft,
          },
        });
      }
      if (postSliderTransitionTime !== undefined) {
        postRowPageDispatch({
          type: PostRowPageActionType.SET_POST_SLIDER_TRANSITION_TIME,
          payload: {
            postRowUuid,
            value: postSliderTransitionTime,
          },
        });
      }
    },
    [postRowUuid, postRowPageDispatch]
  );
  useLayoutEffect(() => {
    const postRowContentDiv = postRowContentDivRef.current;
    // || !postRowInitialized.current
    if (postRowContentDiv === null) {
      return;
    }
    return () => {
      const rect = postRowContentDiv.getBoundingClientRect();
      updatePostRowLayoutParams(undefined, (rect.left / rect.width) * 100, 0);
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postsToShowUuids]);

  const makePostsToShowUuidObj = (post: Post): PostsToShowUuidsObj => {
    return {
      uiUuid: `${uuidV4()}:${post.postUuid}`,
      postUuid: post.postUuid,
    };
  };

  const handleTransitionEnd = useCallback(
    (event: TransitionEvent) => {
      const postRowContentDiv = postRowContentDivRef.current;
      if (
        postRowContentDiv === undefined ||
        event.target !== postRowContentDiv
      ) {
        return;
      }
      if (
        autoScrollPostRowDirectionOption ===
        AutoScrollPostRowDirectionOptionEnum.Left
      ) {
        const lastPostUuidObj = postsToShowUuids[postsToShowUuids.length - 1];
        const masterPostIndex = masterPosts.findIndex(
          (post) => post.postUuid === lastPostUuidObj.postUuid
        );
        if (masterPostIndex === -1) {
          return;
        }
        const updatedPostsToShowUuid = [...postsToShowUuids];

        if (masterPostIndex === postsToShowInRow) {
          updatedPostsToShowUuid.push(makePostsToShowUuidObj(masterPosts[0]));
        } else {
          updatedPostsToShowUuid.push(
            makePostsToShowUuidObj(masterPosts[masterPostIndex + 1])
          );
        }
        updatedPostsToShowUuid.shift();
        updatePostRowLayoutParams(updatedPostsToShowUuid, 0, 0);
        setTimeout(() => {
          updatePostRowLayoutParams(
            updatedPostsToShowUuid,
            calcPostCardWidthPercentage() * -1,
            autoScrollPostRowRateSecondsForSinglePostCard
          );
        }, 0);
      } else if (
        autoScrollPostRowDirectionOption ===
        AutoScrollPostRowDirectionOptionEnum.Right
      ) {
        const firstPostUuidObj = postsToShowUuids[0];
        const masterPostIndex = masterPosts.findIndex(
          (post) => post.postUuid === firstPostUuidObj.postUuid
        );
        if (masterPostIndex === -1) {
          return;
        }
        const updatedPostsToShowUuid = [...postsToShowUuids];

        if (masterPostIndex === 0) {
          updatedPostsToShowUuid.unshift(
            makePostsToShowUuidObj(masterPosts[masterPosts.length - 1])
          );
        } else {
          updatedPostsToShowUuid.unshift(
            makePostsToShowUuidObj(masterPosts[masterPostIndex - 1])
          );
        }
        updatedPostsToShowUuid.pop();
        updatePostRowLayoutParams(
          updatedPostsToShowUuid,
          calcPostCardWidthPercentage() * -1,
          0
        );
        setTimeout(() => {
          updatePostRowLayoutParams(
            undefined,
            0,
            autoScrollPostRowRateSecondsForSinglePostCard
          );
        }, 0);
      }
    },
    [
      autoScrollPostRowDirectionOption,
      autoScrollPostRowRateSecondsForSinglePostCard,
      calcPostCardWidthPercentage,
      masterPosts,
      postRowContentDivRef,
      postsToShowInRow,
      postsToShowUuids,
      updatePostRowLayoutParams,
    ]
  );

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
    updatePostRowLayoutParams(undefined, leftPercentage, 0);
  }, [postRowContentDivRef, updatePostRowLayoutParams]);

  const handleMouseLeave = useCallback(() => {
    mouseDownOnPostRow.current = false;
    const postRowContentDiv = postRowContentDivRef.current;
    if (
      postRowContentDiv === null ||
      menuOpenOnPostRowUuid === postRowUuid ||
      !shouldAutoScroll ||
      postsToShowUuids.length <= postsToShowInRow
    ) {
      return;
    }
    const postCardWidthPx =
      (calcPostCardWidthPercentage() / 100) * postRowContentDiv.clientWidth;
    const rect = postRowContentDiv.getBoundingClientRect();
    if (
      autoScrollPostRowDirectionOption ===
      AutoScrollPostRowDirectionOptionEnum.Right
    ) {
      const distanceLeftToTravelPx = Math.abs(rect.left);
      const transitionTimeToSet =
        (distanceLeftToTravelPx *
          autoScrollPostRowRateSecondsForSinglePostCard) /
        postCardWidthPx;
      updatePostRowLayoutParams(undefined, 0, transitionTimeToSet);
    } else if (
      autoScrollPostRowDirectionOption ===
      AutoScrollPostRowDirectionOptionEnum.Left
    ) {
      const distanceLeftToTravelPx = postCardWidthPx - Math.abs(rect.left);
      const transitionTime =
        (distanceLeftToTravelPx *
          autoScrollPostRowRateSecondsForSinglePostCard) /
        postCardWidthPx;
      updatePostRowLayoutParams(
        undefined,
        calcPostCardWidthPercentage() * -1,
        transitionTime
      );
    }
  }, [
    autoScrollPostRowDirectionOption,
    autoScrollPostRowRateSecondsForSinglePostCard,
    calcPostCardWidthPercentage,
    menuOpenOnPostRowUuid,
    postRowContentDivRef,
    postRowUuid,
    postsToShowInRow,
    postsToShowUuids.length,
    shouldAutoScroll,
    updatePostRowLayoutParams,
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
      if (
        postRowContentDiv === null ||
        !mouseDownOnPostRow.current ||
        postsToShowUuids.length <= postsToShowInRow
      ) {
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

      if (leftToSet === undefined) {
        return;
      }
      if (leftToSet >= 0) {
        const firstPostUuidObj = postsToShowUuids[0];
        const masterPostIndex = masterPosts.findIndex(
          (post) => post.postUuid === firstPostUuidObj.postUuid
        );
        if (masterPostIndex === -1) {
          return;
        }
        const updatedPostsToShowUuids = [...postsToShowUuids];

        if (masterPostIndex === 0) {
          updatedPostsToShowUuids.unshift(
            makePostsToShowUuidObj(masterPosts[masterPosts.length - 1])
          );
        } else {
          updatedPostsToShowUuids.unshift(
            makePostsToShowUuidObj(masterPosts[masterPostIndex - 1])
          );
        }
        updatedPostsToShowUuids.pop();
        updatePostRowLayoutParams(
          updatedPostsToShowUuids,
          calcPostCardWidthPercentage() * -1,
          0
        );
      } else if (leftToSet <= calcPostCardWidthPercentage() * -1) {
        const lastPostUuidObj = postsToShowUuids[postsToShowUuids.length - 1];
        const masterPostIndex = masterPosts.findIndex(
          (post) => post.postUuid === lastPostUuidObj.postUuid
        );
        if (masterPostIndex === -1) {
          return;
        }
        const updatedPostsToShowUuids = [...postsToShowUuids];

        if (masterPostIndex === masterPosts.length - 1) {
          updatedPostsToShowUuids.push(makePostsToShowUuidObj(masterPosts[0]));
        } else {
          updatedPostsToShowUuids.push(
            makePostsToShowUuidObj(masterPosts[masterPostIndex + 1])
          );
        }
        updatedPostsToShowUuids.shift();
        updatePostRowLayoutParams(updatedPostsToShowUuids, 0, 0);
      } else {
        updatePostRowLayoutParams(undefined, leftToSet, 0);
      }
      lastMouseDownX.current = eventX;
    },
    [
      calcPostCardWidthPercentage,
      masterPosts,
      postRowContentDivRef,
      postSliderLeft,
      postsToShowInRow,
      postsToShowUuids,
      updatePostRowLayoutParams,
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

  useLayoutEffect(() => {
    const postRowContentDiv = postRowContentDivRef.current;
    if (postRowInitialized.current || postRowContentDiv === null) {
      return;
    }
    if (masterPosts.length <= postsToShowInRow) {
      const postToShowUuidsToSet = masterPosts.map((post) =>
        makePostsToShowUuidObj(post)
      );
      updatePostRowLayoutParams(postToShowUuidsToSet, 0, 0);
    } else if (postsToShowUuids.length !== 0) {
      const rec = postRowContentDiv.getBoundingClientRect();
      const currentLeftPercentage =
        (rec.left / postRowContentDiv.clientWidth) * 100;

      const transitionTime = Math.abs(
        (currentLeftPercentage *
          autoScrollPostRowRateSecondsForSinglePostCard) /
          calcPostCardWidthPercentage()
      );
      let leftToSet: number | undefined;
      if (
        autoScrollPostRowDirectionOption ===
        AutoScrollPostRowDirectionOptionEnum.Right
      ) {
        leftToSet = 0;
      } else if (
        autoScrollPostRowDirectionOption ===
        AutoScrollPostRowDirectionOptionEnum.Left
      ) {
        leftToSet = calcPostCardWidthPercentage() * -1;
      }
      setTimeout(() => {
        updatePostRowLayoutParams(undefined, leftToSet, transitionTime);
      }, 10);
    } else {
      let postUuidsToSet: Array<PostsToShowUuidsObj> | undefined;
      let initialPostLeft: number | undefined;
      let leftToGoToAfterInit: number | undefined;

      if (
        autoScrollPostRowDirectionOption ===
        AutoScrollPostRowDirectionOptionEnum.Left
      ) {
        postUuidsToSet = masterPosts
          .slice(0, postsToShowInRow + 1)
          .map<PostsToShowUuidsObj>((post) => makePostsToShowUuidObj(post));
        initialPostLeft = 0;
        leftToGoToAfterInit = calcPostCardWidthPercentage() * -1;
      } else if (
        autoScrollPostRowDirectionOption ===
        AutoScrollPostRowDirectionOptionEnum.Right
      ) {
        const firstPostUuidObj = makePostsToShowUuidObj(
          masterPosts[masterPosts.length - 1]
        );
        postUuidsToSet = masterPosts
          .slice(0, postsToShowInRow)
          .map<PostsToShowUuidsObj>((post) => makePostsToShowUuidObj(post));
        postUuidsToSet.unshift(firstPostUuidObj);
        initialPostLeft = calcPostCardWidthPercentage() * -1;
        leftToGoToAfterInit = 0;
      }

      if (
        postUuidsToSet !== undefined &&
        initialPostLeft !== undefined &&
        leftToGoToAfterInit !== undefined
      ) {
        updatePostRowLayoutParams(postUuidsToSet, initialPostLeft, 0);
      }

      if (shouldAutoScroll) {
        setTimeout(() => {
          if (
            postUuidsToSet !== undefined &&
            initialPostLeft !== undefined &&
            leftToGoToAfterInit !== undefined
          ) {
            updatePostRowLayoutParams(
              undefined,
              leftToGoToAfterInit,
              autoScrollPostRowRateSecondsForSinglePostCard
            );
          }
        }, 0);
      }
    }

    postRowInitialized.current = true;
  }, [
    autoScrollPostRowDirectionOption,
    autoScrollPostRowRateSecondsForSinglePostCard,
    masterPosts,
    postRowContentDivRef,
    postRowUuid,
    postRowPageDispatch,
    postsToShowInRow,
    postsToShowUuids,
    postsToShowUuids.length,
    shouldAutoScroll,
    updatePostRowLayoutParams,
    calcPostCardWidthPercentage,
  ]);
}
