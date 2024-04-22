import store, { useAppDispatch, useAppSelector } from "../redux/store";

import { KeepAwake } from "@capacitor-community/keep-awake";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import {
  APP_INITIALIZATION_ROUTE,
  APPLICATION_SETTINGS_ROUTE,
  MODIFY_SUBREDDIT_LISTS_ROUTE,
  MODIFY_SUBREDDIT_QUEUE_ROUTE,
  NAVIGATION_HAMBURGER_TOOLBAR_HEIGHT,
  POST_CARD_LEFT_MARGIN_EM,
  POST_CARD_RIGHT_MARGIN_EM,
  POST_ROW_ROUTE,
  POST_ROW_SCROLL_BTN_WIDTH_EM,
  REDDIT_SIGN_IN_ROUTE,
  REDDIT_SOURCE_SETTINGS_ROUTE,
  SINGPLE_POST_ROUTE,
} from "../RedditWatcherConstants";
import AppInitialization from "./AppInitialization";
import AppNotification from "./AppNotification";
import ContextMenu from "./ContextMenu";
import ModifySubredditLists from "./ModifySubredditListsPagesAndElements/ModifySubredditLists";
import ModifySubredditQueue from "./ModifySubredditQueue";
import NavigationHamburgerMenu from "./NavigationHamburgerMenu.tsx";
import PostRowPage from "./PostRowsPage/PostRowPage.tsx";
import SinglePostView from "./SinglePostView.tsx";
import RedditSourceSettings from "./SettingsPages/RedditSourceSettings.tsx";
import RedditSignIn from "./SettingsPages/RedditSignIn.tsx";
import ApplicationSettings from "./SettingsPages/ApplicationSettings.tsx";
import getPlatform from "../util/PlatformUtil.ts";
import { Platform } from "../model/Platform.ts";
import {
  setPostRowsToShowInView,
  setPostsToShowInRow,
} from "../redux/slice/AppConfigSlice.ts";
import { RootFontSizeContext } from "../context/root-font-size-context.ts";
import { RedditServiceContext } from "../context/reddit-service-context.ts";
import useRedditClient from "../hook/use-reddit-client.ts";
import { closeContextMenu } from "../redux/slice/ContextMenuSlice.ts";
import {
  setCurrentLocation,
  setPostCardWidthPercentage,
  setPostRowContentWidthPx,
} from "../redux/slice/PostRowsSlice.ts";

export type SecondsTillGettingNextPostContextData = {
  secondsTillGettingNextPosts: number;
  setSecondsTillGettingNextPosts: (seconds: number) => void;
};
const initialSecondsTillGettingNextPostContextData: SecondsTillGettingNextPostContextData =
  {
    secondsTillGettingNextPosts: 10,
    setSecondsTillGettingNextPosts: () => {},
  };
export const SecondsTillGettingNextPostContext =
  createContext<SecondsTillGettingNextPostContextData>(
    initialSecondsTillGettingNextPostContextData
  );
