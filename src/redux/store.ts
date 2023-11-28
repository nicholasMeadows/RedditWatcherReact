import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { configureStore } from "@reduxjs/toolkit";
import loadingPageReducer from './slice/LoadingPageSlice';
import appConfigReducer from './slice/AppConfigSlice';
import navigationDrawerReducer from './slice/NavigationDrawerSlice';
import redditClientReducer from './slice/RedditClientSlice';
import postRowsReducer from './slice/PostRowsSlice';
import subredditListsReducer from './slice/RedditListsSlice';
import redditSearchReducer from './slice/RedditSearchSlice';
import contextMenuReducer from './slice/ContextMenuSlice';
import appNotificationReducer from './slice/AppNotificationSlice';
import singlePostPageReducer from './slice/SinglePostPageSlice'
import thunk from 'redux-thunk';

const store = configureStore({
    reducer: {
        loadingPage: loadingPageReducer,
        appConfig: appConfigReducer,
        navigationDrawer: navigationDrawerReducer,
        redditClient: redditClientReducer,
        postRows: postRowsReducer,
        subredditLists: subredditListsReducer,
        redditSearch: redditSearchReducer,
        contextMenu: contextMenuReducer,
        appNotification: appNotificationReducer,
        singlePostPage: singlePostPageReducer
    }, middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk)
});
export default store;


// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector