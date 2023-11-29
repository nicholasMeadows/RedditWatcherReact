import { useEffect } from "react";
import {
  LOADING_CONTENT_ROUTE,
  MODIFY_SUBREDDIT_LISTS_ROUTE,
  MODIFY_SUBREDDIT_QUEUE_ROUTE,
  NAVIGATION_HAMBURGER_TOOLBAR_HEIGHT,
  POST_ROW_ROUTE,
  REDDIT_POST_SETTINGS_ROUTE,
  REDDIT_SIGNIN_ROUTE,
  REDDIT_WATCHER_SETTINGS_ROUTE,
  SINGPLE_POST_ROUTE,
} from "../RedditWatcherConstants";
import { RedditAuthenticationStatus } from "../model/RedditAuthenticationState";
import { setLoadingText } from "../redux/slice/LoadingPageSlice";
import { authenticateReddit } from "../redux/slice/RedditClientSlice";
import store, { useAppDispatch, useAppSelector } from "../redux/store";
import { startLoopingForPosts } from "../service/RedditService";
import NavigationHambugerMenu from "./NavigationHambugerMenu";

import { KeepAwake } from "@capacitor-community/keep-awake";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { loadAppConfig } from "../redux/slice/AppConfigSlice";
import { closeContextMenu } from "../redux/slice/ContextMenuSlice";
import {
  setPageName,
  setShowBackButton,
} from "../redux/slice/NavigationDrawerSlice";
import { loadSubredditLists } from "../redux/slice/RedditListsSlice";
import { clearSearchResults } from "../redux/slice/RedditSearchSlice";
import {
  goToNextPost,
  goToPreviousPost,
} from "../redux/slice/SinglePostPageSlice";
import AppNotification from "./AppNotification";
import ContextMenu from "./ContextMenu";
import LoadingContent from "./LoadingContent";
import ModifySubredditLists from "./ModifySubredditListsPagesAndElements/ModifySubredditLists";
import ModifySubredditQueue from "./ModifySubredditQueue";
import PostRowCollectionView from "./PostPagesAndElements/PostRowCollectionView";
import SinglePostView from "./PostPagesAndElements/SinglePostView";
import RedditPostSettings from "./SettingsPages/RedditPostSettings";
import RedditSignin from "./SettingsPages/RedditSignin";
import RedditWatcherSettings from "./SettingsPages/RedditWatcherSettings";

