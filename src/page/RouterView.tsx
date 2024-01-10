import { useAppDispatch, useAppSelector } from "../redux/store";

import { KeepAwake } from "@capacitor-community/keep-awake";
import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import {
  APP_INITIALIZATION_ROUTE,
  MODIFY_SUBREDDIT_LISTS_ROUTE,
  MODIFY_SUBREDDIT_QUEUE_ROUTE,
  NAVIGATION_HAMBURGER_TOOLBAR_HEIGHT,
  POST_ROW_ROUTE,
  REDDIT_POST_SETTINGS_ROUTE,
  REDDIT_SIGN_IN_ROUTE,
  REDDIT_WATCHER_SETTINGS_ROUTE,
  SINGPLE_POST_ROUTE,
} from "../RedditWatcherConstants";
import { closeContextMenu } from "../redux/slice/ContextMenuSlice";
import AppInitialization from "./AppInitialization";
import AppNotification from "./AppNotification";
import ContextMenu from "./ContextMenu";
import ModifySubredditLists from "./ModifySubredditListsPagesAndElements/ModifySubredditLists";
import ModifySubredditQueue from "./ModifySubredditQueue";
import NavigationHamburgerMenu from "./NavigationHamburgerMenu.tsx";
import PostRowCollectionView from "./PostPagesAndElements/PostRowCollectionView";
import SinglePostView from "./PostPagesAndElements/SinglePostView";
import RedditPostSettings from "./SettingsPages/RedditPostSettings";
import RedditSignIn from "./SettingsPages/RedditSignIn.tsx";
import RedditWatcherSettings from "./SettingsPages/RedditWatcherSettings";

const RouterView: React.FC = () => {
  const dispatch = useAppDispatch();
  const darkmode = useAppSelector((state) => state.appConfig.darkMode);

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

  useEffect(() => {
    let background = "white";
    let textColor = "black";
    let accordionHoverColor = "#ccc";
    let accordionBackground = "#dadada";
    let borderColor = "#c9c9c9";

    if (darkmode) {
      background = "#292a2e";
      textColor = "white";
      accordionHoverColor = "#494949";
      accordionBackground = "#464646";
      borderColor = "white";
    }
    document.body.style.setProperty("--background", background);
    document.body.style.setProperty("--text-color", textColor);
    document.body.style.setProperty(
      "--accordion-hover-color",
      accordionHoverColor
    );
    document.body.style.setProperty(
      "--accordion-background",
      accordionBackground
    );
    document.body.style.setProperty("--app-border-color", borderColor);
  }, [darkmode]);

  return (
    <div className="root-app">
      <NavigationHamburgerMenu />
      <AppNotification />
      <ContextMenu />
      <div
        style={{
          marginTop: `${NAVIGATION_HAMBURGER_TOOLBAR_HEIGHT}`,
          height: `calc( 100vh - ${NAVIGATION_HAMBURGER_TOOLBAR_HEIGHT})`,
          maxHeight: `calc( 100vh - ${NAVIGATION_HAMBURGER_TOOLBAR_HEIGHT})`,
        }}
        className="app-body"
      >
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
          <Route path={REDDIT_SIGN_IN_ROUTE} element={<RedditSignIn />} />
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
    </div>
  );
};

export default RouterView;
