import { PostRow } from "../../model/PostRow";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import getPlatform from "../../util/PlatformUtil.ts";
import { Platform } from "../../model/Platform.ts";
import PostMediaElement from "./PostMediaElement.tsx";
import { MouseEvent, useCallback, useContext, useEffect, useRef } from "react";
import {
  mouseEnterPostRow,
  mouseLeavePostRow,
  movePostRow,
} from "../../redux/slice/PostRowsSlice.ts";
import { useNavigate } from "react-router-dom";
import { setPostAndRowUuid } from "../../redux/slice/SinglePostPageSlice.ts";
import {
  POST_CARD_LEFT_MARGIN_EM,
  SINGPLE_POST_ROUTE,
} from "../../RedditWatcherConstants.ts";
import { setPostContextMenuEvent } from "../../redux/slice/ContextMenuSlice.ts";
import PostContextMenuEvent from "../../model/Events/PostContextMenuEvent.ts";
import UserFrontPagePostSortOrderOptionsEnum from "../../model/config/enums/UserFrontPagePostSortOrderOptionsEnum.ts";
import { AutoScrollPostRowOptionEnum } from "../../model/config/enums/AutoScrollPostRowOptionEnum.ts";
import { UiPost } from "../../model/Post/Post.ts";
import { RootFontSizeContext } from "../Context.ts";

