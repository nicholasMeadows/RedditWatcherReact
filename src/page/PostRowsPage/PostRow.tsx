import { PostRow } from "../../model/PostRow.ts";
import { useAppDispatch, useAppSelector } from "../../redux/store.ts";
import getPlatform from "../../util/PlatformUtil.ts";
import { Platform } from "../../model/Platform.ts";
import {
  FC,
  KeyboardEvent,
  MouseEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  WheelEvent,
} from "react";
import {
  mouseEnterPostRow,
  mouseLeavePostRow,
  movePostRow,
} from "../../redux/slice/PostRowsSlice.ts";
import { POST_CARD_LEFT_MARGIN_EM } from "../../RedditWatcherConstants.ts";
import UserFrontPagePostSortOrderOptionsEnum from "../../model/config/enums/UserFrontPagePostSortOrderOptionsEnum.ts";
import { AutoScrollPostRowOptionEnum } from "../../model/config/enums/AutoScrollPostRowOptionEnum.ts";
import { UiPost } from "../../model/Post/Post.ts";
import { PostCardContext, RootFontSizeContext } from "../Context.ts";
import PostCard from "./PostCard.tsx";

type Props = { postRow: PostRow };
const PostRow: FC<Props> = ({ postRow }) => {
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((state) => state.appConfig.darkMode);

  const { fontSize } = useContext(RootFontSizeContext);

  const postsToShowInRow = useAppSelector(
    (state) => state.appConfig.postsToShowInRow
  );
  const postCardWidthPercentage = useAppSelector(
    (state) => state.postRows.postCardWidthPercentage
  );

  const postRowContentWidthPx = useAppSelector(
    (state) => state.postRows.postRowContentWidthPx
  );

  const autoScrollPostRowOption = useAppSelector(
    (state) => state.appConfig.autoScrollPostRowOption
  );
  const createInitialAutoScrollIntervalTimeout = useRef<NodeJS.Timeout>();
  const restartAutoScrollIntervalTimeout = useRef<NodeJS.Timeout>();

  const autoScrollPostInterval = useRef<NodeJS.Timeout>();

  const rootPostRowDivRef = useRef(null);
  const postRowContentDivRef = useRef(null);

  const mouseScrollModifierPressed = useRef(false);
  const postContentMouseDownLastX = useRef(0);
  const postContentMouseDownTotalX = useRef(0);
  const postContentMouseDown = useRef(false);
  const handleMouseDownTouchStart = useCallback((clientX: number) => {
    postContentMouseDown.current = true;
    postContentMouseDownLastX.current = clientX;
    postContentMouseDownTotalX.current = 0;
  }, []);

  const handleMouseUpTouchEnd = useCallback(() => {
    postContentMouseDown.current = false;
    postContentMouseDownLastX.current = 0;
  }, []);

  const handleMouseTouchMove = useCallback(
    (clientX: number, postContentMouseDownOverride = false) => {
      if (
        (!postContentMouseDownOverride && !postContentMouseDown.current) ||
        postRow.posts.length <= postsToShowInRow
      ) {
        return;
      }
      const diff = clientX - postContentMouseDownLastX.current;
      postContentMouseDownTotalX.current += Math.abs(diff);

      dispatch(
        movePostRow({
          postRowUuid: postRow.postRowUuid,
          movementDiffPx: diff,
          postsToShowInRow: postsToShowInRow,
        })
      );
      postContentMouseDownLastX.current = clientX;
    },
    [dispatch, postRow.postRowUuid, postRow.posts.length, postsToShowInRow]
  );

  const handleMovePostRowLeftButtonClick = useCallback(() => {
    const firstUiPostVisible = postRow.uiPosts.find(
      (uiPost) => uiPost.leftPercentage > -postCardWidthPercentage
    );

    if (firstUiPostVisible == undefined) {
      return;
    }
    const movementDiffPercent =
      -postCardWidthPercentage - firstUiPostVisible.leftPercentage;
    dispatch(
      movePostRow({
        postRowUuid: postRow.postRowUuid,
        postsToShowInRow: postsToShowInRow,
        movementDiffPx: movementDiffPercent * 0.01 * postRowContentWidthPx,
      })
    );
  }, [
    dispatch,
    postCardWidthPercentage,
    postRow.postRowUuid,
    postRow.uiPosts,
    postRowContentWidthPx,
    postsToShowInRow,
  ]);

  const handleMovePostRowRightButtonClick = useCallback(() => {
    const lastVisibleUiPost = postRow.uiPosts.find(
      (uiPost) => uiPost.leftPercentage + postCardWidthPercentage >= 100
    );

    if (lastVisibleUiPost == undefined) {
      return;
    }

    const movementDiffPercent = 100 - lastVisibleUiPost.leftPercentage;
    dispatch(
      movePostRow({
        postRowUuid: postRow.postRowUuid,
        postsToShowInRow: postsToShowInRow,
        movementDiffPx: movementDiffPercent * 0.01 * postRowContentWidthPx,
      })
    );
  }, [
    dispatch,
    postCardWidthPercentage,
    postRow.postRowUuid,
    postRow.uiPosts,
    postRowContentWidthPx,
    postsToShowInRow,
  ]);

  const createAutoScrollInterval = useCallback(() => {
    if (autoScrollPostInterval.current != undefined) {
      clearInterval(autoScrollPostInterval.current);
      autoScrollPostInterval.current = undefined;
    }
    if (
      postRow.posts.length <= postsToShowInRow ||
      postRow.userFrontPagePostSortOrderOptionAtRowCreation ==
        UserFrontPagePostSortOrderOptionsEnum.New ||
      autoScrollPostRowOption == AutoScrollPostRowOptionEnum.Off
    ) {
      return;
    }

    autoScrollPostInterval.current = setInterval(() => {
      handleMovePostRowRightButtonClick();
    }, 6000);
  }, [
    autoScrollPostRowOption,
    handleMovePostRowRightButtonClick,
    postRow.posts.length,
    postsToShowInRow,
    postRow.userFrontPagePostSortOrderOptionAtRowCreation,
  ]);

  useEffect(() => {
    if (createInitialAutoScrollIntervalTimeout.current != undefined) {
      clearTimeout(createInitialAutoScrollIntervalTimeout.current);
      createInitialAutoScrollIntervalTimeout.current = undefined;
    }
    if (postRow.posts.length > postsToShowInRow) {
      createInitialAutoScrollIntervalTimeout.current = setTimeout(() => {
        if (
          autoScrollPostRowOption ==
            AutoScrollPostRowOptionEnum.SmoothContinuousScroll &&
          postRow.userFrontPagePostSortOrderOptionAtRowCreation !=
            UserFrontPagePostSortOrderOptionsEnum.New
        ) {
          handleMovePostRowRightButtonClick();
        }
        createAutoScrollInterval();
        createInitialAutoScrollIntervalTimeout.current = undefined;
      }, 100);
    }
    return () => {
      if (autoScrollPostInterval.current != undefined) {
        clearInterval(autoScrollPostInterval.current);
        autoScrollPostInterval.current = undefined;
      }
    };
  }, []);

  const handlePostRowMouseEnter = useCallback(() => {
    dispatch(mouseEnterPostRow(postRow.postRowUuid));
    if (autoScrollPostInterval.current != undefined) {
      clearInterval(autoScrollPostInterval.current);
      autoScrollPostInterval.current = undefined;
    }

    if (restartAutoScrollIntervalTimeout.current != undefined) {
      clearTimeout(restartAutoScrollIntervalTimeout.current);
      restartAutoScrollIntervalTimeout.current = undefined;
    }

    const rootDiv = rootPostRowDivRef.current as unknown as HTMLDivElement;
    rootDiv.tabIndex = 1;
    rootDiv.focus();
  }, [dispatch, postRow.postRowUuid]);

  const handlePostRowMouseLeave = useCallback(() => {
    dispatch(mouseLeavePostRow());
    if (restartAutoScrollIntervalTimeout.current != undefined) {
      clearTimeout(restartAutoScrollIntervalTimeout.current);
      restartAutoScrollIntervalTimeout.current = undefined;
    }
    if (
      postRow.posts.length > postsToShowInRow &&
      postRow.userFrontPagePostSortOrderOptionAtRowCreation !=
        UserFrontPagePostSortOrderOptionsEnum.New
    ) {
      restartAutoScrollIntervalTimeout.current = setTimeout(() => {
        handleMovePostRowRightButtonClick();
        createAutoScrollInterval();
      }, 3000);
    }
    const rootDiv = rootPostRowDivRef.current as unknown as HTMLDivElement;
    rootDiv.tabIndex = -1;
  }, [
    createAutoScrollInterval,
    dispatch,
    handleMovePostRowRightButtonClick,
    postRow.posts.length,
    postsToShowInRow,
    postRow.userFrontPagePostSortOrderOptionAtRowCreation,
  ]);

  const handlePostRowKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      mouseScrollModifierPressed.current = event.shiftKey;
    },
    []
  );
  const handlePostRowKeyUp = useCallback(() => {
    mouseScrollModifierPressed.current = false;
  }, []);

  const handleMouseWheel = useCallback(
    (event: WheelEvent<HTMLDivElement>) => {
      handleMouseTouchMove(event.deltaY, true);
      handleMouseUpTouchEnd();
    },
    [handleMouseTouchMove, handleMouseUpTouchEnd]
  );

  const stopPostCardTransition = useCallback(
    (uiPost: UiPost, postCardDiv: HTMLDivElement) => {
      const marginLeft = fontSize * POST_CARD_LEFT_MARGIN_EM;
      const postRowContentDiv =
        postRowContentDivRef.current as unknown as HTMLDivElement;

      const currentPostCardLeftPx =
        postCardDiv.getBoundingClientRect().left -
        marginLeft -
        postRowContentDiv.getBoundingClientRect().left;

      const targetUiPostLeftPercentage = uiPost.leftPercentage;
      const targetUiPostLeftPx =
        targetUiPostLeftPercentage * 0.01 * postRowContentWidthPx;

      console.log(currentPostCardLeftPx - targetUiPostLeftPx);
      dispatch(
        movePostRow({
          postRowUuid: postRow.postRowUuid,
          postsToShowInRow: postsToShowInRow,
          movementDiffPx: currentPostCardLeftPx - targetUiPostLeftPx,
        })
      );
    },
    [
      dispatch,
      fontSize,
      postRow.postRowUuid,
      postRowContentWidthPx,
      postsToShowInRow,
    ]
  );

  const hideScrollButtonDivs = () => {
    return getPlatform() == Platform.Android || getPlatform() == Platform.Ios;
  };

  const handlePostCardClickCapture = useCallback((event: MouseEvent) => {
    if (postContentMouseDownTotalX.current > 50) {
      console.log("Preventing default");
      event.preventDefault();
      event.stopPropagation();
    }
  }, []);

  const handleOnMouseEnter = useCallback(
    (event: MouseEvent, uiPost: UiPost) => {
      event.preventDefault();
      event.stopPropagation();
      stopPostCardTransition(uiPost, event.currentTarget as HTMLDivElement);
    },
    [stopPostCardTransition]
  );

  return (
    <div
      className="postRow"
      ref={rootPostRowDivRef}
      onMouseEnter={() => handlePostRowMouseEnter()}
      onMouseLeave={() => handlePostRowMouseLeave()}
      onTouchStart={() => handlePostRowMouseEnter()}
      onTouchEnd={() => handlePostRowMouseLeave()}
      onKeyDown={(event) => handlePostRowKeyDown(event)}
      onKeyUp={() => handlePostRowKeyUp()}
      onWheel={(event) => handleMouseWheel(event)}
    >
      <div
        hidden={hideScrollButtonDivs()}
        className="postRowScrollButton leftPostRowScrollButton"
      >
        <img
          alt={""}
          src={
            darkMode
              ? "assets/left_chevron_dark_mode.png"
              : "assets/left_chevron_light_mode.png"
          }
          className="postRowScrollImg"
          style={{
            visibility:
              postRow.posts.length > postsToShowInRow ? "visible" : "hidden",
          }}
          onClick={() => {
            handleMovePostRowLeftButtonClick();
          }}
        />
      </div>
      <div
        className="postRowContent"
        ref={postRowContentDivRef}
        onMouseLeave={() => handleMouseUpTouchEnd()}
      >
        {postRow.uiPosts.map((uiPost) => (
          <PostCardContext.Provider
            value={{
              uiPost: uiPost,
              postRowUuid: postRow.postRowUuid,
              userFrontPagePostSortOrderOptionAtRowCreation:
                postRow.userFrontPagePostSortOrderOptionAtRowCreation,
              handleMouseDownTouchStart: handleMouseDownTouchStart,
              stopPostCardTransition: stopPostCardTransition,
              handleMouseUpTouchEnd: handleMouseUpTouchEnd,
              handleMouseTouchMove: handleMouseTouchMove,
              handlePostCardClickCapture: handlePostCardClickCapture,
              handleOnMouseEnter: handleOnMouseEnter,
            }}
            key={uiPost.uiUuid}
          >
            <PostCard />
          </PostCardContext.Provider>
        ))}
      </div>
      <div
        hidden={hideScrollButtonDivs()}
        className="postRowScrollButton rightPostRowScrollButton"
      >
        <img
          alt={""}
          src={
            darkMode
              ? "assets/right_chevron_dark_mode.png"
              : "assets/right_chevron_light_mode.png"
          }
          className="postRowScrollImg"
          onClick={() => {
            handleMovePostRowRightButtonClick();
          }}
          style={{
            visibility:
              postRow.posts.length > postsToShowInRow ? "visible" : "hidden",
          }}
        />
      </div>
    </div>
  );
};

export default PostRow;
