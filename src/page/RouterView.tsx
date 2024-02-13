import { useAppDispatch, useAppSelector } from "../redux/store";

import { KeepAwake } from "@capacitor-community/keep-awake";
import { useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import {
  APP_INITIALIZATION_ROUTE,
  MODIFY_SUBREDDIT_LISTS_ROUTE,
  MODIFY_SUBREDDIT_QUEUE_ROUTE,
  NAVIGATION_HAMBURGER_TOOLBAR_HEIGHT,
  POST_CARD_LEFT_MARGIN_EM,
  POST_CARD_RIGHT_MARGIN_EM,
  POST_ROW_ROUTE,
  POST_ROW_SCROLL_BTN_WIDTH_EM,
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
import PostRowPage from "./PostRowsPage/PostRowPage.tsx";
import SinglePostView from "./SinglePostView.tsx";
import RedditPostSettings from "./SettingsPages/RedditPostSettings";
import RedditSignIn from "./SettingsPages/RedditSignIn.tsx";
import RedditWatcherSettings from "./SettingsPages/RedditWatcherSettings";
import getPlatform from "../util/PlatformUtil.ts";
import { Platform } from "../model/Platform.ts";
import {
  setCurrentLocation,
  setPostCardWidthPercentage,
  setPostRowContentWidthPx,
} from "../redux/slice/PostRowsSlice.ts";
import { RootFontSizeContext } from "./Context.ts";

const RouterView: React.FC = () => {
  const dispatch = useAppDispatch();
  const darkmode = useAppSelector((state) => state.appConfig.darkMode);
  const location = useLocation();

  const [rootFontSize, setRootFontSize] = useState(0);
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
            postCardWidthPercentage: postCardWidthPercentage,
            postsToShowInRow: postsToShowInRow,
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
      <RootFontSizeContext.Provider value={{ fontSize: rootFontSize }}>
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
      </RootFontSizeContext.Provider>
    </div>
  );
};

export default RouterView;
