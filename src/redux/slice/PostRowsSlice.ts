import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { v4 as uuidV4 } from "uuid";
import { Post, UiPost } from "../../model/Post/Post";
import { PostRow } from "../../model/PostRow";
import { PostRowsState } from "../../model/PostRowsState";
import store from "../store.ts";
import { MAX_POSTS_PER_ROW } from "../../RedditWatcherConstants.ts";
import UserFrontPagePostSortOrderOptionsEnum from "../../model/config/enums/UserFrontPagePostSortOrderOptionsEnum.ts";

export const createPostRowAndPushToRows = createAsyncThunk(
  "postRows/createPostRowAndPushToRows",
  async (data: Array<Post>) => {
    const state = store.getState();
    return createPostRow(
      data,
      state.appConfig.postsToShowInRow,
      state.postRows.postCardWidth,
      state.postRows.postRowContentWidth,
      state.appConfig.userFrontPagePostSortOrderOption
    );
  }
);

export const createPostRowAndInsertAtBeginning = createAsyncThunk(
  "postRows/createPostRowAndInsertAtBegining",
  async (data: Array<Post>) => {
    const state = store.getState();
    return createPostRow(
      data,
      state.appConfig.postsToShowInRow,
      state.postRows.postCardWidth,
      state.postRows.postRowContentWidth,
      state.appConfig.userFrontPagePostSortOrderOption
    );
  }
);

const createPostRow = (
  posts: Array<Post>,
  postsToShowInRow: number,
  postCardWidth: number,
  postRowContentWidth: number,
  userFrontPageSortOption: UserFrontPagePostSortOrderOptionsEnum
): PostRow => {
  const postRowUuid = uuidV4();
  const postRow: PostRow = {
    postRowUuid: postRowUuid,
    posts: posts,
    uiPosts: [],
    postRowContentWidthAtCreation: postRowContentWidth,
  };

  if (
    postRow.posts.length > postsToShowInRow &&
    userFrontPageSortOption != UserFrontPagePostSortOrderOptionsEnum.New
  ) {
    const postToUnshift = posts[posts.length - 1];
    postRow.uiPosts.push({
      ...postToUnshift,
      uiUuid: postToUnshift.postUuid + " " + uuidV4(),
      left: calcUiPostLeft(-1, postCardWidth),
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
      left: calcUiPostLeft(index, postCardWidth),
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
      left: calcUiPostLeft(postRow.uiPosts.length - 1, postCardWidth),
    });
  }
  return postRow;
};

const calcUiPostLeft = (uiPostIndex: number, postCardWidth: number) => {
  return postCardWidth * uiPostIndex;
};

const setPostRowsHasAtLeast1PostRow = (state: PostRowsState) => {
  if (!state.postRowsHasAtLeast1PostRow) {
    state.postRowsHasAtLeast1PostRow = true;
  }
};

