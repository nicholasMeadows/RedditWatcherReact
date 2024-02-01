import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { v4 as uuidV4 } from "uuid";
import { Post, UiPost } from "../../model/Post/Post";
import { PostRow } from "../../model/PostRow";
import { PostRowsState } from "../../model/PostRowsState";
import store from "../store.ts";
import UserFrontPagePostSortOrderOptionsEnum from "../../model/config/enums/UserFrontPagePostSortOrderOptionsEnum.ts";
import { MAX_POSTS_PER_ROW } from "../../RedditWatcherConstants.ts";

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
  };

  if (
    postRow.posts.length > postsToShowInRow &&
    userFrontPageSortOption != UserFrontPagePostSortOrderOptionsEnum.New
  ) {
    const postToUnshift = posts[posts.length - 1];
    postRow.uiPosts.push({
      ...postToUnshift,
      uiUuid: postToUnshift.postUuid + " " + uuidV4(),
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
          movementDiffPx: number;
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

      postRow.uiPosts = postRow.uiPosts.filter((post) => {
        if (
          post.leftPercentage + state.postCardWidthPercentage >
            -state.postCardWidthPercentage &&
          post.leftPercentage < 100 + state.postCardWidthPercentage
        ) {
          return post;
        }
      });
      const movementDiffPx = action.payload.movementDiffPx;
      const movementDiffPercent =
        (movementDiffPx / state.postRowContentWidthPx) * 100;
      postRow.uiPosts.forEach((post) => {
        post.leftPercentage += movementDiffPercent;
      });
      if (movementDiffPx < 0) {
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
      } else if (movementDiffPx > 0) {
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
      action: { type: string; payload: number }
    ) => {
      state.postCardWidthPercentage = action.payload;
    },
    setPostRowContentWidthPx: (
      state,
      action: { type: string; payload: number }
    ) => {
      state.postRowContentWidthPx = action.payload;
    },
  },
  extraReducers(builder) {
    builder.addCase(
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
  setPostCardWidthPercentage,
  setPostRowContentWidthPx,
  addPostsToFrontOfRow,
} = postRowsSlice.actions;
export default postRowsSlice.reducer;
