import {
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Post } from "../model/Post/Post.ts";
import { AppConfigStateContext } from "../context/app-config-context.ts";
import { AutoScrollPostRowDirectionOptionEnum } from "../model/config/enums/AutoScrollPostRowDirectionOptionEnum.ts";
import { v4 as uuidV4 } from "uuid";
import { MOVE_POST_ROW_SESSION_STORAGE_KEY_SUFFIX } from "../RedditWatcherConstants.ts";

type MovePostRowStateSessionStorage = {
  postsToShowUuids: Array<PostsToShowUuidsObj>;
  scrollLeft: number;
};
type PostsToShowUuidsObj = {
  postUuid: string;
  uiUuid: string;
};
export default function useMovePostRow(
  postRowUuid: string,
  masterPosts: Array<Post>,
  postRowContentDivRef: RefObject<HTMLDivElement>,
  shouldAutoScroll: boolean,
  postCardWidthPercentage: number,
  postsToShowInRow: number
) {
  const POST_ROW_STATE_SESSION_STORAGE_KEY = `${postRowUuid}${MOVE_POST_ROW_SESSION_STORAGE_KEY_SUFFIX}`;

  const autoScrollPostRowRateSecondsForSinglePostCard = useContext(
    AppConfigStateContext
  ).autoScrollPostRowRateSecondsForSinglePostCard;
  const autoScrollPostRowDirectionOption = useContext(
    AppConfigStateContext
  ).autoScrollPostRowDirectionOption;
  const [postsToShowUuids, setPostsToShowUuids] = useState<
    Array<PostsToShowUuidsObj>
  >([]);
  const lastPostRowScrollLeft = useRef<number>(0);
  const autoScrollInterval = useRef<NodeJS.Timeout>();
  const mouseDownOrTouchOnPostRow = useRef<boolean>(false);
  const lastMouseDownOrTouchX = useRef<number>(0);

  const updatePostsToShowAndScrollLeft = useCallback(
    (
      postRowContentDiv: HTMLDivElement,
      postsToShowUuids: Array<PostsToShowUuidsObj>,
      scrollLeft: number
    ) => {
      setPostsToShowUuids(postsToShowUuids);
      setTimeout(() => postRowContentDiv.scrollTo({ left: scrollLeft }), 0);
      const sessionStorageState: MovePostRowStateSessionStorage = {
        postsToShowUuids: postsToShowUuids,
        scrollLeft: scrollLeft,
      };
      sessionStorage.setItem(
        POST_ROW_STATE_SESSION_STORAGE_KEY,
        JSON.stringify(sessionStorageState)
      );
    },
    [POST_ROW_STATE_SESSION_STORAGE_KEY]
  );

  useLayoutEffect(() => {
    const postRowContentDiv = postRowContentDivRef.current;
    if (postRowContentDiv === null || postCardWidthPercentage === 0) {
      return;
    }

    const sessionStorageStateString = sessionStorage.getItem(
      POST_ROW_STATE_SESSION_STORAGE_KEY
    );

    let sessionStorageObj: MovePostRowStateSessionStorage | undefined;

    const postsToShowUuidsToSet = new Array<PostsToShowUuidsObj>();

    try {
      if (
        sessionStorageStateString !== null &&
        sessionStorageStateString !== ""
      ) {
        sessionStorageObj = JSON.parse(sessionStorageStateString);
      }
    } finally {
      if (sessionStorageObj !== undefined) {
        postsToShowUuidsToSet.push(...sessionStorageObj.postsToShowUuids);
      } else {
        if (masterPosts.length <= postsToShowInRow) {
          const mappedPostsToShowUuids: Array<PostsToShowUuidsObj> =
            masterPosts.map((post) => ({
              uiUuid: `${uuidV4()}:${post.postUuid}`,
              postUuid: post.postUuid,
            }));
          postsToShowUuidsToSet.push(...mappedPostsToShowUuids);
          sessionStorageObj = {
            postsToShowUuids: mappedPostsToShowUuids,
            scrollLeft: 0,
          };
        } else {
          const postRowContentDivWidth = postRowContentDiv.clientWidth;
          const cardWidthPx =
            postRowContentDivWidth * (postCardWidthPercentage / 100);

          const lastPost = masterPosts[masterPosts.length - 1];
          postsToShowUuidsToSet.push({
            postUuid: lastPost.postUuid,
            uiUuid: `${uuidV4()}:${lastPost.postUuid}`,
          });
          const postUuidsToPush = masterPosts
            .slice(0, postsToShowInRow + 1)
            .map<PostsToShowUuidsObj>((post) => ({
              postUuid: post.postUuid,
              uiUuid: `${uuidV4()}:${post.postUuid}`,
            }));
          postsToShowUuidsToSet.push(...postUuidsToPush);
          sessionStorageObj = {
            postsToShowUuids: postsToShowUuidsToSet,
            scrollLeft: cardWidthPx,
          };
        }
      }

      updatePostsToShowAndScrollLeft(
        postRowContentDiv,
        postsToShowUuidsToSet,
        sessionStorageObj.scrollLeft
      );
    }
  }, [
    POST_ROW_STATE_SESSION_STORAGE_KEY,
    masterPosts,
    postCardWidthPercentage,
    postRowContentDivRef,
    postsToShowInRow,
    updatePostsToShowAndScrollLeft,
  ]);

  const createAutoScrollInterval = useCallback(() => {
    const postRowContentDiv = postRowContentDivRef.current;
    if (postRowContentDiv === null || !shouldAutoScroll) {
      return;
    }
    const scrollPxPerStep = 1;
    const postCardWidthPx =
      postRowContentDiv.getBoundingClientRect().width *
      (postCardWidthPercentage / 100);
    const steps = postCardWidthPx / scrollPxPerStep;
    const intervalMs =
      (autoScrollPostRowRateSecondsForSinglePostCard * 1000) / steps;

    autoScrollInterval.current = setInterval(() => {
      if (
        autoScrollPostRowDirectionOption ===
        AutoScrollPostRowDirectionOptionEnum.Left
      ) {
        postRowContentDiv.scroll({
          left: postRowContentDiv.scrollLeft + scrollPxPerStep,
        });
      } else if (
        autoScrollPostRowDirectionOption ===
        AutoScrollPostRowDirectionOptionEnum.Right
      ) {
        postRowContentDiv.scroll({
          left: postRowContentDiv.scrollLeft - scrollPxPerStep,
        });
      }
    }, intervalMs);
  }, [
    autoScrollPostRowDirectionOption,
    autoScrollPostRowRateSecondsForSinglePostCard,
    postCardWidthPercentage,
    postRowContentDivRef,
    shouldAutoScroll,
  ]);

  const clearAutoScrollInterval = useCallback(() => {
    if (autoScrollInterval.current !== null) {
      clearInterval(autoScrollInterval.current);
    }
  }, []);

  useEffect(() => {
    createAutoScrollInterval();
    return () => {
      clearAutoScrollInterval();
    };
  }, [
    autoScrollPostRowRateSecondsForSinglePostCard,
    clearAutoScrollInterval,
    createAutoScrollInterval,
    postCardWidthPercentage,
  ]);

  const onPostRowContentScroll = useCallback(() => {
    const postRowContentDiv = postRowContentDivRef.current;
    if (
      postRowContentDiv === null ||
      postsToShowUuids.length === 0 ||
      postsToShowUuids.length <= postsToShowInRow
    ) {
      return;
    }

    const postRowContentDivScrollLeft = postRowContentDiv.scrollLeft;
    let updatedScrollLeft = postRowContentDivScrollLeft;

    const postRowContentDivWidth = postRowContentDiv.clientWidth;
    const postCardWidthPx =
      postRowContentDivWidth * (postCardWidthPercentage / 100);
    const postRowContentDivScrollWidth = postRowContentDiv.scrollWidth;

    const updatedPostsToShowUuids = [...postsToShowUuids];

    if (postRowContentDivScrollLeft > lastPostRowScrollLeft.current) {
      if (
        postRowContentDivScrollLeft + postRowContentDivWidth >=
        postRowContentDivScrollWidth
      ) {
        const lastPostBeingShownUuidObj =
          postsToShowUuids[postsToShowUuids.length - 1];
        const lastPostBeingShownIndexInMaster = masterPosts.findIndex(
          (post) => post.postUuid === lastPostBeingShownUuidObj.postUuid
        );
        if (lastPostBeingShownIndexInMaster === -1) {
          return;
        }
        const masterIndexToInsert =
          lastPostBeingShownIndexInMaster === masterPosts.length - 1
            ? 0
            : lastPostBeingShownIndexInMaster + 1;
        const masterPostToInsert = masterPosts[masterIndexToInsert];
        const uuidObjToInsert = {
          postUuid: masterPostToInsert.postUuid,
          uiUuid: `${uuidV4()}:${masterPostToInsert.postUuid}`,
        };
        updatedPostsToShowUuids.push(uuidObjToInsert);
      }
      if (postRowContentDivScrollLeft > postCardWidthPx) {
        updatedPostsToShowUuids.shift();
        updatedScrollLeft = postRowContentDivScrollLeft - postCardWidthPx;
      }
    } else if (postRowContentDivScrollLeft < lastPostRowScrollLeft.current) {
      if (postRowContentDivScrollLeft === 0) {
        const firstPostShowingUuidObj = postsToShowUuids[0];
        const indexInMaster = masterPosts.findIndex(
          (post) => post.postUuid === firstPostShowingUuidObj.postUuid
        );
        if (indexInMaster === -1) {
          return;
        }
        const postToInsert =
          masterPosts[
            indexInMaster === 0 ? masterPosts.length - 1 : indexInMaster - 1
          ];

        updatedPostsToShowUuids.unshift({
          postUuid: postToInsert.postUuid,
          uiUuid: `${uuidV4()}:${postToInsert.postUuid}`,
        });
        updatedScrollLeft = postCardWidthPx;
      }
      if (
        Math.abs(
          postRowContentDivScrollLeft +
            postRowContentDivWidth -
            postRowContentDivScrollWidth
        ) > postCardWidthPx
      ) {
        updatedPostsToShowUuids.pop();
      }
    }

    updatePostsToShowAndScrollLeft(
      postRowContentDiv,
      updatedPostsToShowUuids,
      updatedScrollLeft
    );

    lastPostRowScrollLeft.current = updatedScrollLeft;
  }, [
    masterPosts,
    postCardWidthPercentage,
    postRowContentDivRef,
    postsToShowInRow,
    postsToShowUuids,
    updatePostsToShowAndScrollLeft,
  ]);

  const movePostRow = useCallback(
    (updatedX: number) => {
      if (!mouseDownOrTouchOnPostRow.current) {
        return;
      }
      const postRowContentDiv = postRowContentDivRef.current;
      if (postRowContentDiv !== null) {
        const deltaX = lastMouseDownOrTouchX.current - updatedX;
        postRowContentDiv.scrollBy({ left: deltaX });
        lastMouseDownOrTouchX.current = updatedX;
      }
    },
    [postRowContentDivRef]
  );

  useEffect(() => {
    const postRowContentDiv = postRowContentDivRef.current;
    if (postRowContentDiv === null) {
      return;
    }

    const mouseEnter = () => {
      clearAutoScrollInterval();
    };
    const mouseLeave = () => {
      mouseDownOrTouchOnPostRow.current = false;
      clearAutoScrollInterval();
      createAutoScrollInterval();
    };
    const mouseDownTouchStart = (event: MouseEvent | TouchEvent) => {
      mouseDownOrTouchOnPostRow.current = true;
      clearAutoScrollInterval();
      if (event instanceof MouseEvent) {
        lastMouseDownOrTouchX.current = event.clientX;
      } else if (event instanceof TouchEvent) {
        const touches = event.touches;
        if (touches.length == 1) {
          lastMouseDownOrTouchX.current = touches[0].clientX;
        } else if (touches.length == 2) {
          const touch1 = touches[0];
          const touch2 = touches[1];
          lastMouseDownOrTouchX.current = (touch1.clientX + touch2.clientX) / 2;
        }
      }
    };
    const mouseUpTouchEnd = (event: MouseEvent | TouchEvent) => {
      if (event instanceof MouseEvent) {
        mouseDownOrTouchOnPostRow.current = false;
        lastMouseDownOrTouchX.current = 0;
        clearAutoScrollInterval();
      } else if (event instanceof TouchEvent) {
        const touches = event.touches;
        if (touches.length === 0) {
          mouseDownOrTouchOnPostRow.current = false;
          lastMouseDownOrTouchX.current = 0;
          clearAutoScrollInterval();
          createAutoScrollInterval();
        } else if (touches.length === 1) {
          mouseDownOrTouchOnPostRow.current = true;
          lastMouseDownOrTouchX.current = touches[0].clientX;
        } else if (touches.length == 2) {
          mouseDownOrTouchOnPostRow.current = true;
          const touch1 = touches[0];
          const touch2 = touches[1];
          lastMouseDownOrTouchX.current = (touch1.clientX + touch2.clientX) / 2;
        }
      }
    };

    const mouseMoveTouchMove = (event: MouseEvent | TouchEvent) => {
      if (event instanceof MouseEvent) {
        movePostRow(event.clientX);
      } else if (event instanceof TouchEvent) {
        const touches = event.touches;
        if (touches.length === 1) {
          movePostRow(touches[0].clientX);
        } else if (touches.length === 2) {
          const touch1 = touches[0];
          const touch2 = touches[1];
          movePostRow((touch1.clientX + touch2.clientX) / 2);
        }
      }
    };

    postRowContentDiv.addEventListener("scroll", onPostRowContentScroll);
    postRowContentDiv.addEventListener("mouseenter", mouseEnter);
    postRowContentDiv.addEventListener("mouseleave", mouseLeave);
    postRowContentDiv.addEventListener("mousedown", mouseDownTouchStart);
    postRowContentDiv.addEventListener("touchstart", mouseDownTouchStart);
    postRowContentDiv.addEventListener("mouseup", mouseUpTouchEnd);
    postRowContentDiv.addEventListener("touchend", mouseUpTouchEnd);
    postRowContentDiv.addEventListener("mousemove", mouseMoveTouchMove);
    postRowContentDiv.addEventListener("touchmove", mouseMoveTouchMove);
    return () => {
      postRowContentDiv.removeEventListener("scroll", onPostRowContentScroll);
      postRowContentDiv.removeEventListener("mouseenter", mouseEnter);
      postRowContentDiv.removeEventListener("mouseleave", mouseLeave);
      postRowContentDiv.removeEventListener("mousedown", mouseDownTouchStart);
      postRowContentDiv.removeEventListener("touchstart", mouseDownTouchStart);
      postRowContentDiv.removeEventListener("mouseup", mouseUpTouchEnd);
      postRowContentDiv.removeEventListener("touchend", mouseUpTouchEnd);
      postRowContentDiv.removeEventListener("mousemove", mouseMoveTouchMove);
      postRowContentDiv.removeEventListener("touchmove", mouseMoveTouchMove);
    };
  }, [
    clearAutoScrollInterval,
    createAutoScrollInterval,
    movePostRow,
    onPostRowContentScroll,
    postRowContentDivRef,
  ]);

  return postsToShowUuids;
}