const setGetPostRowsPaused = (
  state: PostRowsState,
  scrollY: number,
  mouseOverPostRowUuid: string | undefined,
  clickedOnPlayPauseButton: boolean
) => {
  if (clickedOnPlayPauseButton) {
    state.getPostRowsPaused = true;
    return;
  }
  state.getPostRowsPaused = scrollY != 0 || mouseOverPostRowUuid != undefined;
};
const initialState: PostRowsState = {
  scrollY: 0,
  postRowsHasAtLeast1PostRow: false,
  postRows: new Array<PostRow>(),
  mouseOverPostRowUuid: undefined,
  clickedOnPlayPauseButton: false,
  getPostRowsPaused: false,
  postCardWidth: 0,
  postRowContentWidth: 0,
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
        state.mouseOverPostRowUuid,
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
            left: uiPost.left,
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
            left: uiPost.left,
          };
        }
      }
    },
    mouseEnterPostRow: (state, action: { type: string; payload: string }) => {
      const foundPostRow = state.postRows.find(
        (postRow) => postRow.postRowUuid == action.payload
      );
      if (foundPostRow != undefined) {
        state.mouseOverPostRowUuid = action.payload;
      }
      setGetPostRowsPaused(
        state,
        state.scrollY,
        action.payload,
        state.clickedOnPlayPauseButton
      );
    },
    mouseLeavePostRow: (state) => {
      const foundPostRow = state.postRows.find(
        (postRow) => postRow.postRowUuid == state.mouseOverPostRowUuid
      );
      if (foundPostRow != undefined) {
        state.mouseOverPostRowUuid = undefined;
      }
      setGetPostRowsPaused(
        state,
        state.scrollY,
        undefined,
        state.clickedOnPlayPauseButton
      );
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
        state.mouseOverPostRowUuid,
        state.clickedOnPlayPauseButton
      );
    },

    movePostRow: (
      state,
      action: {
        type: string;
        payload: {
          postRowUuid: string;
          movementDiff: number;
          postsToShowInRow: number;
        };
      }
    ) => {
      const postRowUuid = action.payload.postRowUuid;
      const postRow = state.postRows.find(
        (row) => row.postRowUuid == postRowUuid
      );
      if (postRow == undefined) {
        return;
      }

      // const postCardWidthPercentage =
      //   (state.postCardWidth / state.postRowContentWidth) * 100;

      postRow.uiPosts = postRow.uiPosts.filter((post) => {
        if (
          post.left + state.postCardWidth > -state.postCardWidth &&
          post.left < state.postRowContentWidth + state.postCardWidth
        ) {
          return post;
        }
      });

      const movementDiff = action.payload.movementDiff;
      // const percentDelta = (movementDiff / state.postRowContentWidth) * 100;
      postRow.uiPosts.forEach((post) => {
        post.left += movementDiff;
      });

      const firstUiPost = postRow.uiPosts[0];
      if (movementDiff < 0) {
        const lastUiPost = postRow.uiPosts[postRow.uiPosts.length - 1];
        if (lastUiPost.left < state.postRowContentWidth) {
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
            left:
              lastUiPost.left +
              state.postCardWidth *
                (postRow.postRowContentWidthAtCreation /
                  state.postRowContentWidth),
          });
        }
      } else if (movementDiff > 0) {
        if (firstUiPost.left + state.postCardWidth >= 0) {
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
            left:
              firstUiPost.left -
              state.postCardWidth *
                (postRow.postRowContentWidthAtCreation /
                  state.postRowContentWidth),
          });
        }
      }
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
            left: 0,
          });
        }
        runningPostIndex++;
      }

      updatedUiPosts.forEach((uiPost, index) => {
        uiPost.left = calcUiPostLeft(index - 2, state.postCardWidth);
      });

      postRow.uiPosts = updatedUiPosts;
    },
    setPostCardWidth: (state, action: { type: string; payload: number }) => {
      state.postCardWidth = action.payload;
    },
    setPostRowContentWidth: (
      state,
      action: { type: string; payload: number }
    ) => {
      state.postRowContentWidth = action.payload;
    },
    stopSmoothPostTransition: (
      state,
      action: {
        type: string;
        payload: {
          postRowUuid: string;
          secondPostCardPxLeft: number;
        };
      }
    ) => {
      const postRowUuid = action.payload.postRowUuid;
      const postRow = state.postRows.find(
        (row) => row.postRowUuid == postRowUuid
      );
      if (postRow == undefined) {
        return;
      }
      const secondPostCardPxLeft = action.payload.secondPostCardPxLeft;
      postRow.uiPosts.forEach((uiPost, index) => {
        const scaleFactor =
          postRow.postRowContentWidthAtCreation / state.postRowContentWidth;
        uiPost.left =
          secondPostCardPxLeft +
          (index - 1) * state.postCardWidth * scaleFactor;
        // (state.postCardWidth *
        //   (postRow.postRowContentWidthAtCreation /
        //     state.postRowContentWidth));
      });
    },
  },
  extraReducers(builder) {
    builder
      .addCase(
        createPostRowAndPushToRows.fulfilled,
        (state, action: { type: string; payload: PostRow }) => {
          setPostRowsHasAtLeast1PostRow(state);
          state.postRows.push(action.payload);
        }
      )
      .addCase(
        createPostRowAndInsertAtBeginning.fulfilled,
        (state, action: { type: string; payload: PostRow }) => {
          setPostRowsHasAtLeast1PostRow(state);
          state.postRows.unshift(action.payload);
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
  mouseLeavePostRow,
  clearPostRows,
  toggleClickedOnPlayPauseButton,
  movePostRow,
  setPostCardWidth,
  setPostRowContentWidth,
  addPostsToFrontOfRow,
  stopSmoothPostTransition,
} = postRowsSlice.actions;
export default postRowsSlice.reducer;
