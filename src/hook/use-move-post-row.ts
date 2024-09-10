import {
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { Post } from "../model/Post/Post.ts";
import SubredditSourceOptionsEnum from "../model/config/enums/SubredditSourceOptionsEnum.ts";
import PostCard from "../model/PostCard.ts";
import { AppConfigStateContext } from "../context/app-config-context.ts";
import { PostRowPageDispatchContext } from "../context/post-row-page-context.ts";
import { PostRowPageActionType } from "../reducer/post-row-page-reducer.ts";
import { ContextMenuStateContext } from "../context/context-menu-context.ts";
import { AutoScrollPostRowDirectionOptionEnum } from "../model/config/enums/AutoScrollPostRowDirectionOptionEnum.ts";
import { v4 as uuidV4 } from "uuid";

export default function useMovePostRow(
  postRowUuid: string,
  masterPosts: Array<Post>,
  postRowContentDivRef: RefObject<HTMLDivElement>,
  postSliderLeft: number,
  postCards: Array<PostCard>,
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
  const hookInitialized = useRef(false);

  const shouldAutoScroll =
    gottenWithSubredditSourceOption !== SubredditSourceOptionsEnum.FrontPage &&
    autoScrollPostRow;

  const shiftPostCardsRight = useCallback(() => {
    const firstPostCard = postCards[0];
    const masterIndex = masterPosts.findIndex(
      (post) => post.postUuid === firstPostCard.postToDisplayUuid
    );
    if (masterIndex === -1) {
      return;
    }

    let postToInsert: Post;
    if (masterIndex === 0) {
      postToInsert = masterPosts[masterPosts.length - 1];
    } else {
      postToInsert = masterPosts[masterIndex - 1];
    }
    const updatedPostCards = [...postCards];
    updatedPostCards.unshift(makePostCard(postToInsert));
    updatedPostCards.pop();
    return updatedPostCards;
  }, [masterPosts, postCards]);

  const shiftPostCardsLeft = useCallback(() => {
    const lastPostCard = postCards[postCards.length - 1];
    const masterIndex = masterPosts.findIndex(
      (post) => post.postUuid === lastPostCard.postToDisplayUuid
    );
    if (masterIndex === -1) {
      return;
    }

    let postToInsert: Post;
    if (masterIndex === masterPosts.length - 1) {
      postToInsert = masterPosts[0];
    } else {
      postToInsert = masterPosts[masterIndex + 1];
    }
    const updatedPostCards = [...postCards];
    updatedPostCards.push(makePostCard(postToInsert));
    updatedPostCards.shift();
    return updatedPostCards;
  }, [masterPosts, postCards]);

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
      postCards: Array<PostCard> | undefined,
      postSliderLeft: number | undefined,
      postSliderTransitionTime: number | undefined
    ) => {
      if (postCards !== undefined) {
        postRowPageDispatch({
          type: PostRowPageActionType.SET_POST_CARDS_TO_SHOW_IN_ROW,
          payload: {
            postRowUuid: postRowUuid,
            postCards: postCards,
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

  const stopPostRowTransition = useCallback(() => {
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

  const startAutoScroll = useCallback(
    (postCardsParam: Array<PostCard>) => {
      const postRowContentDiv = postRowContentDivRef.current;
      if (
        postRowContentDiv === null ||
        menuOpenOnPostRowUuid === postRowUuid ||
        !shouldAutoScroll ||
        postCardsParam.length <= postsToShowInRow
      ) {
        return;
      }
      let goToSliderLeft: number | undefined;
      let goToTransitionTime: number | undefined;

      const absCardWidthPercentage = Math.abs(calcPostCardWidthPercentage());

      if (
        autoScrollPostRowDirectionOption ===
        AutoScrollPostRowDirectionOptionEnum.Right
      ) {
        goToSliderLeft = 0;
        goToTransitionTime =
          autoScrollPostRowRateSecondsForSinglePostCard *
          (Math.abs(postSliderLeft) / absCardWidthPercentage);
        goToTransitionTime = Math.abs(goToTransitionTime);
      } else if (
        autoScrollPostRowDirectionOption ===
        AutoScrollPostRowDirectionOptionEnum.Left
      ) {
        goToSliderLeft = absCardWidthPercentage * -1;
        goToTransitionTime =
          autoScrollPostRowRateSecondsForSinglePostCard *
          ((absCardWidthPercentage - Math.abs(postSliderLeft)) /
            absCardWidthPercentage);
        goToTransitionTime = Math.abs(goToTransitionTime);
      }
      updatePostRowLayoutParams(undefined, goToSliderLeft, goToTransitionTime);
    },
    [
      autoScrollPostRowDirectionOption,
      autoScrollPostRowRateSecondsForSinglePostCard,
      calcPostCardWidthPercentage,
      menuOpenOnPostRowUuid,
      postRowContentDivRef,
      postRowUuid,
      postSliderLeft,
      postsToShowInRow,
      shouldAutoScroll,
      updatePostRowLayoutParams,
    ]
  );

  const makePostCard = (post: Post): PostCard => {
    return {
      postToDisplayUuid: post.postUuid,
      postCardUuid: `${uuidV4()}`,
      showPostCardInfo: false,
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
        const updatedPostCards = shiftPostCardsLeft();
        updatePostRowLayoutParams(updatedPostCards, 0, 0);
        setTimeout(() => {
          updatePostRowLayoutParams(
            undefined,
            calcPostCardWidthPercentage() * -1,
            autoScrollPostRowRateSecondsForSinglePostCard
          );
        }, 0);
      } else if (
        autoScrollPostRowDirectionOption ===
        AutoScrollPostRowDirectionOptionEnum.Right
      ) {
        const updatedPostCards = shiftPostCardsRight();
        updatePostRowLayoutParams(
          updatedPostCards,
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
      postRowContentDivRef,
      shiftPostCardsLeft,
      shiftPostCardsRight,
      updatePostRowLayoutParams,
    ]
  );

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
          startAutoScroll(postCards);
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
    [postCards, startAutoScroll]
  );

  const handleMouseOrTouchMove = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const postRowContentDiv = postRowContentDivRef.current;
      if (
        postRowContentDiv === null ||
        !mouseDownOnPostRow.current ||
        postCards.length <= postsToShowInRow
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
        updatePostRowLayoutParams(
          shiftPostCardsRight(),
          calcPostCardWidthPercentage() * -1,
          0
        );
      } else if (leftToSet <= calcPostCardWidthPercentage() * -1) {
        updatePostRowLayoutParams(shiftPostCardsLeft(), 0, 0);
      } else {
        updatePostRowLayoutParams(undefined, leftToSet, 0);
      }
      lastMouseDownX.current = eventX;
    },
    [
      calcPostCardWidthPercentage,
      postCards.length,
      postRowContentDivRef,
      postSliderLeft,
      postsToShowInRow,
      shiftPostCardsLeft,
      shiftPostCardsRight,
      updatePostRowLayoutParams,
    ]
  );

  useEffect(() => {
    const postRowContentDiv = postRowContentDivRef.current;
    if (postRowContentDiv === null) {
      return;
    }
    const mouseLeave = () => {
      startAutoScroll(postCards);
    };
    postRowContentDiv.addEventListener("transitionend", handleTransitionEnd);
    postRowContentDiv.addEventListener("mouseenter", stopPostRowTransition);
    postRowContentDiv.addEventListener("mouseover", stopPostRowTransition);
    postRowContentDiv.addEventListener("mouseleave", mouseLeave);
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
      postRowContentDiv.removeEventListener(
        "mouseenter",
        stopPostRowTransition
      );
      postRowContentDiv.removeEventListener("mouseover", stopPostRowTransition);
      postRowContentDiv.removeEventListener("mouseleave", mouseLeave);
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
    handleMouseOrTouchMove,
    handleMouseUpTouchEnd,
    handleTransitionEnd,
    postCards,
    postRowContentDivRef,
    startAutoScroll,
    stopPostRowTransition,
  ]);

  useEffect(() => {
    if (
      menuOpenOnPostRowUuid === undefined &&
      contextMenuOpenOnPostRowRef.current
    ) {
      startAutoScroll(postCards);
    }
    contextMenuOpenOnPostRowRef.current = menuOpenOnPostRowUuid === postRowUuid;
  }, [menuOpenOnPostRowUuid, postCards, postRowUuid, startAutoScroll]);

  useLayoutEffect(() => {
    const postRowContentDiv = postRowContentDivRef.current;
    if (postRowContentDiv === null) {
      return;
    }
    return () => {
      updatePostRowLayoutParams(
        undefined,
        (postRowContentDiv.getBoundingClientRect().left /
          postRowContentDiv.getBoundingClientRect().width) *
          100,
        0
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    if (hookInitialized.current) {
      return;
    }
    hookInitialized.current = true;

    let initialLeft: number | undefined;
    let goToLeft: number | undefined;
    if (
      autoScrollPostRowDirectionOption ===
      AutoScrollPostRowDirectionOptionEnum.Left
    ) {
      initialLeft = 0;
      goToLeft = Math.abs(calcPostCardWidthPercentage()) * -1;
    } else if (
      autoScrollPostRowDirectionOption ===
      AutoScrollPostRowDirectionOptionEnum.Right
    ) {
      initialLeft = calcPostCardWidthPercentage() * -1;
      goToLeft = 0;
    }
    if (postCards.length === 0 && masterPosts.length <= postsToShowInRow) {
      const postsToSet = masterPosts.map((post) => makePostCard(post));
      updatePostRowLayoutParams(postsToSet, 0, 0);
    } else if (
      postCards.length === 0 &&
      masterPosts.length > postsToShowInRow
    ) {
      const postsToSet = [makePostCard(masterPosts[masterPosts.length - 1])];
      const subPostCardsArr = masterPosts
        .slice(0, postsToShowInRow + 1)
        .map((post) => makePostCard(post));
      postsToSet.push(...subPostCardsArr);

      updatePostRowLayoutParams(postsToSet, initialLeft, 0);
      setTimeout(
        () =>
          updatePostRowLayoutParams(
            undefined,
            goToLeft,
            autoScrollPostRowRateSecondsForSinglePostCard
          ),
        0
      );
    } else if (
      postCards.length > 0 &&
      postCards.length === postsToShowInRow + 2
    ) {
      setTimeout(() => startAutoScroll(postCards), 0);
    } else if (
      postCards.length > 0 &&
      postCards.length < postsToShowInRow + 2 &&
      masterPosts.length > postsToShowInRow
    ) {
      const cardsToSet = [...postCards];
      const numOfCardsToAdd = postsToShowInRow + 2 - postCards.length;
      let runningIndex = masterPosts.findIndex(
        (post) =>
          post.postUuid === postCards[postCards.length - 1].postToDisplayUuid
      );
      if (runningIndex === -1) {
        return;
      }
      for (let i = 0; i < numOfCardsToAdd; ++i) {
        if (runningIndex + 1 >= masterPosts.length) {
          runningIndex = 0;
        } else {
          runningIndex++;
        }
        cardsToSet.push(makePostCard(masterPosts[runningIndex]));
      }
      updatePostRowLayoutParams(cardsToSet, initialLeft, 0);
      setTimeout(
        () =>
          updatePostRowLayoutParams(
            undefined,
            goToLeft,
            autoScrollPostRowRateSecondsForSinglePostCard
          ),
        0
      );
    } else if (
      postCards.length > 0 &&
      postCards.length > postsToShowInRow + 2 &&
      masterPosts.length > postsToShowInRow
    ) {
      const cardsToSet = postCards.slice(0, postsToShowInRow + 2);

      updatePostRowLayoutParams(cardsToSet, initialLeft, 0);
      setTimeout(
        () =>
          updatePostRowLayoutParams(
            undefined,
            goToLeft,
            autoScrollPostRowRateSecondsForSinglePostCard
          ),
        0
      );
    }
  }, [
    autoScrollPostRowDirectionOption,
    autoScrollPostRowRateSecondsForSinglePostCard,
    calcPostCardWidthPercentage,
    masterPosts,
    postCards,
    postCards.length,
    postsToShowInRow,
    startAutoScroll,
    updatePostRowLayoutParams,
  ]);
}