const RouterView: React.FC = () => {
  const dispatch = useAppDispatch();
  const redditClient = useRedditClient();
  const darkmode = useAppSelector((state) => state.appConfig.darkMode);
  const location = useLocation();
  const { setRootFontSize } = useContext(RootFontSizeContext);
  const redditService = useContext(RedditServiceContext);

  const [secondsTillGettingNextPosts, setSecondsTillGettingNextPosts] =
    useState<number>(
      initialSecondsTillGettingNextPostContextData.secondsTillGettingNextPosts
    );

  useEffect(() => {
    redditService.setRedditClient(redditClient);
    redditService.setSecondsTillGettingNextPostContextData({
      secondsTillGettingNextPosts: secondsTillGettingNextPosts,
      setSecondsTillGettingNextPosts: setSecondsTillGettingNextPosts,
    });
  }, [redditClient, redditService, secondsTillGettingNextPosts]);

  const wheelEventHandler = useCallback(
    (event: WheelEvent) => {
      const ctrlKeyPressed = event.ctrlKey;
      if (ctrlKeyPressed) {
        event.preventDefault();
        const appConfigState = store.getState().appConfig;
        const currentPostRowsToShowInView = appConfigState.postRowsToShowInView;
        const currentPostsToShowInRow = appConfigState.postsToShowInRow;

        const deltaY = event.deltaY;
        if (deltaY > 0) {
          dispatch(setPostsToShowInRow(currentPostsToShowInRow + 0.1));
          dispatch(setPostRowsToShowInView(currentPostRowsToShowInView + 0.1));
        } else if (deltaY < 0) {
          dispatch(setPostsToShowInRow(currentPostsToShowInRow - 0.1));
          dispatch(setPostRowsToShowInView(currentPostRowsToShowInView - 0.1));
        }
      }
    },
    [dispatch]
  );

  useEffect(() => {
    document.addEventListener("wheel", wheelEventHandler, { passive: false });
    KeepAwake.keepAwake();

    return () => {
      document.removeEventListener("wheel", wheelEventHandler);
    };
  }, [dispatch, wheelEventHandler]);

  useEffect(() => {
    const documentClickedEvent = () => {
      dispatch(closeContextMenu());
    };
    document.addEventListener("click", documentClickedEvent);
    return () => {
      document.removeEventListener("click", documentClickedEvent);
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(setCurrentLocation(location.pathname));
  }, [dispatch, location]);

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
    document.body.style.setProperty(
      "--post-row-scroll-btn-width-em",
      POST_ROW_SCROLL_BTN_WIDTH_EM.toString()
    );

    document.body.style.setProperty(
      "--post-card-left-margin-em",
      POST_CARD_LEFT_MARGIN_EM.toString()
    );
    document.body.style.setProperty(
      "--post-card-right-margin-em",
      POST_CARD_RIGHT_MARGIN_EM.toString()
    );
  }, [darkmode]);

  const postsToShowInRow = useAppSelector(
    (state) => state.appConfig.postsToShowInRow
  );
  const rootDivRef = useRef(null);
  useEffect(() => {
    const contentResizeObserver = new ResizeObserver(() => {
      if (rootDivRef.current != undefined) {
        const div = rootDivRef.current as unknown as HTMLDivElement;

        const baseFontSize = parseFloat(getComputedStyle(div).fontSize);
        setRootFontSize(baseFontSize);
        const scrollButtonWidths =
          getPlatform() != Platform.Android && getPlatform() != Platform.Ios
            ? baseFontSize * POST_ROW_SCROLL_BTN_WIDTH_EM * 2
            : 0;
        const postRowContentWidthPx = div.clientWidth - scrollButtonWidths;
        dispatch(setPostRowContentWidthPx(postRowContentWidthPx));

        const postCardWidthPx = postRowContentWidthPx / postsToShowInRow;
        const postCardWidthPercentage =
          (postCardWidthPx / postRowContentWidthPx) * 100;

        dispatch(
          setPostCardWidthPercentage({
            postsToShowInRow: postsToShowInRow,
            postCardWidthPercentage: postCardWidthPercentage,
          })
        );
      }
    });
    const div = rootDivRef.current;
    if (div != undefined) {
      contentResizeObserver.observe(div);
    }
  }, [dispatch, postsToShowInRow]);

  return (
    <div className="root-app" ref={rootDivRef}>
      <SecondsTillGettingNextPostContext.Provider
        value={{
          secondsTillGettingNextPosts: secondsTillGettingNextPosts,
          setSecondsTillGettingNextPosts: setSecondsTillGettingNextPosts,
        }}
      >
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
              element={
                <Navigate to={APP_INITIALIZATION_ROUTE} replace={true} />
              }
            />
            <Route
              index
              path={APP_INITIALIZATION_ROUTE}
              element={<AppInitialization />}
            />
            <Route path={REDDIT_SIGN_IN_ROUTE} element={<RedditSignIn />} />
            <Route path={POST_ROW_ROUTE} element={<PostRowPage />} />
            <Route
              path={REDDIT_SOURCE_SETTINGS_ROUTE}
              element={<RedditSourceSettings />}
            />
            <Route
              path={APPLICATION_SETTINGS_ROUTE}
              element={<ApplicationSettings />}
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
      </SecondsTillGettingNextPostContext.Provider>
    </div>
  );
};

export default RouterView;
