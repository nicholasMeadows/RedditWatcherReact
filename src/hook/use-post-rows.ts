import { useContext } from "react";
import { PostRowsContext } from "../context/post-rows-context.ts";
import store from "../redux/store.ts";
import { Post, UiPost } from "../model/Post/Post.ts";
import UserFrontPagePostSortOrderOptionsEnum from "../model/config/enums/UserFrontPagePostSortOrderOptionsEnum.ts";
import { PostRow } from "../model/PostRow.ts";
import { v4 as uuidV4 } from "uuid";
import {
  MAX_POSTS_PER_ROW,
  POST_ROW_ROUTE,
} from "../RedditWatcherConstants.ts";
import { PostRowsState } from "../model/PostRowsState.ts";

export type UsePostRows = {
  setCurrentLocation: (path: string) => void;
  setScrollY: (scrollY: number) => void;
  toggleClickedOnPlayPauseButton: () => void;
  mouseLeavePostRow: (postRowUuid: string) => void;
  createPostRowAndInsertAtBeginning: (data: Array<Post>) => void;
  checkGetPostRowPausedConditions: () => void;
  postRowRemoveAt: (removeAt: number) => void;
  incrementPostAttachment: (postRowUuid: string, postUuid: string) => void;
  decrementPostAttachment: (postRowUuid: string, postUuid: string) => void;
  jumpToPostAttachment: (
    postRowUuid: string,
    postUuid: string,
    attachmentIndex: number
  ) => void;
  clearPostRows: () => void;
  addPostsToFrontOfRow: (
    postRowUuid: string,
    posts: Array<Post>,
    postsToShowInRow: number
  ) => void;
  setPostCardWidthPercentage: (
    postCardWidthPercentage: number,
    postsToShowInRow: number
  ) => void;
  setPostRowContentWidthPx: (postRowContentWidthPx: number) => void;
  mouseEnterPostRow: (postRowUuid: string) => void;
  moveUiPosts: (postRowUuid: string, movementPx: number) => void;
  postRowScrollRightPressed: (
    postRowUuid: string,
    snapToPostCard?: boolean | undefined
  ) => void;
  postRowScrollLeftPressed: (
    postRowUuid: string,
    snapToPostCard?: boolean | undefined
  ) => void;
  getPostRowsContextData: () => PostRowsState;
};

