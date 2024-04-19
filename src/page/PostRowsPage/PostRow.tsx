import { PostRow } from "../../model/PostRow.ts";
import { useAppDispatch, useAppSelector } from "../../redux/store.ts";
import getPlatform from "../../util/PlatformUtil.ts";
import { Platform } from "../../model/Platform.ts";
import { FC, useCallback, useContext, useEffect, useRef } from "react";
import PostCard from "./PostCard.tsx";
import { AutoScrollPostRowDirectionOptionEnum } from "../../model/config/enums/AutoScrollPostRowDirectionOptionEnum.ts";
import UserFrontPagePostSortOrderOptionsEnum from "../../model/config/enums/UserFrontPagePostSortOrderOptionsEnum.ts";
import { AutoScrollPostRowOptionEnum } from "../../model/config/enums/AutoScrollPostRowOptionEnum.ts";
import { PostCardContext } from "../../context/post-card-context.ts";
import usePostRows from "../../hook/use-post-rows.ts";
import { AutoScrollPostRowRateMsContext } from "./PostRowPage.tsx";

type Props = { postRow: PostRow };
const PostRow: FC<Props> = ({ postRow }) => {
  const dispatch = useAppDispatch();
  const postRowsHook = usePostRows();
  const darkMode = useAppSelector((state) => state.appConfig.darkMode);
  const postsToShowInRow = useAppSelector(
    (state) => state.appConfig.postsToShowInRow
  );
  const autoScrollPostRowOption = useAppSelector(
    (state) => state.appConfig.autoScrollPostRowOption
  );
  const autoScrollPostRowDirectionOption = useAppSelector(
    (state) => state.appConfig.autoScrollPostRowDirectionOption
  );
  const autoScrollPostRowRateMs = useContext(AutoScrollPostRowRateMsContext);

  const postRowDivRef = useRef(null);
  const postRowContentDivRef = useRef(null);

  const mouseWheelPostScrollModifierPressed = useRef(false);
  const mouseOrTouchOnPostCard = useRef(false);
  const lastMovementX = useRef(0);
  const totalMovementX = useRef(0);

  const createAutoScrollIntervalDelay = useRef<NodeJS.Timeout | undefined>(
    undefined
  );
  const autoScrollInterval = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleMouseOrTouchStart = useCallback((clientX: number) => {
    mouseOrTouchOnPostCard.current = true;
    lastMovementX.current = clientX;
    totalMovementX.current = 0;
  }, []);

  const handleMouseOrTouchEnd = useCallback(() => {
    mouseOrTouchOnPostCard.current = false;
    lastMovementX.current = 0;
  }, []);

  const handlePostRowMove = useCallback(
    (clientX: number, mouseOrTouchOnPostCard: boolean) => {
      if (!mouseOrTouchOnPostCard || postRow.posts.length <= postsToShowInRow) {
        return;
      }
      const movement = clientX - lastMovementX.current;
      totalMovementX.current += Math.abs(movement);
      postRowsHook.moveUiPosts(postRow.postRowUuid, movement);
      lastMovementX.current = clientX;
    },
    [dispatch, postRow.postRowUuid, postRow.posts.length, postsToShowInRow]
  );

  const createAutoScrollInterval = useCallback(
    (snapToPost = true) => {
      if (createAutoScrollIntervalDelay.current != undefined) {
        clearTimeout(createAutoScrollIntervalDelay.current);
        createAutoScrollIntervalDelay.current = undefined;
      }
      if (autoScrollInterval.current != undefined) {
        clearInterval(autoScrollInterval.current);
        autoScrollInterval.current = undefined;
      }
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
          postRowsHook.postRowScrollLeftPressed(
            postRow.postRowUuid,
            snapToPost
          );
        } else if (
          autoScrollPostRowDirectionOption ==
          AutoScrollPostRowDirectionOptionEnum.Right
        ) {
          postRowsHook.postRowScrollRightPressed(
            postRow.postRowUuid,
            snapToPost
          );
        }
      };
      createAutoScrollIntervalDelay.current = setTimeout(() => {
        dispatchMostRowScroll();
        autoScrollInterval.current = setInterval(() => {
          dispatchMostRowScroll();
        }, autoScrollPostRowRateMs);
      }, 1000);
    },
    [
      autoScrollPostRowDirectionOption,
      autoScrollPostRowOption,
      dispatch,
      postRow.postRowUuid,
      postRow.posts.length,
      postRow.userFrontPagePostSortOrderOptionAtRowCreation,
      postsToShowInRow,
      autoScrollPostRowRateMs,
    ]
  );

  useEffect(() => {
    createAutoScrollInterval(false);
    return () => {
      if (createAutoScrollIntervalDelay.current != undefined) {
        clearTimeout(createAutoScrollIntervalDelay.current);
        createAutoScrollIntervalDelay.current = undefined;
      }
      if (autoScrollInterval.current != undefined) {
        clearTimeout(autoScrollInterval.current);
        autoScrollInterval.current = undefined;
      }
    };
  }, [createAutoScrollInterval]);

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
    postRowsHook.moveUiPosts(
      postRow.postRowUuid,
      currentFirstVisibleUiPostLeftPx - firstVisibleUiPostTargetPx
    );
  }, [dispatch, postRow.postRowUuid, postRow.uiPosts]);

  const handlePostRowMouseEnter = useCallback(() => {
    const div = postRowDivRef.current as unknown as HTMLDivElement;
    div.tabIndex = 1;
    div.focus();

    postRowsHook.mouseEnterPostRow(postRow.postRowUuid);
    if (createAutoScrollIntervalDelay.current != undefined) {
      clearTimeout(createAutoScrollIntervalDelay.current);
      createAutoScrollIntervalDelay.current = undefined;
    }
    if (autoScrollInterval.current != undefined) {
      clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = undefined;
    }
    handleStopPostTransitions();
  }, [dispatch, handleStopPostTransitions, postRow.postRowUuid]);

  const handlePostRowMouseLeave = useCallback(
    (snapToPost = true) => {
      const div = postRowDivRef.current as unknown as HTMLDivElement;
      div.tabIndex = -1;

      postRowsHook.mouseLeavePostRow(postRow.postRowUuid);
      createAutoScrollInterval(snapToPost);
    },
    [createAutoScrollInterval, dispatch, postRow.postRowUuid]
  );

  const hideScrollButtonDivs = useCallback(() => {
    return getPlatform() == Platform.Android || getPlatform() == Platform.Ios;
  }, []);

  return (
    <div
      className="postRow"
      ref={postRowDivRef}
      onMouseEnter={() => handlePostRowMouseEnter()}
      onTouchStart={() => handlePostRowMouseEnter()}
      onMouseLeave={() => handlePostRowMouseLeave(false)}
      onTouchEnd={() => handlePostRowMouseLeave(false)}
      onKeyDown={(event) => {
        mouseWheelPostScrollModifierPressed.current = event.shiftKey;
      }}
      onKeyUp={() => (mouseWheelPostScrollModifierPressed.current = false)}
      onWheel={(event) => {
        if (mouseWheelPostScrollModifierPressed.current) {
          handlePostRowMove(event.deltaY, true);
          lastMovementX.current = 0;
        }
      }}
    >
      <div
        hidden={hideScrollButtonDivs()}
        className="postRowScrollButton leftPostRowScrollButton"
        onClick={() =>
          postRowsHook.postRowScrollLeftPressed(postRow.postRowUuid)
        }
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
        />
      </div>
      <div
        className="postRowContent"
        ref={postRowContentDivRef}
        onMouseDown={(event) => handleMouseOrTouchStart(event.clientX)}
        onTouchStart={(event) =>
          handleMouseOrTouchStart(event.touches[0].clientX)
        }
        onMouseMove={(event) =>
          handlePostRowMove(event.clientX, mouseOrTouchOnPostCard.current)
        }
        onTouchMove={(event) =>
          handlePostRowMove(
            event.touches[0].clientX,
            mouseOrTouchOnPostCard.current
          )
        }
        onMouseUp={() => handleMouseOrTouchEnd()}
        onTouchEnd={() => handleMouseOrTouchEnd()}
        onMouseLeave={() => handleMouseOrTouchEnd()}
      >
        {postRow.uiPosts.map((uiPost) => (
          <PostCardContext.Provider
            value={{
              uiPost: uiPost,
              postRowUuid: postRow.postRowUuid,
              userFrontPagePostSortOrderOptionAtRowCreation:
                postRow.userFrontPagePostSortOrderOptionAtRowCreation,
              mouseOverPostRow: postRow.mouseOverPostRow,
              totalMovementX: totalMovementX,
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
        onClick={() =>
          postRowsHook.postRowScrollRightPressed(postRow.postRowUuid)
        }
      >
        <img
          alt={""}
          src={
            darkMode
              ? "assets/right_chevron_dark_mode.png"
              : "assets/right_chevron_light_mode.png"
          }
          className="postRowScrollImg"
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
