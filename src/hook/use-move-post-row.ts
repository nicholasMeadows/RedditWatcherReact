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
import { PostRowsDispatchContext } from "../context/post-rows-context.ts";
import { v4 as uuidV4 } from "uuid";
import { PostRowsActionType } from "../reducer/post-rows-reducer.ts";
import { AppConfigStateContext } from "../context/app-config-context.ts";
import { ContextMenuStateContext } from "../context/context-menu-context.ts";
import { AutoScrollPostRowDirectionOptionEnum } from "../model/config/enums/AutoScrollPostRowDirectionOptionEnum.ts";
import SubredditSourceOptionsEnum from "../model/config/enums/SubredditSourceOptionsEnum.ts";

export default function useMovePostRow(
  postRowUuid: string,
  masterPosts: Array<Post>,
  postRowContentDivRef: RefObject<HTMLDivElement>,
  postCardWidthPercentage: number,
  postsToShowInRow: number,
  postSliderLeft: number,
  postsToShowUuids: Array<PostsToShowUuidsObj>,
  gottenWithSubredditSourceOption: SubredditSourceOptionsEnum
) {
  const postRowsDispatch = useContext(PostRowsDispatchContext);
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

  useLayoutEffect(() => {
    const postRowContentDiv = postRowContentDivRef.current;
    if (postRowContentDiv === null || !postRowInitialized.current) {
      return;
    }
    return () => {
      const rect = postRowContentDiv.getBoundingClientRect();
      postRowsDispatch({
        type: PostRowsActionType.SET_POSTS_TO_SHOW_AND_POST_SLIDER_LEFT_AND_TRANSITION_TIME,
        payload: {
          postRowUuid: postRowUuid,
          postsToShowUuids: postsToShowUuids,
          postLeft: (rect.left / rect.width) * 100,
          transitionTime: 0,
        },
      });
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const makePostsToShowUuidObj = (post: Post): PostsToShowUuidsObj => {
    return {
      uiUuid: `${uuidV4()}:${post.postUuid}`,
      postUuid: post.postUuid,
    };
  };

  const handleTransitionEnd = useCallback(() => {
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
      postRowsDispatch({
        type: PostRowsActionType.SET_POSTS_TO_SHOW_AND_POST_SLIDER_LEFT_AND_TRANSITION_TIME,
        payload: {
          postRowUuid: postRowUuid,
          transitionTime: 0,
          postLeft: 0,
          postsToShowUuids: updatedPostsToShowUuid,
        },
      });
      setTimeout(() => {
        postRowsDispatch({
          type: PostRowsActionType.SET_POSTS_TO_SHOW_AND_POST_SLIDER_LEFT_AND_TRANSITION_TIME,
          payload: {
            postRowUuid: postRowUuid,
            transitionTime: autoScrollPostRowRateSecondsForSinglePostCard,
            postLeft: postCardWidthPercentage * -1,
            postsToShowUuids: updatedPostsToShowUuid,
          },
        });
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
      postRowsDispatch({
        type: PostRowsActionType.SET_POSTS_TO_SHOW_AND_POST_SLIDER_LEFT_AND_TRANSITION_TIME,
        payload: {
          postRowUuid: postRowUuid,
          transitionTime: 0,
          postLeft: postCardWidthPercentage * -1,
          postsToShowUuids: updatedPostsToShowUuid,
        },
      });
      setTimeout(() => {
        postRowsDispatch({
          type: PostRowsActionType.SET_POSTS_TO_SHOW_AND_POST_SLIDER_LEFT_AND_TRANSITION_TIME,
          payload: {
            postRowUuid: postRowUuid,
            transitionTime: autoScrollPostRowRateSecondsForSinglePostCard,
            postLeft: 0,
            postsToShowUuids: updatedPostsToShowUuid,
          },
        });
      }, 0);
    }
  }, [
    autoScrollPostRowDirectionOption,
    autoScrollPostRowRateSecondsForSinglePostCard,
    masterPosts,
    postCardWidthPercentage,
    postRowUuid,
    postRowsDispatch,
    postsToShowInRow,
    postsToShowUuids,
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
    postRowsDispatch({
      type: PostRowsActionType.SET_POSTS_TO_SHOW_AND_POST_SLIDER_LEFT_AND_TRANSITION_TIME,
      payload: {
        postRowUuid: postRowUuid,
        postLeft: leftPercentage,
        transitionTime: 0,
        postsToShowUuids: postsToShowUuids,
      },
    });
  }, [postRowContentDivRef, postRowUuid, postRowsDispatch, postsToShowUuids]);

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
      (postCardWidthPercentage / 100) * postRowContentDiv.clientWidth;
    const rect = postRowContentDiv.getBoundingClientRect();
    if (
      autoScrollPostRowDirectionOption ===
      AutoScrollPostRowDirectionOptionEnum.Right
    ) {
      const distanceLeftToTravelPx = Math.abs(rect.left);
      postRowsDispatch({
        type: PostRowsActionType.SET_POSTS_TO_SHOW_AND_POST_SLIDER_LEFT_AND_TRANSITION_TIME,
        payload: {
          postRowUuid: postRowUuid,
          postLeft: 0,
          transitionTime:
            (distanceLeftToTravelPx *
              autoScrollPostRowRateSecondsForSinglePostCard) /
            postCardWidthPx,
          postsToShowUuids: postsToShowUuids,
        },
      });
    } else if (
      autoScrollPostRowDirectionOption ===
      AutoScrollPostRowDirectionOptionEnum.Left
    ) {
      const distanceLeftToTravelPx = postCardWidthPx - Math.abs(rect.left);
      postRowsDispatch({
        type: PostRowsActionType.SET_POSTS_TO_SHOW_AND_POST_SLIDER_LEFT_AND_TRANSITION_TIME,
        payload: {
          postRowUuid: postRowUuid,
          postLeft: postCardWidthPercentage * -1,
          transitionTime:
            (distanceLeftToTravelPx *
              autoScrollPostRowRateSecondsForSinglePostCard) /
            postCardWidthPx,
          postsToShowUuids: postsToShowUuids,
        },
      });
    }
  }, [
    autoScrollPostRowDirectionOption,
    autoScrollPostRowRateSecondsForSinglePostCard,
    menuOpenOnPostRowUuid,
    postCardWidthPercentage,
    postRowContentDivRef,
    postRowUuid,
    postRowsDispatch,
    postsToShowUuids,
    shouldAutoScroll,
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
        postRowsDispatch({
          type: PostRowsActionType.SET_POSTS_TO_SHOW_AND_POST_SLIDER_LEFT_AND_TRANSITION_TIME,
          payload: {
            postRowUuid: postRowUuid,
            postsToShowUuids: updatedPostsToShowUuids,
            postLeft: postCardWidthPercentage * -1,
            transitionTime: 0,
          },
        });
      } else if (leftToSet <= postCardWidthPercentage * -1) {
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
        postRowsDispatch({
          type: PostRowsActionType.SET_POSTS_TO_SHOW_AND_POST_SLIDER_LEFT_AND_TRANSITION_TIME,
          payload: {
            postRowUuid: postRowUuid,
            postsToShowUuids: updatedPostsToShowUuids,
            postLeft: 0,
            transitionTime: 0,
          },
        });
      } else {
        postRowsDispatch({
          type: PostRowsActionType.SET_POSTS_TO_SHOW_AND_POST_SLIDER_LEFT_AND_TRANSITION_TIME,
          payload: {
            postRowUuid: postRowUuid,
            postsToShowUuids: postsToShowUuids,
            postLeft: leftToSet,
            transitionTime: 0,
          },
        });
      }
      lastMouseDownX.current = eventX;
    },
    [
      masterPosts,
      postCardWidthPercentage,
      postRowContentDivRef,
      postRowUuid,
      postRowsDispatch,
      postSliderLeft,
      postsToShowUuids,
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
    if (postRowInitialized.current || postCardWidthPercentage == 0) {
      return;
    }
    if (masterPosts.length <= postsToShowInRow) {
      postRowsDispatch({
        type: PostRowsActionType.SET_POSTS_TO_SHOW_AND_POST_SLIDER_LEFT_AND_TRANSITION_TIME,
        payload: {
          postRowUuid: postRowUuid,
          postsToShowUuids: masterPosts.map((post) =>
            makePostsToShowUuidObj(post)
          ),
          postLeft: 0,
          transitionTime: 0,
        },
      });
    } else if (postsToShowUuids.length !== 0) {
      handleMouseLeave();
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
        leftToGoToAfterInit = postCardWidthPercentage * -1;
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
        initialPostLeft = postCardWidthPercentage * -1;
        leftToGoToAfterInit = 0;
      }

      if (
        postUuidsToSet !== undefined &&
        initialPostLeft !== undefined &&
        leftToGoToAfterInit !== undefined
      ) {
        postRowsDispatch({
          type: PostRowsActionType.SET_POSTS_TO_SHOW_AND_POST_SLIDER_LEFT_AND_TRANSITION_TIME,
          payload: {
            postRowUuid: postRowUuid,
            postsToShowUuids: postUuidsToSet,
            postLeft: initialPostLeft,
            transitionTime: 0,
          },
        });
      }

      if (shouldAutoScroll) {
        setTimeout(() => {
          if (
            postUuidsToSet !== undefined &&
            initialPostLeft !== undefined &&
            leftToGoToAfterInit !== undefined
          ) {
            postRowsDispatch({
              type: PostRowsActionType.SET_POSTS_TO_SHOW_AND_POST_SLIDER_LEFT_AND_TRANSITION_TIME,
              payload: {
                postRowUuid: postRowUuid,
                postsToShowUuids: postUuidsToSet,
                postLeft: leftToGoToAfterInit,
                transitionTime: autoScrollPostRowRateSecondsForSinglePostCard,
              },
            });
          }
        }, 0);
      }
    }

    postRowInitialized.current = true;
  }, [
    autoScrollPostRowDirectionOption,
    autoScrollPostRowRateSecondsForSinglePostCard,
    handleMouseLeave,
    masterPosts,
    postCardWidthPercentage,
    postRowUuid,
    postRowsDispatch,
    postsToShowInRow,
    postsToShowUuids,
    shouldAutoScroll,
  ]);
}