type Props = { postRow: PostRow };
const PostRowView: React.FC<Props> = ({ postRow }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
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

  const mouseOverPostRowUuid = useAppSelector(
    (state) => state.postRows.mouseOverPostRowUuid
  );

  const userFrontPageSortOption = useAppSelector(
    (state) => state.appConfig.userFrontPagePostSortOrderOption
  );

  const autoScrollPostRowOption = useAppSelector(
    (state) => state.appConfig.autoScrollPostRowOption
  );
  const createInitialAutoScrollIntervalTimeout = useRef<NodeJS.Timeout>();
  const restartAutoScrollIntervalTimeout = useRef<NodeJS.Timeout>();

  const autoScrollPostInterval = useRef<NodeJS.Timeout>();

  const postRowContentDivRef = useRef(null);

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
    (clientX: number, postContentMouseDown: boolean) => {
      if (!postContentMouseDown || postRow.posts.length <= postsToShowInRow) {
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
      userFrontPageSortOption == UserFrontPagePostSortOrderOptionsEnum.New ||
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
    userFrontPageSortOption,
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
          userFrontPageSortOption != UserFrontPagePostSortOrderOptionsEnum.New
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
  }, [dispatch, postRow.postRowUuid]);

  const handlePostRowMouseLeave = useCallback(() => {
    dispatch(mouseLeavePostRow());
    if (restartAutoScrollIntervalTimeout.current != undefined) {
      clearTimeout(restartAutoScrollIntervalTimeout.current);
      restartAutoScrollIntervalTimeout.current = undefined;
    }
    if (
      postRow.posts.length > postsToShowInRow &&
      userFrontPageSortOption != UserFrontPagePostSortOrderOptionsEnum.New
    ) {
      restartAutoScrollIntervalTimeout.current = setTimeout(() => {
        handleMovePostRowRightButtonClick();
        createAutoScrollInterval();
      }, 3000);
    }
  }, [
    createAutoScrollInterval,
    dispatch,
    handleMovePostRowRightButtonClick,
    postRow.posts.length,
    postsToShowInRow,
    userFrontPageSortOption,
  ]);

  const stopPostCardTransition = useCallback(
    (uiPost: UiPost, event: MouseEvent<HTMLDivElement>) => {
      const marginLeft = fontSize * POST_CARD_LEFT_MARGIN_EM;
      const postRowContentDiv =
        postRowContentDivRef.current as unknown as HTMLDivElement;
      const postCardDiv = event.currentTarget as HTMLDivElement;

      const currentPostCardLeftPx =
        postCardDiv.getBoundingClientRect().left -
        marginLeft -
        postRowContentDiv.getBoundingClientRect().left;

      const targetUiPostLeftPercentage = uiPost.leftPercentage;
      const targetUiPostLeftPx =
        targetUiPostLeftPercentage * 0.01 * postRowContentWidthPx;

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

  return (
    <div
      className="postRow"
      onMouseEnter={() => handlePostRowMouseEnter()}
      onMouseLeave={() => handlePostRowMouseLeave()}
      onTouchStart={() => handlePostRowMouseEnter()}
      onTouchEnd={() => handlePostRowMouseLeave()}
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
      <div className="postRowContent" ref={postRowContentDivRef}>
        {postRow.uiPosts.map((post) => (
          <div
            key={post.uiUuid}
            className={`post-card-outer`}
            style={{
              minWidth: `${postCardWidthPercentage}%`,
              maxWidth: `${postCardWidthPercentage}%`,
              left: `${post.leftPercentage}%`,
              transition: `${
                mouseOverPostRowUuid == postRow.postRowUuid ||
                userFrontPageSortOption ==
                  UserFrontPagePostSortOrderOptionsEnum.New ||
                autoScrollPostRowOption ==
                  AutoScrollPostRowOptionEnum.ScrollByPostWidth
                  ? "none"
                  : "left 6000ms linear"
              }`,
            }}
          >
            <div
              className={"post-card-inner"}
              onTouchStart={(event) => {
                handleMouseDownTouchStart(event.touches[0].clientX);
              }}
              onTouchEnd={() => {
                handleMouseUpTouchEnd();
              }}
              onTouchMove={(event) => {
                handleMouseTouchMove(
                  event.touches[0].clientX,
                  postContentMouseDown.current
                );
              }}
              onMouseDown={(event) => {
                handleMouseDownTouchStart(event.clientX);
              }}
              onMouseUp={() => {
                handleMouseUpTouchEnd();
              }}
              onMouseMove={(event) => {
                handleMouseTouchMove(
                  event.clientX,
                  postContentMouseDown.current
                );
              }}
              onContextMenu={(event) => {
                event.preventDefault();
                event.stopPropagation();
                const postContextMenuEvent: PostContextMenuEvent = {
                  post: post,
                  x: event.clientX,
                  y: event.clientY,
                };
                dispatch(
                  setPostContextMenuEvent({ event: postContextMenuEvent })
                );
              }}
              onClick={() => {
                dispatch(
                  setPostAndRowUuid({
                    postRowUuid: postRow.postRowUuid,
                    postUuid: post.postUuid,
                  })
                );
                navigate(`${SINGPLE_POST_ROUTE}`);
              }}
              onClickCapture={(event) => {
                if (postContentMouseDownTotalX.current > 50) {
                  console.log("Preventing default");
                  event.preventDefault();
                  event.stopPropagation();
                }
              }}
              onMouseEnter={(event) => {
                event.preventDefault();
                event.stopPropagation();
                stopPostCardTransition(post, event);
              }}
            >
              <div className="postCardHeader">
                <p className="postCardHeaderText">{`${
                  post.subreddit.displayName
                }${post.attachments.length > 1 ? " (Gallery)" : ""}`}</p>
                {post.subreddit.fromList.length > 0 && (
                  <p className="postCardHeaderText">{`From List: ${post.subreddit.fromList}`}</p>
                )}
                <p className="postCardHeaderText">
                  {new Date(post.created * 1000).toLocaleDateString("en-us", {
                    month: "long",
                    day: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                {!post.subreddit.displayName.startsWith("u_") && (
                  <p className="postCardHeaderText">{`Subscribers: ${post.subreddit.subscribers.toLocaleString()}`}</p>
                )}
                <p className="postCardHeaderText">{post.randomSourceString}</p>
              </div>
              <div className="post-card-content">
                <PostMediaElement
                  postRowUuid={postRow.postRowUuid}
                  post={post}
                />
              </div>
            </div>
          </div>
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

export default PostRowView;