const RouterView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const configLoaded = useAppSelector((state) => state.appConfig.configLoaded);
  const subredditListsLoaded = useAppSelector(
    (state) => state.subredditLists.subredditListsLoaded
  );
  const redditAuthStatus = useAppSelector(
    (state) => state.redditClient.redditAuthenticationStatus
  );
  const postRowsHasAtLeast1PostRow = useAppSelector(
    (state) => state.postRows.postRowsHasAtLeast1PostRow
  );
  const postRows = useAppSelector((state) => state.postRows.postRows);

  const documentClickedEvent = () => {
    dispatch(closeContextMenu());
  };

  const documentKeyUpEvent = (keyboardEvent: globalThis.KeyboardEvent) => {
    const key = keyboardEvent.key;
    if (window.location.href.endsWith(SINGPLE_POST_ROUTE)) {
      if (key == "ArrowRight") {
        dispatch(goToNextPost());
      } else if (key == "ArrowLeft") {
        dispatch(goToPreviousPost());
      }
    }
  };

  useEffect(() => {
    document.addEventListener("click", documentClickedEvent);
    document.body.addEventListener("keyup", documentKeyUpEvent);
    KeepAwake.keepAwake();

    return () => {
      document.removeEventListener("click", documentClickedEvent);
      document.body.removeEventListener("keyup", documentKeyUpEvent);
    };
  });

  useEffect(() => {
    console.log(
      `The current URL is ${location.pathname}${location.search}${location.hash}`
    );
    const pathname = location.pathname;
    let pageName = "";
    switch (pathname) {
      case REDDIT_SIGNIN_ROUTE:
        pageName = "Sign In";
        break;
      case LOADING_CONTENT_ROUTE:
        pageName = "Loading";
        break;
      case POST_ROW_ROUTE:
        pageName = "Home";
        break;
      case REDDIT_POST_SETTINGS_ROUTE:
        pageName = "Post Settings";
        break;
      case REDDIT_WATCHER_SETTINGS_ROUTE:
        pageName = "App Settings";
        break;
      case SINGPLE_POST_ROUTE:
        pageName = "Single Post";
        break;
      case MODIFY_SUBREDDIT_LISTS_ROUTE:
        pageName = "Modify Subreddit List";
        break;
      case MODIFY_SUBREDDIT_QUEUE_ROUTE:
        pageName = "Modify Subreddit Queue";
        break;
    }
    dispatch(setPageName(pageName));
    dispatch(
      setShowBackButton(
        !pathname.endsWith(POST_ROW_ROUTE) &&
          !pathname.endsWith(LOADING_CONTENT_ROUTE)
      )
    );
    dispatch(closeContextMenu());
    dispatch(clearSearchResults());
  }, [dispatch, location]);

  useEffect(() => {
    if (configLoaded) {
      dispatch(loadSubredditLists());
    } else {
      dispatch(loadAppConfig());
    }
  }, [dispatch, configLoaded]);

  useEffect(() => {
    if (configLoaded && subredditListsLoaded) {
      const redditCredentials = store.getState().appConfig.redditCredentials;
      if (redditCredentials == undefined) {
        navigate(REDDIT_SIGNIN_ROUTE);
      } else if (
        redditAuthStatus == RedditAuthenticationStatus.NOT_YET_AUTHED ||
        redditAuthStatus == RedditAuthenticationStatus.AUTHENTICATION_DENIED
      ) {
        const username = redditCredentials.username;
        const password = redditCredentials.password;
        const clientId = redditCredentials.clientId;
        const clientSecret = redditCredentials.clientSecret;

        if (
          username == "" ||
          password == "" ||
          clientId == "" ||
          clientSecret == ""
        ) {
          navigate(REDDIT_SIGNIN_ROUTE);
        } else {
          console.log("Authetnicationg Reddit");
          dispatch(setLoadingText("Logging In..."));
          dispatch(authenticateReddit());
        }
      }
    }
  }, [
    dispatch,
    navigate,
    configLoaded,
    subredditListsLoaded,
    redditAuthStatus,
  ]);

  useEffect(() => {
    if (redditAuthStatus == RedditAuthenticationStatus.AUTHENTICATION_DENIED) {
      navigate(REDDIT_SIGNIN_ROUTE);
    } else if (
      redditAuthStatus == RedditAuthenticationStatus.AUTHENTICATED &&
      postRows.length == 0
    ) {
      dispatch(setLoadingText("Getting Posts..."));
      navigate(LOADING_CONTENT_ROUTE);

      const state = store.getState();
      const authenticated = state.redditClient.redditAuthenticationStatus;
      const loopingForPosts = state.redditClient.loopingForPosts;
      if (
        authenticated === RedditAuthenticationStatus.AUTHENTICATED &&
        !loopingForPosts
      ) {
        startLoopingForPosts();
      }
    }
  }, [dispatch, navigate, postRows.length, redditAuthStatus]);

  useEffect(() => {
    if (
      postRowsHasAtLeast1PostRow &&
      window.location.href.endsWith(LOADING_CONTENT_ROUTE)
    ) {
      navigate(POST_ROW_ROUTE);
    }
  }, [navigate, postRowsHasAtLeast1PostRow]);

  return (
    <div style={{ width: "100%", height: "100%" }} className="root-app">
      <NavigationHambugerMenu />
      <AppNotification />
      <ContextMenu />
      <div
        style={{
          height: `calc(100% - ${
            redditAuthStatus == RedditAuthenticationStatus.AUTHENTICATED
              ? NAVIGATION_HAMBURGER_TOOLBAR_HEIGHT
              : "0px"
          })`,
          width: "100%",
        }}
      >
        <Routes>
          <Route
            index
            path={LOADING_CONTENT_ROUTE}
            element={<LoadingContent />}
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
    </div>
  );
};

export default RouterView;