export default function usePostRows(): UsePostRows {
  const { postRowsContextData, setPostRowsContextData } =
    useContext(PostRowsContext);

  const createGetPostRowPausedTimeout = () => {
    return setTimeout(() => {
      checkGetPostRowPausedConditions();
    }, 2000);
  };

  const clearGetPostRowPausedTimeout = () => {
    if (postRowsContextData.getPostRowsPausedTimeout != undefined) {
      clearTimeout(postRowsContextData.getPostRowsPausedTimeout);
      postRowsContextData.getPostRowsPausedTimeout = undefined;
    }
  };
  const calcUiPostLeft = (
    uiPostIndex: number,
    postCardWidthPercentage: number
  ) => {
    return postCardWidthPercentage * uiPostIndex;
  };
  const createPostRow = (
    posts: Array<Post>,
    postsToShowInRow: number,
    postCardWidthPercentage: number,
    postRowContentWidth: number,
    userFrontPageSortOption: UserFrontPagePostSortOrderOptionsEnum
  ): PostRow => {
    const postRowUuid = uuidV4();
    const postRow: PostRow = {
      postRowUuid: postRowUuid,
      posts: posts,
      uiPosts: [],
      postRowContentWidthAtCreation: postRowContentWidth,
      userFrontPagePostSortOrderOptionAtRowCreation: userFrontPageSortOption,
      mouseOverPostRow: false,
    };

    if (
      postRow.posts.length > postsToShowInRow &&
      userFrontPageSortOption != UserFrontPagePostSortOrderOptionsEnum.New
    ) {
      const post = posts[posts.length - 1];
      postRow.uiPosts.push({
        ...post,
        uiUuid: post.postUuid + " " + uuidV4(),
        leftPercentage: -postCardWidthPercentage,
      });
    }

    let postsRunningIndex = 0;
    for (
      let index = 0;
      index < postsToShowInRow && index < postRow.posts.length;
      ++index
    ) {
      if (postsRunningIndex == posts.length) {
        postsRunningIndex = 0;
      }
      const post = posts[postsRunningIndex];
      postRow.uiPosts.push({
        ...post,
        uiUuid: post.postUuid + "" + uuidV4(),
        leftPercentage: calcUiPostLeft(index, postCardWidthPercentage),
      });
      postsRunningIndex++;
    }

    if (
      postRow.posts.length > postsToShowInRow &&
      userFrontPageSortOption != UserFrontPagePostSortOrderOptionsEnum.New
    ) {
      if (postsRunningIndex == posts.length) {
        postsRunningIndex = 0;
      }
      const postToPush = posts[postsRunningIndex];
      postRow.uiPosts.push({
        ...postToPush,
        uiUuid: postToPush.postUuid + "" + uuidV4(),
        leftPercentage: calcUiPostLeft(
          postRow.uiPosts.length - 1,
          postCardWidthPercentage
        ),
      });
    }
    return postRow;
  };

  const checkGetPostRowPausedConditions = () => {
    if (postRowsContextData.postRows.length == 0) {
      setPostRowsContextData((state) => ({
        ...state,
        getPostRowsPaused: false,
      }));
      return;
    }
    if (postRowsContextData.clickedOnPlayPauseButton) {
      setPostRowsContextData((state) => ({
        ...state,
        getPostRowsPaused: true,
      }));
      return;
    }

    const mouseOverPostRow = postRowsContextData.postRows.find(
      (postRow) => postRow.mouseOverPostRow
    );

    setPostRowsContextData((state) => {
      return {
        ...state,
        getPostRowsPaused:
          state.scrollY != 0 ||
          mouseOverPostRow != undefined ||
          state.currentPath != POST_ROW_ROUTE,
      };
    });
  };

  const handleMoveUiPosts = (
    // state: PostRowsState,
    postCardWidthPercentage: number,
    postRowContentWidthPx: number,
    postRow: PostRow,
    movementPx: number
  ) => {
    postRow.uiPosts = postRow.uiPosts.filter((post) => {
      if (
        post.leftPercentage + postCardWidthPercentage >
          -postCardWidthPercentage &&
        post.leftPercentage < 100 + postCardWidthPercentage
      ) {
        return post;
      }
    });

    const movementPercentage = (movementPx / postRowContentWidthPx) * 100;
    postRow.uiPosts.forEach(
      (uiPost) => (uiPost.leftPercentage += movementPercentage)
    );

    if (movementPx < 0) {
      const lastUiPost = postRow.uiPosts[postRow.uiPosts.length - 1];
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
        postRow.uiPosts.push({
          ...postToPush,
          uiUuid: postToPush.postUuid + " " + uuidV4(),
          leftPercentage: lastUiPost.leftPercentage + postCardWidthPercentage,
        });
      }
    } else if (movementPx > 0) {
      const firstUiPost = postRow.uiPosts[0];
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

        postRow.uiPosts.unshift({
          ...postToUnShift,
          uiUuid: postToUnShift.postUuid + " " + uuidV4(),
          leftPercentage: firstUiPost.leftPercentage - postCardWidthPercentage,
        });
      }
    }
  };

  return {
    setCurrentLocation: (path: string) => {
      clearGetPostRowPausedTimeout();
      setPostRowsContextData((state) => ({
        ...state,
        getPostRowsPausedTimeout: createGetPostRowPausedTimeout(),
        getPostRowsPaused: true,
        currentPath: path,
      }));
    },
    setScrollY: (scrollY: number) => {
      clearGetPostRowPausedTimeout();
      setPostRowsContextData((state) => ({
        ...state,
        getPostRowsPausedTimeout: createGetPostRowPausedTimeout(),
        getPostRowsPaused: true,
        scrollY: scrollY,
      }));
    },
    toggleClickedOnPlayPauseButton: () => {
      clearGetPostRowPausedTimeout();
      setPostRowsContextData((state) => ({
        ...state,
        getPostRowsPausedTimeout: createGetPostRowPausedTimeout(),
        getPostRowsPaused: true,
        clickedOnPlayPauseButton: !postRowsContextData.clickedOnPlayPauseButton,
      }));
    },
    mouseLeavePostRow: (postRowUuid: string) => {
      clearGetPostRowPausedTimeout();
      const postRow = postRowsContextData.postRows.find(
        (postRow) => postRow.postRowUuid == postRowUuid
      );
      if (postRow != undefined) {
        postRow.mouseOverPostRow = false;
      }
      setPostRowsContextData((state) => ({
        ...state,
        getPostRowsPausedTimeout: createGetPostRowPausedTimeout(),
        getPostRowsPaused: true,
      }));
    },
    createPostRowAndInsertAtBeginning: (data: Array<Post>) => {
      const state = store.getState();
      const postRow = createPostRow(
        data,
        state.appConfig.postsToShowInRow,
        postRowsContextData.postCardWidthPercentage,
        postRowsContextData.postRowContentWidthPx,
        state.appConfig.userFrontPagePostSortOrderOption
      );
      postRowsContextData.postRows.unshift(postRow);
      setPostRowsContextData((state) => ({
        ...state,
        postRowsHasAtLeast1PostRow: true,
        postRows: postRowsContextData.postRows,
      }));
    },
    checkGetPostRowPausedConditions: checkGetPostRowPausedConditions,
    postRowRemoveAt: (removeAt: number) => {
      postRowsContextData.postRows.splice(removeAt, 1);
      const updatedPostRows = postRowsContextData.postRows;
      setPostRowsContextData((state) => ({
        ...state,
        postRows: updatedPostRows,
      }));
    },
    incrementPostAttachment: (postRowUuid: string, postUuid: string) => {
      const postRow = postRowsContextData.postRows.find(
        (row) => row.postRowUuid == postRowUuid
      );
      if (postRow == undefined) {
        return;
      }
      const post = postRow.posts.find((post) => post.postUuid == postUuid);
      if (post != undefined) {
        const currentAttachmentIndex = post.currentAttachmentIndex;
        if (currentAttachmentIndex == post.attachments.length - 1) {
          post.currentAttachmentIndex = 0;
        } else {
          post.currentAttachmentIndex += 1;
        }

        const uiPostIndex = postRow.uiPosts.findIndex(
          (uiPost) => uiPost.postUuid == post.postUuid
        );
        if (uiPostIndex >= 0) {
          const uiPost = postRow.uiPosts[uiPostIndex];
          postRow.uiPosts[uiPostIndex] = {
            ...post,
            uiUuid: uiPost.uiUuid,
            leftPercentage: uiPost.leftPercentage,
          };
        }
      }

      setPostRowsContextData((state) => ({
        ...state,
        postRows: postRowsContextData.postRows,
      }));
    },
    decrementPostAttachment: (postRowUuid: string, postUuid: string) => {
      const postRow = postRowsContextData.postRows.find(
        (row) => row.postRowUuid == postRowUuid
      );
      if (postRow == undefined) {
        return;
      }
      const post = postRow.posts.find((post) => post.postUuid == postUuid);
      if (post != undefined) {
        const currentAttachmentIndex = post.currentAttachmentIndex;
        if (currentAttachmentIndex == 0) {
          post.currentAttachmentIndex = post.attachments.length - 1;
        } else {
          post.currentAttachmentIndex -= 1;
        }
        const uiPostIndex = postRow.uiPosts.findIndex(
          (uiPost) => uiPost.postUuid == post.postUuid
        );
        if (uiPostIndex >= 0) {
          const uiPost = postRow.uiPosts[uiPostIndex];
          postRow.uiPosts[uiPostIndex] = {
            ...post,
            uiUuid: uiPost.uiUuid,
            leftPercentage: uiPost.leftPercentage,
          };
        }
        setPostRowsContextData((state) => ({
          ...state,
          postRows: postRowsContextData.postRows,
        }));
      }
    },
    jumpToPostAttachment: (
      postRowUuid: string,
      postUuid: string,
      attachmentIndex: number
    ) => {
      const postRow = postRowsContextData.postRows.find(
        (postRow) => postRow.postRowUuid == postRowUuid
      );
      if (postRow == undefined) {
        return;
      }

      const post = postRow.posts.find((post) => post.postUuid == postUuid);
      if (post == undefined) {
        return;
      }
      const uiPost = postRow.uiPosts.find(
        (uiPost) => uiPost.postUuid == postUuid
      );
      if (uiPost == undefined) {
        return;
      }
      uiPost.currentAttachmentIndex = attachmentIndex;

      setPostRowsContextData((state) => ({
        ...state,
        postRows: postRowsContextData.postRows,
      }));
    },
    clearPostRows: () => {
      setPostRowsContextData((state) => ({
        ...state,
        postRows: [],
        postRowsHasAtLeast1PostRow: false,
      }));
    },
    addPostsToFrontOfRow: (
      postRowUuid: string,
      posts: Array<Post>,
      postsToShowInRow: number
    ) => {
      const postRow = postRowsContextData.postRows.find(
        (postRow) => postRow.postRowUuid == postRowUuid
      );
      if (postRow == undefined) {
        return;
      }

      postRow.posts = [...posts, ...postRow.posts];

      if (postRow.posts.length > MAX_POSTS_PER_ROW) {
        postRow.posts.splice(MAX_POSTS_PER_ROW - postRow.posts.length);
      }

      const updatedUiPosts = new Array<UiPost>();

      let runningPostIndex = postRow.posts.length - 1;
      for (let i = 0; i < postsToShowInRow + 2; ++i) {
        if (runningPostIndex == postRow.posts.length) {
          runningPostIndex = 0;
        }
        const postToPush = postRow.posts[runningPostIndex];
        const postToPushFromUiPosts = postRow.uiPosts.find((uiPost) =>
          uiPost.uiUuid.startsWith(postToPush.postUuid)
        );
        if (postToPushFromUiPosts != undefined) {
          updatedUiPosts.push(postToPushFromUiPosts);
        } else {
          updatedUiPosts.push({
            ...postToPush,
            uiUuid: `${postToPush.postUuid}-${uuidV4()}`,
            leftPercentage: 0,
          });
        }
        runningPostIndex++;
      }

      updatedUiPosts.forEach((uiPost, index) => {
        uiPost.leftPercentage = calcUiPostLeft(
          index - 1,
          postRowsContextData.postCardWidthPercentage
        );
      });

      postRow.uiPosts = updatedUiPosts;
      setPostRowsContextData((state) => ({
        ...state,
        postRows: postRowsContextData.postRows,
      }));
    },
    setPostCardWidthPercentage: (
      postCardWidthPercentage: number,
      postsToShowInRow: number
    ) => {
      const postRows = postRowsContextData.postRows;
      postRows.forEach((postRow) => {
        const uiPostsToSet = new Array<UiPost>();
        if (postRow.posts.length <= postsToShowInRow) {
          postRow.posts.forEach((post, index) => {
            uiPostsToSet.push({
              ...post,
              uiUuid: `${post.postUuid}-${uuidV4()}`,
              leftPercentage: postCardWidthPercentage * index,
            });
          });
        } else {
          let runningIndex = postRow.posts.findIndex(
            (post) => post.postUuid == postRow.uiPosts[0].postUuid
          );
          if (runningIndex == -1) {
            return;
          }
          for (let i = -1; i <= postsToShowInRow + 1; ++i) {
            if (runningIndex == postRow.posts.length) {
              runningIndex = 0;
            }
            const post = postRow.posts[runningIndex];
            uiPostsToSet.push({
              ...post,
              uiUuid: `${post.postUuid}-${uuidV4()}`,
              leftPercentage: postCardWidthPercentage * i,
            });
            runningIndex++;
          }
        }
        postRow.uiPosts = uiPostsToSet;
      });

      setPostRowsContextData((state) => ({
        ...state,
        postCardWidthPercentage: postCardWidthPercentage,
        postRows: postRows,
      }));
    },
    setPostRowContentWidthPx: (postRowContentWidthPx: number) => {
      setPostRowsContextData((state) => ({
        ...state,
        postRowContentWidthPx: postRowContentWidthPx,
      }));
    },
    mouseEnterPostRow: (postRowUuid: string) => {
      const postRow = postRowsContextData.postRows.find(
        (postRow) => postRow.postRowUuid == postRowUuid
      );
      if (postRow == undefined) {
        return;
      }
      postRow.mouseOverPostRow = true;
      clearGetPostRowPausedTimeout();

      setPostRowsContextData((state) => ({
        ...state,
        postRows: postRowsContextData.postRows,
        getPostRowsPaused: true,
        getPostRowsPausedTimeout: postRowsContextData.getPostRowsPausedTimeout,
      }));
    },
    moveUiPosts: (postRowUuid: string, movementPx: number) => {
      const postRows = postRowsContextData.postRows;
      const postRow = postRows.find((row) => row.postRowUuid == postRowUuid);
      if (postRow == undefined) {
        return;
      }
      handleMoveUiPosts(
        postRowsContextData.postCardWidthPercentage,
        postRowsContextData.postRowContentWidthPx,
        postRow,
        movementPx
      );
      setPostRowsContextData((state) => ({ ...state, postRows: postRows }));
    },
    postRowScrollRightPressed: (
      postRowUuid: string,
      snapToPostCard?: boolean | undefined
    ) => {
      const postRows = postRowsContextData.postRows;
      const postRow = postRows.find((row) => row.postRowUuid == postRowUuid);
      if (postRow == undefined) {
        return;
      }
      const firstVisibleUiPost = postRow.uiPosts.find(
        (uiPost) =>
          uiPost.leftPercentage + postRowsContextData.postCardWidthPercentage >
          0
      );
      if (firstVisibleUiPost == undefined) {
        return;
      }

      if (snapToPostCard == undefined) {
        snapToPostCard = true;
      }

      let movementPercentage = postRowsContextData.postCardWidthPercentage;
      if (snapToPostCard && firstVisibleUiPost.leftPercentage < 0) {
        movementPercentage = firstVisibleUiPost.leftPercentage;
      }
      handleMoveUiPosts(
        postRowsContextData.postCardWidthPercentage,
        postRowsContextData.postRowContentWidthPx,
        postRow,
        Math.abs(
          movementPercentage * 0.01 * postRowsContextData.postRowContentWidthPx
        )
      );

      setPostRowsContextData((state) => ({
        ...state,
        postRows: postRows,
      }));
    },
    postRowScrollLeftPressed: (
      postRowUuid: string,
      snapToPostCard?: boolean | undefined
    ) => {
      const postRows = postRowsContextData.postRows;
      const postRow = postRows.find((row) => row.postRowUuid == postRowUuid);
      if (postRow == undefined) {
        return;
      }

      const lastVisibleUiPost = postRow.uiPosts.find(
        (uiPost) =>
          uiPost.leftPercentage + postRowsContextData.postCardWidthPercentage >=
          100
      );
      if (lastVisibleUiPost == undefined) {
        return;
      }
      const lastVisibleUiPostRight =
        lastVisibleUiPost.leftPercentage +
        postRowsContextData.postCardWidthPercentage;

      if (snapToPostCard == undefined) {
        snapToPostCard = true;
      }

      let movementPercentage: number =
        postRowsContextData.postCardWidthPercentage * -1;
      if (snapToPostCard && lastVisibleUiPostRight != 100) {
        movementPercentage =
          100 -
          postRowsContextData.postCardWidthPercentage -
          lastVisibleUiPost.leftPercentage;
      }

      handleMoveUiPosts(
        postRowsContextData.postCardWidthPercentage,
        postRowsContextData.postRowContentWidthPx,
        postRow,
        movementPercentage * 0.01 * postRowsContextData.postRowContentWidthPx
      );
      setPostRowsContextData((state) => ({ ...state, postRows: postRows }));
    },
    getPostRowsContextData: () => {
      return postRowsContextData;
    },
  };
}
