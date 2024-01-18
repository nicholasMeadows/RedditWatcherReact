import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PostContextMenuEvent from "../../model/Events/PostContextMenuEvent";
import { PostRow } from "../../model/PostRow";
import { setPostContextMenuEvent } from "../../redux/slice/ContextMenuSlice";
import {
  mouseEnterPostRow,
  mouseLeavePostRow,
  postRowMouseDownMoved,
  setUiPosts,
} from "../../redux/slice/PostRowsSlice";
import store, { useAppDispatch, useAppSelector } from "../../redux/store";
import PostMediaElement from "./PostMediaElement.tsx";
import getPlatform from "../../util/PlatformUtil.ts";
import { Platform } from "../../model/Platform.ts";
import UserFrontPagePostSortOrderOptionsEnum from "../../model/config/enums/UserFrontPagePostSortOrderOptionsEnum.ts";
import { SINGPLE_POST_ROUTE } from "../../RedditWatcherConstants.ts";
import { setPostAndRowUuid } from "../../redux/slice/SinglePostPageSlice.ts";

type Props = { postRow: PostRow };
const PostRowView: React.FC<Props> = ({ postRow }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const postsToShowInRow = useAppSelector(
    (state) => state.appConfig.postsToShowInRow
  );
  const darkMode = useAppSelector((state) => state.appConfig.darkMode);
  const postRowContentDiv = useRef(null);

  const [postCardWidth, setPostCardWidth] = useState(1);
  const postContentMouseDownLastX = useRef(0);
  const postContentMouseDownTotalX = useRef(0);
  const postContentMouseDown = useRef(false);
  const autoScrollInterval = useRef<NodeJS.Timeout>();

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
          postRowMouseDownMoved({
            postRowUuid: postRow.postRowUuid,
            movementDiff: diff,
            postCardWidth: postCardWidth,
          })
        );
        postContentMouseDownLastX.current = clientX;
      }
    },
    [
      postCardWidth,
      dispatch,
      postRow.postRowUuid,
      postRow.posts.length,
      postsToShowInRow,
    ]
  );

  const createAutoScrollInterval = useCallback(() => {
    if (postRow.posts.length > postsToShowInRow) {
      autoScrollInterval.current = setInterval(() => {
        const userFrontPageSortOption =
          store.getState().appConfig.userFrontPagePostSortOrderOption;
        if (
          userFrontPageSortOption ==
          UserFrontPagePostSortOrderOptionsEnum.NotSelected
        ) {
          handleMouseTouchMove(postCardWidth, true);
          postContentMouseDownLastX.current = 0;
        }
      }, 6000);
    }
  }, [
    postCardWidth,
    postRow.posts.length,
    handleMouseTouchMove,
    postsToShowInRow,
  ]);

  useEffect(() => {
    dispatch(
      setUiPosts({
        postRowUuid: postRow.postRowUuid,
        postsToShowInRow: postsToShowInRow,
        postCardWidth: postCardWidth,
      })
    );
  }, [dispatch, postRow.postRowUuid, postsToShowInRow, postCardWidth]);

  useEffect(() => {
    createAutoScrollInterval();
    return () => clearInterval(autoScrollInterval.current);
  }, [createAutoScrollInterval]);

  useEffect(() => {
    const contentResizeObserver = new ResizeObserver(() => {
      const contentDiv = postRowContentDiv.current as unknown as HTMLDivElement;
      setPostCardWidth(contentDiv.clientWidth / postsToShowInRow);
    });
    const div = postRowContentDiv.current;
    if (div != undefined) {
      contentResizeObserver.observe(div);
    }
  }, [postsToShowInRow]);

  return (
    <div
      className="postRow"
      onMouseEnter={() => {
        if (
          getPlatform() == Platform.Electron ||
          getPlatform() == Platform.Web ||
          getPlatform() == Platform.Unknown
        ) {
          if (autoScrollInterval.current != undefined) {
            clearInterval(autoScrollInterval.current);
            autoScrollInterval.current = undefined;
          }

          dispatch(mouseEnterPostRow(postRow.postRowUuid));
        }
      }}
      onMouseLeave={() => {
        if (
          getPlatform() == Platform.Electron ||
          getPlatform() == Platform.Web ||
          getPlatform() == Platform.Unknown
        ) {
          createAutoScrollInterval();
          dispatch(mouseLeavePostRow());
        }
      }}
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
            let movementDiff = postCardWidth * -1;
            if (postRow.uiPostContentOffset < 0) {
              movementDiff = postRow.uiPostContentOffset * -1 - postCardWidth;
            } else if (postRow.uiPostContentOffset > 0) {
              movementDiff = postRow.uiPostContentOffset * -1;
            }

            dispatch(
              postRowMouseDownMoved({
                postRowUuid: postRow.postRowUuid,
                movementDiff: movementDiff,
                postCardWidth: postCardWidth,
              })
            );
          }}
        />
      </div>
      <div
        className="postRowContent"
        ref={postRowContentDiv}
        onMouseLeave={() => {
          if (postContentMouseDown.current) {
            handleMouseUpTouchEnd();
          }
        }}
      >
        {postRow.uiPosts.map((post, index) => (
          <div
            key={post.uiUuid}
            className="postCard"
            style={{
              minWidth: `calc((100% - (10px * ${postsToShowInRow} ) )/${postsToShowInRow})`,
              maxWidth: `calc((100% - (10px * ${postsToShowInRow} ) )/${postsToShowInRow})`,
              left: `${
                postCardWidth * (index - 1) + postRow.uiPostContentOffset
              }px`,
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
            let movementDiff = postCardWidth;
            if (postRow.uiPostContentOffset < 0) {
              movementDiff = postRow.uiPostContentOffset * -1;
            } else if (postRow.uiPostContentOffset > 0) {
              movementDiff = postCardWidth - postRow.uiPostContentOffset;
            }
            dispatch(
              postRowMouseDownMoved({
                postRowUuid: postRow.postRowUuid,
                movementDiff: movementDiff,
                postCardWidth: postCardWidth,
              })
            );
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
