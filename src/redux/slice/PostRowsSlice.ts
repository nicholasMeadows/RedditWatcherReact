import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { v4 as uuidV4 } from "uuid";
import { Post, UiPost } from "../../model/Post/Post";
import { PostRow } from "../../model/PostRow";
import { PostRowsState } from "../../model/PostRowsState";
import store from "../store.ts";
import UserFrontPagePostSortOrderOptionsEnum from "../../model/config/enums/UserFrontPagePostSortOrderOptionsEnum.ts";
import { MAX_POSTS_PER_ROW } from "../../RedditWatcherConstants.ts";

export const mouseLeavePostRow = createAsyncThunk(
  "postRows/mouseLeavePostRow",
  async (postRowUuid: string) => {
    const timeout = setTimeout(() => {
      store.dispatch(mouseLeavePostRowTimeout(postRowUuid));
    }, 1000);
    return { postRowUuid: postRowUuid, timeout: timeout };
  }
);

export const createPostRowAndInsertAtBeginning = createAsyncThunk(
  "postRows/createPostRowAndInsertAtBegining",
  async (data: Array<Post>) => {
    const state = store.getState();
    return createPostRow(
      data,
      state.appConfig.postsToShowInRow,
      state.postRows.postCardWidthPercentage,
      state.postRows.postRowContentWidthPx,
      state.appConfig.userFrontPagePostSortOrderOption
    );
  }
);

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
    mouseLeavePostRowTimeout: undefined,
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

const calcUiPostLeft = (
  uiPostIndex: number,
  postCardWidthPercentage: number
) => {
  return postCardWidthPercentage * uiPostIndex;
};

const setPostRowsHasAtLeast1PostRow = (state: PostRowsState) => {
  if (!state.postRowsHasAtLeast1PostRow) {
    state.postRowsHasAtLeast1PostRow = true;
  }
};

const setGetPostRowsPaused = (
  state: PostRowsState,
  scrollY: number,
  clickedOnPlayPauseButton: boolean
) => {
  if (clickedOnPlayPauseButton) {
    state.getPostRowsPaused = true;
    return;
  }
  const mouseOverPostRow = state.postRows.find(
    (postRow) => postRow.mouseOverPostRow
  );
  state.getPostRowsPaused = scrollY != 0 || mouseOverPostRow != undefined;
};

const handleMoveUiPosts = (
  state: PostRowsState,
  postRow: PostRow,
  movementPx: number
) => {
  postRow.uiPosts = postRow.uiPosts.filter((post) => {
    if (
      post.leftPercentage + state.postCardWidthPercentage >
        -state.postCardWidthPercentage &&
      post.leftPercentage < 100 + state.postCardWidthPercentage
    ) {
      return post;
    }
  });

  const movementPercentage = (movementPx / state.postRowContentWidthPx) * 100;
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
        leftPercentage:
          lastUiPost.leftPercentage + state.postCardWidthPercentage,
      });
    }
  } else if (movementPx > 0) {
    const firstUiPost = postRow.uiPosts[0];
    if (firstUiPost.leftPercentage + state.postCardWidthPercentage >= 0) {
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
        leftPercentage:
          firstUiPost.leftPercentage - state.postCardWidthPercentage,
      });
    }
  }
};

