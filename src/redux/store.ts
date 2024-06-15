import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import thunk from "redux-thunk";
import appConfigReducer from "./slice/AppConfigSlice";
import contextMenuReducer from "./slice/ContextMenuSlice.ts";
import sideBarReducer from "./slice/SideBarSlice.ts";
import singlePostPageSlice from "./slice/SinglePostPageSlice.ts";
import postRowsSlice from "./slice/PostRowsSlice.ts";
import redditListsSlice from "./slice/RedditListSlice.ts";

const store = configureStore({
  reducer: {
    appConfig: appConfigReducer,
    contextMenu: contextMenuReducer,
    sideBar: sideBarReducer,
    singlePostPage: singlePostPageSlice,
    postRows: postRowsSlice,
    redditLists: redditListsSlice,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
});
export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
