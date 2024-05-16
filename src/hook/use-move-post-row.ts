import { MutableRefObject, useCallback, useEffect, useRef } from "react";
import {
  mouseEnterPostRow,
  mouseLeavePostRow,
  setUiPosts,
} from "../redux/slice/PostRowsSlice.ts";
import store, { useAppDispatch, useAppSelector } from "../redux/store.ts";
import { PostRow } from "../model/PostRow.ts";
import { v4 as uuidV4 } from "uuid";
import { Post } from "../model/Post/Post.ts";
import UserFrontPagePostSortOrderOptionsEnum from "../model/config/enums/UserFrontPagePostSortOrderOptionsEnum.ts";
import { AutoScrollPostRowOptionEnum } from "../model/config/enums/AutoScrollPostRowOptionEnum.ts";
import { AutoScrollPostRowDirectionOptionEnum } from "../model/config/enums/AutoScrollPostRowDirectionOptionEnum.ts";

export default function useMovePostRow(
  postRowDivRef: MutableRefObject<HTMLDivElement | null>,
  postRowContentDivRef: MutableRefObject<HTMLDivElement | null>,
  postRow: PostRow,
  postsToShowInRow: number
) {
  const dispatch = useAppDispatch();
  const autoScrollPostRowRateSecondsForSinglePostCard = useAppSelector(
    (state) => state.appConfig.autoScrollPostRowRateSecondsForSinglePostCard
  );
  const totalMovementX = useRef(0);
  const mouseOrTouchOnPostCard = useRef(false);
  const lastMovementX = useRef(0);
  const mouseWheelPostScrollModifierPressed = useRef(false);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | undefined>();

  const postCardWidthPercentage = useAppSelector(
    (state) => state.postRows.postCardWidthPercentage
  );
  const postRowContentWidthPx = useAppSelector(
    (state) => state.postRows.postRowContentWidthPx
  );

  const autoScrollPostRowDirectionOption = useAppSelector(
    (state) => state.appConfig.autoScrollPostRowDirectionOption
  );
  const autoScrollPostRowOption = useAppSelector(
    (state) => state.appConfig.autoScrollPostRowOption
  );

  const handleMoveUiPosts = useCallback(
    (postRow: PostRow, movementPx: number) => {
      let updatedUiPosts = postRow.uiPosts.filter((post) => {
        if (
          post.leftPercentage + postCardWidthPercentage >
            -postCardWidthPercentage &&
          post.leftPercentage < 100 + postCardWidthPercentage
        ) {
          return post;
        }
      });

      const movementPercentage = (movementPx / postRowContentWidthPx) * 100;
      updatedUiPosts = updatedUiPosts.map((uiPost) => ({
        ...uiPost,
        leftPercentage: uiPost.leftPercentage + movementPercentage,
      }));

      if (movementPx < 0) {
        const lastUiPost = updatedUiPosts[updatedUiPosts.length - 1];
        if (lastUiPost.leftPercentage < 100) {
          const lastUiPostIndex = postRow.posts.findIndex(
            (post) => post.postUuid == lastUiPost.postUuid
          );
          if (lastUiPostIndex == -1) {
            return;
          }
          let indexToPush: number;
          if (lastUiPostIndex == postRow.posts.length - 1) {
            indexToPush = 0;
          } else {
            indexToPush = lastUiPostIndex + 1;
          }
          const postToPush = postRow.posts[indexToPush];
          updatedUiPosts.push({
            ...postToPush,
            uiUuid: postToPush.postUuid + " " + uuidV4(),
            leftPercentage: lastUiPost.leftPercentage + postCardWidthPercentage,
          });
        }
      } else if (movementPx > 0) {
        const firstUiPost = updatedUiPosts[0];
        if (firstUiPost.leftPercentage + postCardWidthPercentage >= 0) {
          const firstUiPostIndex = postRow.posts.findIndex(
            (post) => post.postUuid == firstUiPost.postUuid
          );
          if (firstUiPostIndex == -1) {
            return;
          }
          let postToUnShift: Post;
          if (firstUiPostIndex == 0) {
            postToUnShift = postRow.posts[postRow.posts.length - 1];
          } else {
            postToUnShift = postRow.posts[firstUiPostIndex - 1];
          }

          updatedUiPosts.unshift({
            ...postToUnShift,
            uiUuid: postToUnShift.postUuid + " " + uuidV4(),
            leftPercentage:
              firstUiPost.leftPercentage - postCardWidthPercentage,
          });
        }
      }

      dispatch(
        setUiPosts({
          uiPosts: updatedUiPosts,
          postRowUuid: postRow.postRowUuid,
        })
      );
    },
    [dispatch, postCardWidthPercentage, postRowContentWidthPx]
  );

  const handleStopPostTransitions = useCallback(() => {
    const postRowContentDiv =
      postRowContentDivRef.current as unknown as HTMLDivElement;
    const postRowContentDivBoundingRect =
      postRowContentDiv.getBoundingClientRect();
    const firstVisibleUiPostIndex = postRow.uiPosts.findIndex(
      (uiPost) => uiPost.leftPercentage >= 0
    );
    const firstVisibleUiPost = postRow.uiPosts[firstVisibleUiPostIndex];
    const firstVisibleUiPostTargetPx =
      firstVisibleUiPost.leftPercentage *
      0.01 *
      postRowContentDivBoundingRect.width;

    const firstVisibleUiPostDiv = postRowContentDiv.children.item(
      firstVisibleUiPostIndex
    );
    if (firstVisibleUiPostDiv == undefined) {
      return;
    }
    const currentFirstVisibleUiPostLeftPx =
      firstVisibleUiPostDiv.getBoundingClientRect().left -
      postRowContentDivBoundingRect.left;
    handleMoveUiPosts(
      postRow,
      currentFirstVisibleUiPostLeftPx - firstVisibleUiPostTargetPx
    );
  }, [handleMoveUiPosts, postRow, postRowContentDivRef]);

  const postRowScrollLeftPressed = useCallback(
    (postRowUuid: string, snapToPostCard?: boolean | undefined) => {
      const postRowsState = store.getState().postRows;
      const postRows = postRowsState.postRows;
      const postRow = postRows.find((row) => row.postRowUuid == postRowUuid);
      if (postRow == undefined) {
        return;
      }

      const lastVisibleUiPost = postRow.uiPosts.find(
        (uiPost) =>
          uiPost.leftPercentage + postRowsState.postCardWidthPercentage >= 100
      );
      if (lastVisibleUiPost == undefined) {
        return;
      }
      const lastVisibleUiPostRight =
        lastVisibleUiPost.leftPercentage +
        postRowsState.postCardWidthPercentage;

      if (snapToPostCard == undefined) {
        snapToPostCard = true;
      }

      let movementPercentage: number =
        postRowsState.postCardWidthPercentage * -1;
      if (snapToPostCard && lastVisibleUiPostRight != 100) {
        movementPercentage =
          100 -
          postRowsState.postCardWidthPercentage -
          lastVisibleUiPost.leftPercentage;
      }

      handleMoveUiPosts(
        postRow,
        movementPercentage * 0.01 * postRowsState.postRowContentWidthPx
      );
    },
    [handleMoveUiPosts]
  );

  const postRowScrollRightPressed = useCallback(
    (postRowUuid: string, snapToPostCard?: boolean | undefined) => {
      const postRowState = store.getState().postRows;
      const postRows = postRowState.postRows;
      const postRow = postRows.find((row) => row.postRowUuid == postRowUuid);
      if (postRow == undefined) {
        return;
      }
      const firstVisibleUiPost = postRow.uiPosts.find(
        (uiPost) =>
          uiPost.leftPercentage + postRowState.postCardWidthPercentage > 0
      );
      if (firstVisibleUiPost == undefined) {
        return;
      }

      if (snapToPostCard == undefined) {
        snapToPostCard = true;
      }

      let movementPercentage = postRowState.postCardWidthPercentage;
      if (snapToPostCard && firstVisibleUiPost.leftPercentage < 0) {
        movementPercentage = firstVisibleUiPost.leftPercentage;
      }
      handleMoveUiPosts(
        postRow,
        Math.abs(movementPercentage * 0.01 * postRowState.postRowContentWidthPx)
      );
    },
    [handleMoveUiPosts]
  );

  const createAutoScrollInterval = useCallback(
    async (snapToPost = true) => {
      if (
        postRow.posts.length <= postsToShowInRow ||
        postRow.userFrontPagePostSortOrderOptionAtRowCreation ==
          UserFrontPagePostSortOrderOptionsEnum.New ||
        autoScrollPostRowOption == AutoScrollPostRowOptionEnum.Off
      ) {
        return;
      }

      const dispatchMostRowScroll = () => {
        if (
          autoScrollPostRowDirectionOption ==
          AutoScrollPostRowDirectionOptionEnum.Left
        ) {
          postRowScrollLeftPressed(postRow.postRowUuid, snapToPost);
        } else if (
          autoScrollPostRowDirectionOption ==
          AutoScrollPostRowDirectionOptionEnum.Right
        ) {
          postRowScrollRightPressed(postRow.postRowUuid, snapToPost);
        }
      };
      if (autoScrollIntervalRef.current !== undefined) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = undefined;
      }
      dispatchMostRowScroll();
      autoScrollIntervalRef.current = setInterval(() => {
        dispatchMostRowScroll();
      }, autoScrollPostRowRateSecondsForSinglePostCard * 1000);
    },
    [
      autoScrollPostRowDirectionOption,
      autoScrollPostRowOption,
      autoScrollPostRowRateSecondsForSinglePostCard,
      postRow.postRowUuid,
      postRow.posts.length,
      postRow.userFrontPagePostSortOrderOptionAtRowCreation,
      postRowScrollLeftPressed,
      postRowScrollRightPressed,
      postsToShowInRow,
    ]
  );

  const handlePostRowMouseEnter = useCallback(() => {
    const div = postRowDivRef.current as unknown as HTMLDivElement;
    div.tabIndex = 1;
    div.focus({ preventScroll: true });

    dispatch(mouseEnterPostRow(postRow.postRowUuid));
    if (autoScrollIntervalRef.current != undefined) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = undefined;
    }
    handleStopPostTransitions();
  }, [dispatch, handleStopPostTransitions, postRow.postRowUuid, postRowDivRef]);

  const handlePostRowMouseLeave = useCallback(
    (snapToPost = true) => {
      const div = postRowDivRef.current as unknown as HTMLDivElement;
      div.tabIndex = -1;

      dispatch(mouseLeavePostRow(postRow.postRowUuid));

      createAutoScrollInterval(snapToPost);
    },
    [createAutoScrollInterval, dispatch, postRow.postRowUuid, postRowDivRef]
  );

  const handleMouseOrTouchStart = useCallback(
    (clientX: number) => {
      mouseOrTouchOnPostCard.current = true;
      lastMovementX.current = clientX;
      totalMovementX.current = 0;
    },
    [lastMovementX, mouseOrTouchOnPostCard, totalMovementX]
  );

  const handlePostRowMove = useCallback(
    (clientX: number, mouseOrTouchOnPostCard: boolean) => {
      if (!mouseOrTouchOnPostCard || postRow.posts.length <= postsToShowInRow) {
        return;
      }
      const movement = clientX - lastMovementX.current;
      totalMovementX.current += Math.abs(movement);
      handleMoveUiPosts(postRow, movement);
      lastMovementX.current = clientX;
    },
    [handleMoveUiPosts, postRow, postsToShowInRow]
  );
  const handleMouseOrTouchEnd = useCallback(() => {
    mouseOrTouchOnPostCard.current = false;
    lastMovementX.current = 0;
  }, [lastMovementX, mouseOrTouchOnPostCard]);

  useEffect(() => {
    const delay = setTimeout(() => {
      createAutoScrollInterval(false);
    }, 1000);

    return () => {
      clearTimeout(delay);
    };
  }, [createAutoScrollInterval]);

  useEffect(() => {
    const postRowDivMouseLeaveTouchEnd = () => {
      handlePostRowMouseLeave(false);
    };
    const postRowOnKeyDown = (event: KeyboardEvent) => {
      mouseWheelPostScrollModifierPressed.current = event.shiftKey;
    };
    const postRowOnKeyUp = () => {
      mouseWheelPostScrollModifierPressed.current = false;
    };
    const postRowOnWheel = (event: WheelEvent) => {
      if (mouseWheelPostScrollModifierPressed.current) {
        handlePostRowMove(event.deltaY, true);
        lastMovementX.current = 0;
      }
    };
    const postRowDiv = postRowDivRef.current;
    if (postRowDiv !== null) {
      postRowDiv.addEventListener("mouseenter", handlePostRowMouseEnter);
      postRowDiv.addEventListener("touchstart", handlePostRowMouseEnter);
      postRowDiv.addEventListener("mouseleave", postRowDivMouseLeaveTouchEnd);
      postRowDiv.addEventListener("touchend", postRowDivMouseLeaveTouchEnd);
      postRowDiv.addEventListener("keydown", postRowOnKeyDown);
      postRowDiv.addEventListener("keyup", postRowOnKeyUp);
      postRowDiv.addEventListener("wheel", postRowOnWheel);
    }

    const postRowContentDivOnMouseDown = (event: MouseEvent) => {
      handleMouseOrTouchStart(event.clientX);
    };
    const postRowContentDivOnTouchStart = (event: TouchEvent) => {
      handleMouseOrTouchStart(event.touches[0].clientX);
    };
    const postRowContentDivOnMouseMove = (event: MouseEvent) => {
      handlePostRowMove(event.clientX, mouseOrTouchOnPostCard.current);
    };
    const postRowContentDivOnTouchMove = (event: TouchEvent) => {
      handlePostRowMove(
        event.touches[0].clientX,
        mouseOrTouchOnPostCard.current
      );
    };
    const postRowContentDiv = postRowContentDivRef.current;
    if (postRowContentDiv !== null) {
      postRowContentDiv.addEventListener(
        "mousedown",
        postRowContentDivOnMouseDown
      );
      postRowContentDiv.addEventListener(
        "touchstart",
        postRowContentDivOnTouchStart
      );
      postRowContentDiv.addEventListener(
        "mousemove",
        postRowContentDivOnMouseMove
      );
      postRowContentDiv.addEventListener(
        "touchmove",
        postRowContentDivOnTouchMove
      );
      postRowContentDiv.addEventListener("mouseup", handleMouseOrTouchEnd);
      postRowContentDiv.addEventListener("touchend", handleMouseOrTouchEnd);
      postRowContentDiv.addEventListener("mouseleave", handleMouseOrTouchEnd);
    }

    return () => {
      if (postRowDiv !== null) {
        postRowDiv.removeEventListener("mouseenter", handlePostRowMouseEnter);
        postRowDiv.removeEventListener("touchstart", handlePostRowMouseEnter);
        postRowDiv.removeEventListener(
          "mouseleave",
          postRowDivMouseLeaveTouchEnd
        );
        postRowDiv.removeEventListener(
          "touchend",
          postRowDivMouseLeaveTouchEnd
        );
        postRowDiv.removeEventListener("keydown", postRowOnKeyDown);
        postRowDiv.removeEventListener("keyup", postRowOnKeyUp);
        postRowDiv.removeEventListener("wheel", postRowOnWheel);
      }

      if (postRowContentDiv !== null) {
        postRowContentDiv.removeEventListener(
          "mousedown",
          postRowContentDivOnMouseDown
        );
        postRowContentDiv.removeEventListener(
          "touchstart",
          postRowContentDivOnTouchStart
        );
        postRowContentDiv.removeEventListener(
          "mousemove",
          postRowContentDivOnMouseMove
        );
        postRowContentDiv.removeEventListener(
          "touchmove",
          postRowContentDivOnTouchMove
        );
        postRowContentDiv.removeEventListener("mouseup", handleMouseOrTouchEnd);
        postRowContentDiv.removeEventListener(
          "touchend",
          handleMouseOrTouchEnd
        );
        postRowContentDiv.removeEventListener(
          "mouseleave",
          handleMouseOrTouchEnd
        );
      }
    };
  }, [
    handleMouseOrTouchEnd,
    handleMouseOrTouchStart,
    handlePostRowMouseEnter,
    handlePostRowMouseLeave,
    handlePostRowMove,
    postRowContentDivRef,
    postRowDivRef,
  ]);

  return {
    totalMovementX: totalMovementX,
    postRowScrollLeftPressed: postRowScrollLeftPressed,
    postRowScrollRightPressed: postRowScrollRightPressed,
  };
}
