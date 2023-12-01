import { useAppDispatch } from "../redux/store";

import { KeepAwake } from "@capacitor-community/keep-awake";
import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import {
  APP_INITIALIZATION_ROUTE,
  MODIFY_SUBREDDIT_LISTS_ROUTE,
  MODIFY_SUBREDDIT_QUEUE_ROUTE,
  POST_ROW_ROUTE,
  REDDIT_POST_SETTINGS_ROUTE,
  REDDIT_SIGNIN_ROUTE,
  REDDIT_WATCHER_SETTINGS_ROUTE,
  SINGPLE_POST_ROUTE,
} from "../RedditWatcherConstants";
import { closeContextMenu } from "../redux/slice/ContextMenuSlice";
import AppInitialization from "./AppInitialization";
import AppNotification from "./AppNotification";
import ContextMenu from "./ContextMenu";
import ModifySubredditLists from "./ModifySubredditListsPagesAndElements/ModifySubredditLists";
import ModifySubredditQueue from "./ModifySubredditQueue";
import NavigationHambugerMenu from "./NavigationHambugerMenu";
import PostRowCollectionView from "./PostPagesAndElements/PostRowCollectionView";
import SinglePostView from "./PostPagesAndElements/SinglePostView";
import RedditPostSettings from "./SettingsPages/RedditPostSettings";
import RedditSignin from "./SettingsPages/RedditSignin";
import RedditWatcherSettings from "./SettingsPages/RedditWatcherSettings";

const RouterView: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const documentClickedEvent = () => {
      dispatch(closeContextMenu());
    };

    document.addEventListener("click", documentClickedEvent);
    KeepAwake.keepAwake();

    return () => {
      document.removeEventListener("click", documentClickedEvent);
    };
  }, [dispatch]);

  return (
    <div className="root-app">
      <NavigationHambugerMenu />
      <AppNotification />
      <ContextMenu />
      <Routes>
        <Route
          path="/"
          element={<Navigate to={APP_INITIALIZATION_ROUTE} replace={true} />}
        />
        <Route
          index
          path={APP_INITIALIZATION_ROUTE}
          element={<AppInitialization />}
        />
        <Route path={REDDIT_SIGNIN_ROUTE} element={<RedditSignin />} />
        <Route path={POST_ROW_ROUTE} element={<PostRowCollectionView />} />
        <Route
          path={REDDIT_POST_SETTINGS_ROUTE}
          element={<RedditPostSettings />}
        />
        <Route
          path={REDDIT_WATCHER_SETTINGS_ROUTE}
          element={<RedditWatcherSettings />}
        />
        <Route path={SINGPLE_POST_ROUTE} element={<SinglePostView />} />
        <Route
          path={MODIFY_SUBREDDIT_LISTS_ROUTE}
          element={<ModifySubredditLists />}
        />
        <Route
          path={MODIFY_SUBREDDIT_QUEUE_ROUTE}
          element={<ModifySubredditQueue />}
        />
      </Routes>
    </div>
  );
};

export default RouterView;
