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
  postRowDivRef: RefObject<HTMLDivElement>,
  postRowContentDivRef: RefObject<HTMLDivElement>,
  postSliderLeft: number,
  postCards: Array<PostCard>,
  gottenWithSubredditSourceOption: SubredditSourceOptionsEnum,
  scrollPostRowLeftButtonRef: RefObject<HTMLDivElement>,
  scrollPostRowRightButtonRef: RefObject<HTMLDivElement>
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
      const postRowDiv = postRowDivRef.current;
      if (
        postRowDiv === null ||
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
        (Math.abs(deltaX) / postRowDiv.clientWidth) * 100;
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
      postRowDivRef,
      postSliderLeft,
      postsToShowInRow,
      shiftPostCardsLeft,
      shiftPostCardsRight,
      updatePostRowLayoutParams,
    ]
  );

  const leftScrollButtonCLick = useCallback(() => {
    const postRowContentDiv = postRowContentDivRef.current;
    if (postRowContentDiv === null) {
      return;
    }
    let updatedPostCards: Array<PostCard> | undefined;
    let updatedPostSliderLeft: number | undefined;

    const postRowContentDivRect = postRowContentDiv.getBoundingClientRect();
    const currentPostRowLeftPercentage =
      (postRowContentDivRect.left / postRowContentDivRect.width) * 100;

    if (
      autoScrollPostRowDirectionOption ===
      AutoScrollPostRowDirectionOptionEnum.Left
    ) {
      updatedPostSliderLeft = 0;
      updatedPostCards = shiftPostCardsLeft();
    } else if (
      autoScrollPostRowDirectionOption ===
      AutoScrollPostRowDirectionOptionEnum.Right
    ) {
      updatedPostSliderLeft = Math.abs(calcPostCardWidthPercentage()) * -1;
      if (
        currentPostRowLeftPercentage ===
        Math.abs(calcPostCardWidthPercentage()) * -1
      ) {
        updatedPostCards = shiftPostCardsLeft();
      }
    }
    updatePostRowLayoutParams(updatedPostCards, updatedPostSliderLeft, 0);
  }, [
    autoScrollPostRowDirectionOption,
    calcPostCardWidthPercentage,
    postRowContentDivRef,
    shiftPostCardsLeft,
    updatePostRowLayoutParams,
  ]);

  const rightScrollButtonCLick = useCallback(() => {
    const postRowContentDiv = postRowContentDivRef.current;
    if (postRowContentDiv === null) {
      return;
    }
    let updatedPostCards: Array<PostCard> | undefined;
    let updatedPostSliderLeft: number | undefined;

    const postRowContentDivRect = postRowContentDiv.getBoundingClientRect();
    const currentPostRowLeftPercentage =
      (postRowContentDivRect.left / postRowContentDivRect.width) * 100;

    if (
      autoScrollPostRowDirectionOption ===
      AutoScrollPostRowDirectionOptionEnum.Left
    ) {
      updatedPostSliderLeft = 0;
      if (currentPostRowLeftPercentage === 0) {
        updatedPostCards = shiftPostCardsRight();
      }
    } else if (
      autoScrollPostRowDirectionOption ===
      AutoScrollPostRowDirectionOptionEnum.Right
    ) {
      updatedPostSliderLeft = Math.abs(calcPostCardWidthPercentage()) * -1;
      updatedPostCards = shiftPostCardsRight();
    }
    updatePostRowLayoutParams(updatedPostCards, updatedPostSliderLeft, 0);
  }, [
    autoScrollPostRowDirectionOption,
    calcPostCardWidthPercentage,
    postRowContentDivRef,
    shiftPostCardsRight,
    updatePostRowLayoutParams,
  ]);

  useEffect(() => {
    const postRowDiv = postRowDivRef.current;
    const postRowContentDiv = postRowContentDivRef.current;
    const scrollPostRowLeftButton = scrollPostRowLeftButtonRef.current;
    const scrollPostRowRightButton = scrollPostRowRightButtonRef.current;
    if (
      postRowContentDiv === null ||
      scrollPostRowLeftButton === null ||
      scrollPostRowRightButton === null ||
      postRowDiv === null
    ) {
      return;
    }
    const mouseLeave = () => {
      startAutoScroll(postCards);
    };
    postRowContentDiv.addEventListener("transitionend", handleTransitionEnd);
    postRowDiv.addEventListener("mouseenter", stopPostRowTransition);
    postRowDiv.addEventListener("mouseover", stopPostRowTransition);
    postRowDiv.addEventListener("mouseleave", mouseLeave);
    postRowDiv.addEventListener("mousedown", handleMouseDownOrTouchStart);
    postRowDiv.addEventListener("mouseup", handleMouseUpTouchEnd);
    postRowDiv.addEventListener("mousemove", handleMouseOrTouchMove);

    postRowDiv.addEventListener("touchstart", handleMouseDownOrTouchStart);
    postRowDiv.addEventListener("touchend", handleMouseUpTouchEnd);
    postRowDiv.addEventListener("touchmove", handleMouseOrTouchMove);

    scrollPostRowLeftButton.addEventListener("click", leftScrollButtonCLick);
    scrollPostRowRightButton.addEventListener("click", rightScrollButtonCLick);

    return () => {
      postRowContentDiv.removeEventListener(
        "transitionend",
        handleTransitionEnd
      );
      postRowDiv.removeEventListener("mouseenter", stopPostRowTransition);
      postRowDiv.removeEventListener("mouseover", stopPostRowTransition);
      postRowDiv.removeEventListener("mouseleave", mouseLeave);
      postRowDiv.removeEventListener("mousedown", handleMouseDownOrTouchStart);
      postRowDiv.removeEventListener("mouseup", handleMouseUpTouchEnd);
      postRowDiv.removeEventListener("mousemove", handleMouseOrTouchMove);

      postRowDiv.removeEventListener("touchstart", handleMouseDownOrTouchStart);
      postRowDiv.removeEventListener("touchend", handleMouseUpTouchEnd);
      postRowDiv.removeEventListener("touchmove", handleMouseOrTouchMove);

      scrollPostRowLeftButton.removeEventListener(
        "click",
        leftScrollButtonCLick
      );
      scrollPostRowRightButton.removeEventListener(
        "click",
        rightScrollButtonCLick
      );
    };
  }, [
    handleMouseDownOrTouchStart,
    handleMouseOrTouchMove,
    handleMouseUpTouchEnd,
    handleTransitionEnd,
    leftScrollButtonCLick,
    postCards,
    postRowContentDivRef,
    postRowDivRef,
    rightScrollButtonCLick,
    scrollPostRowLeftButtonRef,
    scrollPostRowRightButtonRef,
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
      postCards.length === Math.ceil(postsToShowInRow + 2)
    ) {
      setTimeout(() => startAutoScroll(postCards), 0);
    } else if (
      postCards.length > 0 &&
      postCards.length < Math.ceil(postsToShowInRow + 2) &&
      masterPosts.length > Math.ceil(postsToShowInRow)
    ) {
      const cardsToSet = [...postCards];
      const numOfCardsToAdd =
        Math.ceil(postsToShowInRow) + 2 - postCards.length;
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
      postCards.length > Math.ceil(postsToShowInRow) + 2 &&
      masterPosts.length > Math.ceil(postsToShowInRow)
    ) {
      const cardsToSet = postCards.slice(0, Math.ceil(postsToShowInRow) + 2);

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
