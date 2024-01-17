import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { v4 as uuidV4 } from "uuid";
import { Post, UiPost } from "../../model/Post/Post";
import { PostRow } from "../../model/PostRow";
import { PostRowsState } from "../../model/PostRowsState";
import { MAX_POSTS_PER_ROW } from "../../RedditWatcherConstants.ts";

export const createPostRowAndPushToRows = createAsyncThunk(
  "postRows/createPostRowAndPushToRows",
  async (data: Array<Post>) => {
    return createPostRow(data);
  }
);

export const createPostRowAndInsertAtBeginning = createAsyncThunk(
  "postRows/createPostRowAndInsertAtBegining",
  async (data: Array<Post>) => {
    return createPostRow(data);
  }
);

const createPostRow = (posts: Array<Post>): PostRow => {
  const postRowUuid = uuidV4();
  return {
    postRowUuid: postRowUuid,
    posts: posts,
    uiPosts: [],
    uiPostContentOffset: 0,
    postContentFirstPostIndex: 0,
  };
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
          postRow.uiPosts[uiPostIndex] = { ...post, uiUuid: uiPost.uiUuid };
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
          postRow.uiPosts[uiPostIndex] = { ...post, uiUuid: uiPost.uiUuid };
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

    postRowMouseDownMoved: (
      state,
      action: {
        type: string;
        payload: {
          postRowUuid: string;
          movementDiff: number;
          postCardWidth: number;
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

      const movementDiff = action.payload.movementDiff;
      let updatedPostCardOffset = postRow.uiPostContentOffset + movementDiff;
      const postCardWidth = action.payload.postCardWidth;
      if (updatedPostCardOffset >= postCardWidth) {
        const updatedFirstPostIndex: number =
          (postRow.postContentFirstPostIndex == 0
            ? postRow.posts.length
            : postRow.postContentFirstPostIndex) - 1;
        postRow.postContentFirstPostIndex = updatedFirstPostIndex;

        postRow.uiPosts.pop();

        const postIndexToInsert =
          (updatedFirstPostIndex == 0
            ? postRow.posts.length
            : updatedFirstPostIndex) - 1;
        const postToUnshift = postRow.posts[postIndexToInsert];
        postRow.uiPosts.unshift({
          ...postToUnshift,
          uiUuid: postToUnshift.postUuid + " " + uuidV4(),
        });

        updatedPostCardOffset -= postCardWidth;
      } else if (updatedPostCardOffset <= -postCardWidth) {
        postRow.uiPosts.shift();
        postRow.postContentFirstPostIndex =
          postRow.postContentFirstPostIndex == postRow.posts.length - 1
            ? 0
            : postRow.postContentFirstPostIndex + 1;

        const lastPostUuid =
          postRow.uiPosts[postRow.uiPosts.length - 1].postUuid;
        const lastPostIndex = postRow.posts.findIndex(
          (post) => post.postUuid == lastPostUuid
        );
        const postIndexToPush =
          lastPostIndex == postRow.posts.length - 1 ? 0 : lastPostIndex + 1;
        const postToPush = postRow.posts[postIndexToPush];
        postRow.uiPosts.push({
          ...postToPush,
          uiUuid: postToPush.postUuid + " " + uuidV4(),
        });
        updatedPostCardOffset += postCardWidth;
      }
      postRow.uiPostContentOffset = updatedPostCardOffset;
    },
    setUiPosts: (
      state,
      action: {
        type: string;
        payload: {
          postRowUuid: string;
          postsToShowInRow: number;
          postCardWidth: number;
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
      const postsToShowInRow = action.payload.postsToShowInRow;
      if (postRow.posts.length < postsToShowInRow) {
        postRow.uiPosts = postRow.posts.map((post) => {
          return { ...post, uiUuid: `${post.postUuid}-${uuidV4()}` };
        });
        postRow.postContentFirstPostIndex = 0;
        postRow.uiPostContentOffset = action.payload.postCardWidth;
      } else {
        const posts = postRow.posts;
        const uiPostsToSet = new Array<UiPost>();

        let postsRunningIndex = 0;
        for (let index = 0; index < postsToShowInRow; ++index) {
          if (postsRunningIndex == posts.length) {
            postsRunningIndex = 0;
          }
          const post = posts[postsRunningIndex];
          const postToPush: UiPost = {
            ...post,
            uiUuid: post.postUuid + "" + uuidV4(),
          };
          uiPostsToSet.push(postToPush);
          postsRunningIndex++;
        }
        postRow.postContentFirstPostIndex = 0;
        if (postsRunningIndex == posts.length) {
          postsRunningIndex = 0;
        }
        const postToPush = posts[postsRunningIndex];
        uiPostsToSet.push({
          ...postToPush,
          uiUuid: postToPush.postUuid + "" + uuidV4(),
        });

        const postToUnshift = posts[posts.length - 1];

        uiPostsToSet.unshift({
          ...postToUnshift,
          uiUuid: postToUnshift.postUuid + " " + uuidV4(),
        });
        postRow.uiPosts = uiPostsToSet;
      }
    },
    shiftPostsAndUiPosts: (
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
      postsToInsert.reverse();
      postsToInsert.forEach((post) => {
        postRow.posts.unshift(post);
      });

      if (postRow.posts.length > MAX_POSTS_PER_ROW) {
        postRow.posts.splice(MAX_POSTS_PER_ROW - postRow.posts.length);
      }
      const updatedUiPosts = new Array<UiPost>();
      const postsToShowInRow = action.payload.postsToShowInRow;
      let postsRunningIndex = 0;
      for (let i = 0; i < postsToShowInRow; ++i) {
        if (postsRunningIndex == postRow.posts.length) {
          postsRunningIndex = 0;
        }
        const post = postRow.posts[postsRunningIndex];

        let uiUuid = `${post.postUuid}-${uuidV4()}`;
        const foundUuidPost = postRow.uiPosts.find(
          (uuidPost) => uuidPost.postUuid == post.postUuid
        );
        if (foundUuidPost != undefined) {
          uiUuid = foundUuidPost.uiUuid;
        }
        updatedUiPosts.push({
          ...post,
          uiUuid: uiUuid,
        });
        postsRunningIndex++;
      }

      if (postsRunningIndex == postRow.posts.length) {
        postsRunningIndex = 0;
      }
      const post = postRow.posts[postsRunningIndex];
      updatedUiPosts.push({
        ...post,
        uiUuid: `${post.postUuid}-${uuidV4()}`,
      });

      const lastPost = postRow.posts[postRow.posts.length - 1];
      updatedUiPosts.unshift({
        ...lastPost,
        uiUuid: `${lastPost.postUuid}-${uuidV4()}`,
      });

      postRow.uiPosts = updatedUiPosts;
      postRow.uiPostContentOffset = 0;
      postRow.postContentFirstPostIndex = 0;
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
  postRowMouseDownMoved,
  setUiPosts,
  shiftPostsAndUiPosts,
} = postRowsSlice.actions;
export default postRowsSlice.reducer;