const initialState: PostRowsState = {
  scrollY: 0,
  postRowsHasAtLeast1PostRow: false,
  postRows: new Array<PostRow>(),
  clickedOnPlayPauseButton: false,
  getPostRowsPaused: false,
  postCardWidthPercentage: 0,
  postRowContentWidthPx: 0,
};
export const postRowsSlice = createSlice({
  name: "postRows",
  initialState: initialState,
  reducers: {
    setScrollY: (state, action) => {
      state.scrollY = action.payload;
      setGetPostRowsPaused(
        state,
        action.payload,
        state.clickedOnPlayPauseButton
      );
    },
    postRowRemoveAt: (state, action: { type: string; payload: number }) => {
      state.postRows.splice(action.payload, 1);
    },
    incrementPostAttachment: (
      state,
      action: {
        type: string;
        payload: { postRowUuid: string; postUuid: string };
      }
    ) => {
      const postRowUuid = action.payload.postRowUuid;
      const postUuid = action.payload.postUuid;
      const postRow = state.postRows.find(
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
    },
    decrementPostAttachment: (
      state,
      action: {
        type: string;
        payload: { postRowUuid: string; postUuid: string };
      }
    ) => {
      const postRowUuid = action.payload.postRowUuid;
      const postUuid = action.payload.postUuid;
      const postRow = state.postRows.find(
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
      }
    },
    clearPostRows: (state) => {
      state.postRows = [];
      state.postRowsHasAtLeast1PostRow = false;
    },
    toggleClickedOnPlayPauseButton: (state) => {
      state.clickedOnPlayPauseButton = !state.clickedOnPlayPauseButton;
      setGetPostRowsPaused(
        state,
        state.scrollY,
        state.clickedOnPlayPauseButton
      );
    },
    addPostsToFrontOfRow: (
      state,
      action: {
        type: string;
        payload: {
          postRowUuid: string;
          posts: Array<Post>;
          postsToShowInRow: number;
        };
      }
    ) => {
      const postRowUuid = action.payload.postRowUuid;
      const postRow = state.postRows.find(
        (postRow) => postRow.postRowUuid == postRowUuid
      );
      if (postRow == undefined) {
        return;
      }

      const postsToInsert = action.payload.posts;
      postRow.posts = [...postsToInsert, ...postRow.posts];

      if (postRow.posts.length > MAX_POSTS_PER_ROW) {
        postRow.posts.splice(MAX_POSTS_PER_ROW - postRow.posts.length);
      }

      const updatedUiPosts = new Array<UiPost>();

      let runningPostIndex = postRow.posts.length - 1;
      for (let i = 0; i < action.payload.postsToShowInRow + 2; ++i) {
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
          state.postCardWidthPercentage
        );
      });

      postRow.uiPosts = updatedUiPosts;
    },
    setPostCardWidthPercentage: (
      state,
      action: {
        type: string;
        payload: { postCardWidthPercentage: number; postsToShowInRow: number };
      }
    ) => {
      const postCardWidthPercentage = action.payload.postCardWidthPercentage;
      const postsToShowInRow = action.payload.postsToShowInRow;
      state.postCardWidthPercentage = postCardWidthPercentage;

      state.postRows.forEach((postRow) => {
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
    },
    setPostRowContentWidthPx: (
      state,
      action: { type: string; payload: number }
    ) => {
      state.postRowContentWidthPx = action.payload;
    },
    mouseEnterPostRow: (state, action: { type: string; payload: string }) => {
      const postRow = state.postRows.find(
        (postRow) => postRow.postRowUuid == action.payload
      );
      if (postRow == undefined) {
        return;
      }

      if (postRow.mouseLeavePostRowTimeout != undefined) {
        clearTimeout(postRow.mouseLeavePostRowTimeout);
        postRow.mouseLeavePostRowTimeout = undefined;
      }

      postRow.mouseOverPostRow = true;
      setGetPostRowsPaused(
        state,
        state.scrollY,
        state.clickedOnPlayPauseButton
      );
    },
    mouseLeavePostRowTimeout: (
      state,
      action: { type: string; payload: string }
    ) => {
      const postRowUuid = action.payload;
      const postRow = state.postRows.find(
        (postRow) => postRow.postRowUuid == postRowUuid
      );
      if (postRow == undefined) {
        return;
      }
      postRow.mouseLeavePostRowTimeout = undefined;
      postRow.mouseOverPostRow = false;
      setGetPostRowsPaused(
        state,
        state.scrollY,
        state.clickedOnPlayPauseButton
      );
    },
    moveUiPosts: (
      state,
      action: {
        type: string;
        payload: { postRowUuid: string; movementPx: number };
      }
    ) => {
      const postRowUuid = action.payload.postRowUuid;
      const postRow = state.postRows.find(
        (row) => row.postRowUuid == postRowUuid
      );
      if (postRow == undefined) {
        return;
      }
      handleMoveUiPosts(state, postRow, action.payload.movementPx);
    },
    postRowScrollRightPressed: (
      state,
      action: {
        type: string;
        payload: { postRowUuid: string; snapToPostCard?: boolean | undefined };
      }
    ) => {
      const postRowUuid = action.payload.postRowUuid;
      const postRow = state.postRows.find(
        (row) => row.postRowUuid == postRowUuid
      );
      if (postRow == undefined) {
        return;
      }
      const firstVisibleUiPost = postRow.uiPosts.find(
        (uiPost) => uiPost.leftPercentage + state.postCardWidthPercentage > 0
      );
      if (firstVisibleUiPost == undefined) {
        return;
      }

      let snapToPostCard = action.payload.snapToPostCard;
      if (snapToPostCard == undefined) {
        snapToPostCard = true;
      }

      let movementPercentage = state.postCardWidthPercentage;
      if (snapToPostCard && firstVisibleUiPost.leftPercentage < 0) {
        movementPercentage = firstVisibleUiPost.leftPercentage;
      }
      handleMoveUiPosts(
        state,
        postRow,
        Math.abs(movementPercentage * 0.01 * state.postRowContentWidthPx)
      );
    },
    postRowScrollLeftPressed: (
      state,
      action: {
        type: string;
        payload: { postRowUuid: string; snapToPostCard?: boolean | undefined };
      }
    ) => {
      const postRowUuid = action.payload.postRowUuid;
      const postRow = state.postRows.find(
        (row) => row.postRowUuid == postRowUuid
      );
      if (postRow == undefined) {
        return;
      }

      const lastVisibleUiPost = postRow.uiPosts.find(
        (uiPost) => uiPost.leftPercentage + state.postCardWidthPercentage >= 100
      );
      if (lastVisibleUiPost == undefined) {
        return;
      }
      const lastVisibleUiPostRight =
        lastVisibleUiPost.leftPercentage + state.postCardWidthPercentage;

      let snapToPostCard = action.payload.snapToPostCard;
      if (snapToPostCard == undefined) {
        snapToPostCard = true;
      }

      let movementPercentage: number = state.postCardWidthPercentage * -1;
      if (snapToPostCard && lastVisibleUiPostRight != 100) {
        movementPercentage =
          100 -
          state.postCardWidthPercentage -
          lastVisibleUiPost.leftPercentage;
      }

      handleMoveUiPosts(
        state,
        postRow,
        movementPercentage * 0.01 * state.postRowContentWidthPx
      );
    },
  },
  extraReducers(builder) {
    builder
      .addCase(
        createPostRowAndInsertAtBeginning.fulfilled,
        (state, action: { type: string; payload: PostRow }) => {
          setPostRowsHasAtLeast1PostRow(state);
          state.postRows.unshift(action.payload);
        }
      )
      .addCase(
        mouseLeavePostRow.fulfilled,
        (
          state,
          action: {
            type: string;
            payload: { postRowUuid: string; timeout: NodeJS.Timeout };
          }
        ) => {
          const postRowUuid = action.payload.postRowUuid;
          const postRow = state.postRows.find(
            (postRow) => postRow.postRowUuid == postRowUuid
          );
          if (postRow == undefined) {
            return;
          }
          if (postRow.mouseLeavePostRowTimeout != undefined) {
            clearTimeout(postRow.mouseLeavePostRowTimeout);
          }
          postRow.mouseLeavePostRowTimeout = action.payload.timeout;
        }
      );
  },
});

export const {
  setScrollY,
  postRowRemoveAt,
  incrementPostAttachment,
  decrementPostAttachment,
  mouseEnterPostRow,
  mouseLeavePostRowTimeout,
  clearPostRows,
  toggleClickedOnPlayPauseButton,
  setPostCardWidthPercentage,
  setPostRowContentWidthPx,
  addPostsToFrontOfRow,
  moveUiPosts,
  postRowScrollRightPressed,
  postRowScrollLeftPressed,
} = postRowsSlice.actions;
export default postRowsSlice.reducer;
