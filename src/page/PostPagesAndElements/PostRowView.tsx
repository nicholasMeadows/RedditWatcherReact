import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PostContextMenuEvent from "../../model/Events/PostContextMenuEvent";
import { PostRow } from "../../model/PostRow";
import { setPostContextMenuEvent } from "../../redux/slice/ContextMenuSlice";
import {
  mouseEnterPostRow,
  mouseLeavePostRow,
  movePostRow,
  stopSmoothPostTransition,
} from "../../redux/slice/PostRowsSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import PostMediaElement from "./PostMediaElement.tsx";
import getPlatform from "../../util/PlatformUtil.ts";
import { Platform } from "../../model/Platform.ts";
import { SINGPLE_POST_ROUTE } from "../../RedditWatcherConstants.ts";
import { setPostAndRowUuid } from "../../redux/slice/SinglePostPageSlice.ts";
import UserFrontPagePostSortOrderOptionsEnum from "../../model/config/enums/UserFrontPagePostSortOrderOptionsEnum.ts";
import { AutoScrollPostRowOptionEnum } from "../../model/config/enums/AutoScrollPostRowOptionEnum.ts";

type Props = { postRow: PostRow };
const PostRowView: React.FC<Props> = ({ postRow }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const darkMode = useAppSelector((state) => state.appConfig.darkMode);
  const postCardWidth = useAppSelector((state) => state.postRows.postCardWidth);
  const postRowContentWidth = useAppSelector(
    (state) => state.postRows.postRowContentWidth
  );

  const postRowContentDiv = useRef(null);

  const postsToShowInRow = useAppSelector(
    (state) => state.appConfig.postsToShowInRow
  );
  const autoScrollPostRowOption = useAppSelector(
    (state) => state.appConfig.autoScrollPostRowOption
  );

  const userFrontPageSortOption = useAppSelector(
    (state) => state.appConfig.userFrontPagePostSortOrderOption
  );

  const [postCardTransition, setPostCardTransition] = useState(true);

  const postContentMouseDownLastX = useRef(0);
  const postContentMouseDownTotalX = useRef(0);
  const postContentMouseDown = useRef(false);
  const autoScrollInterval = useRef<NodeJS.Timeout>();
  const mouseWheelPostRowScrollKeyDown = useRef(false);

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
      if (postContentMouseDown) {
        const diff = clientX - postContentMouseDownLastX.current;
        postContentMouseDownTotalX.current += Math.abs(diff);
        if (postRow.posts.length <= postsToShowInRow) {
          return;
        }
        dispatch(
          movePostRow({
            postRowUuid: postRow.postRowUuid,
            movementDiff: diff,
            postsToShowInRow: postsToShowInRow,
          })
        );
        postContentMouseDownLastX.current = clientX;
      }
    },
    [dispatch, postRow.postRowUuid, postRow.posts.length, postsToShowInRow]
  );

  const handleMovePostRowLeftButtonClick = useCallback(() => {
    const scaledPostCardWidth =
      postCardWidth *
      (postRow.postRowContentWidthAtCreation / postRowContentWidth);

    let firstVisiblePostLeftPx: number | undefined;
    for (const uiPost of postRow.uiPosts) {
      firstVisiblePostLeftPx = uiPost.left;
      if (firstVisiblePostLeftPx + scaledPostCardWidth > 0) {
        break;
      }
    }
    if (firstVisiblePostLeftPx == undefined) {
      return;
    }
    dispatch(
      movePostRow({
        postRowUuid: postRow.postRowUuid,
        postsToShowInRow: postsToShowInRow,
        movementDiff: -(firstVisiblePostLeftPx + postCardWidth),
      })
    );
  }, [
    dispatch,
    postCardWidth,
    postRow.postRowContentWidthAtCreation,
    postRow.postRowUuid,
    postRow.uiPosts,
    postRowContentWidth,
    postsToShowInRow,
  ]);

  const handleMovePostRowRightButtonClick = useCallback(
    (shiftToClosesPostCard: boolean = true) => {
      const scaledPostCardWidth =
        postCardWidth *
        (postRow.postRowContentWidthAtCreation / postRowContentWidth);

      let movementDiff = scaledPostCardWidth;
      if (shiftToClosesPostCard) {
        let firstVisiblePostLeftPx: number | undefined;
        for (const uiPost of postRow.uiPosts) {
          firstVisiblePostLeftPx = uiPost.left;
          if (firstVisiblePostLeftPx + scaledPostCardWidth >= 0) {
            break;
          }
        }
        if (firstVisiblePostLeftPx == undefined) {
          return;
        }
        movementDiff = firstVisiblePostLeftPx * -1;
      }
      dispatch(
        movePostRow({
          postRowUuid: postRow.postRowUuid,
          postsToShowInRow: postsToShowInRow,
          movementDiff: movementDiff,
        })
      );
    },
    [
      dispatch,
      postCardWidth,
      postRow.postRowContentWidthAtCreation,
      postRow.postRowUuid,
      postRow.uiPosts,
      postRowContentWidth,
      postsToShowInRow,
    ]
  );

  const createAutoScrollInterval = useCallback(
    (initialShiftToClosestPostCard: boolean = true) => {
      if (autoScrollInterval.current != undefined) {
        clearInterval(autoScrollInterval.current);
        autoScrollInterval.current = undefined;
      }
      if (autoScrollPostRowOption == AutoScrollPostRowOptionEnum.Off) {
        return;
      }
      if (postRow.posts.length > postsToShowInRow) {
        handleMovePostRowRightButtonClick(initialShiftToClosestPostCard);
        autoScrollInterval.current = setInterval(() => {
          if (
            userFrontPageSortOption ==
            UserFrontPagePostSortOrderOptionsEnum.NotSelected
          ) {
            handleMovePostRowRightButtonClick();
          }
        }, 6000);
      }
    },
    [
      autoScrollPostRowOption,
      handleMovePostRowRightButtonClick,
      postRow.posts.length,
      postsToShowInRow,
      userFrontPageSortOption,
    ]
  );

  const createIntervalTimeout = useRef<NodeJS.Timeout | undefined>();
  useEffect(() => {
    if (createIntervalTimeout.current != undefined) {
      clearTimeout(createIntervalTimeout.current);
      createIntervalTimeout.current = undefined;
    }
    createIntervalTimeout.current = setTimeout(() => {
      createAutoScrollInterval();
    }, 100);
    return () => {
      if (autoScrollInterval != undefined) {
        clearInterval(autoScrollInterval.current);
      }
    };
  }, []);

  const resumeSmoothPostRowScrollingAfterMouseUpTimeout =
    useRef<NodeJS.Timeout>();
  const handlePostRowMouseEnter = useCallback(() => {
    setPostCardTransition(false);

    if (resumeSmoothPostRowScrollingAfterMouseUpTimeout.current != undefined) {
      clearTimeout(resumeSmoothPostRowScrollingAfterMouseUpTimeout.current);
      resumeSmoothPostRowScrollingAfterMouseUpTimeout.current = undefined;
    }

    if (autoScrollInterval.current != undefined) {
      clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = undefined;
    }

    dispatch(mouseEnterPostRow(postRow.postRowUuid));

    const postCardRowContentDiv =
      postRowContentDiv.current as unknown as HTMLDivElement;
    const secondPostCard = postCardRowContentDiv.children.item(1);
    if (secondPostCard != undefined) {
      dispatch(
        stopSmoothPostTransition({
          postRowUuid: postRow.postRowUuid,
          secondPostCardPxLeft:
            secondPostCard.getBoundingClientRect().left - 50,
        })
      );
    }
  }, [dispatch, postRow.postRowUuid]);

  const handlePostRowMouseLeave = useCallback(() => {
    setPostCardTransition(true);

    if (resumeSmoothPostRowScrollingAfterMouseUpTimeout.current != undefined) {
      clearTimeout(resumeSmoothPostRowScrollingAfterMouseUpTimeout.current);
      resumeSmoothPostRowScrollingAfterMouseUpTimeout.current = undefined;
    }

    resumeSmoothPostRowScrollingAfterMouseUpTimeout.current = setTimeout(() => {
      createAutoScrollInterval(false);
    }, 1000);
    dispatch(mouseLeavePostRow());
  }, [createAutoScrollInterval, dispatch]);

  const postsToShowInRowHandlePostRowMouseTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleEffect = () => {
      handlePostRowMouseEnter();
      setTimeout(() => {
        handlePostRowMouseLeave();
      }, 100);
    };

    if (postsToShowInRowHandlePostRowMouseTimeout.current != undefined) {
      clearTimeout(postsToShowInRowHandlePostRowMouseTimeout.current);
      postsToShowInRowHandlePostRowMouseTimeout.current = undefined;
    }
    postsToShowInRowHandlePostRowMouseTimeout.current = setTimeout(() => {
      handleEffect();
    }, 100);
  }, [postsToShowInRow]);
  return (
    <div
      className="postRow"
      onMouseEnter={() => handlePostRowMouseEnter()}
      onMouseLeave={() => handlePostRowMouseLeave()}
      onTouchStart={() => handlePostRowMouseEnter()}
      onTouchEnd={() => handlePostRowMouseLeave()}
      onMouseMove={() => {
        if (autoScrollInterval.current != undefined) {
          clearInterval(autoScrollInterval.current);
          autoScrollInterval.current = undefined;
        }
      }}
    >
      <div
        hidden={
          getPlatform() == Platform.Android || getPlatform() == Platform.Ios
        }
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
        ref={postRowContentDiv}
        onMouseLeave={(event) => {
          const div = event.target as HTMLDivElement;
          div.tabIndex = -1;
          if (postContentMouseDown.current) {
            handleMouseUpTouchEnd();
          }
        }}
        onMouseEnter={() => {
          const div = postRowContentDiv.current as unknown as HTMLDivElement;
          div.tabIndex = 0;
          div.focus();
        }}
        onKeyDown={(event) => {
          mouseWheelPostRowScrollKeyDown.current = event.shiftKey;
        }}
        onKeyUp={() => {
          mouseWheelPostRowScrollKeyDown.current = false;
        }}
        onWheel={(event) => {
          if (
            mouseWheelPostRowScrollKeyDown.current &&
            postRow.posts.length > postsToShowInRow
          ) {
            event.stopPropagation();
            event.preventDefault();

            let movementDiff = -10;
            if (event.deltaY < 0) {
              movementDiff = movementDiff * -1;
            }
            dispatch(
              movePostRow({
                postRowUuid: postRow.postRowUuid,
                movementDiff: movementDiff,
                postsToShowInRow: postsToShowInRow,
              })
            );
          }
        }}
      >
        {postRow.uiPosts.map((post) => (
          <div
            key={post.uiUuid}
            className={`post-card`}
            style={{
              minWidth: `calc(${postCardWidth}px - 0.5em)`,
              maxWidth: `calc(${postCardWidth}px - 0.5em)`,
              left: `${
                ((post.left *
                  (postRowContentWidth /
                    postRow.postRowContentWidthAtCreation)) /
                  postRowContentWidth) *
                100
              }%`,

              transition: `${
                postCardTransition &&
                autoScrollPostRowOption ==
                  AutoScrollPostRowOptionEnum.SmoothContinuousScroll &&
                userFrontPageSortOption !=
                  UserFrontPagePostSortOrderOptionsEnum.New
                  ? "left 6000ms linear"
                  : "none"
              }`,
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
              handleMouseTouchMove(event.clientX, postContentMouseDown.current);
            }}
            onClickCapture={(event) => {
              if (postContentMouseDownTotalX.current > 50) {
                console.log("Preventing default");
                event.preventDefault();
                event.stopPropagation();
              }
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
              <PostMediaElement postRowUuid={postRow.postRowUuid} post={post} />
            </div>
          </div>
        ))}
      </div>
      <div
        hidden={
          getPlatform() == Platform.Android || getPlatform() == Platform.Ios
        }
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
