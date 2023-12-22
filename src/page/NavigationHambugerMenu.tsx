import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  APP_INITIALIZATION_ROUTE,
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
import {
  exportAppConfig,
  importAppConfig,
  toggleDarkMode,
} from "../redux/slice/AppConfigSlice";
import { closeContextMenu } from "../redux/slice/ContextMenuSlice";
import {
  setPageName,
  setShowBackButton,
} from "../redux/slice/NavigationDrawerSlice";
import { clearSearchResults } from "../redux/slice/RedditSearchSlice";
import { useAppDispatch, useAppSelector } from "../redux/store";
const NavigationHambugerMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const pageName = useAppSelector((state) => state.navigationDrawer.pageName);
  const darkMode = useAppSelector((state) => state.appConfig.darkMode);
  const showBackButton = useAppSelector(
    (state) => state.navigationDrawer.showBackButton
  );
  const redditAuthStatus = useAppSelector(
    (state) => state.redditClient.redditAuthenticationStatus
  );

  const [popoutDrawerOpen, setPopoutDrawerOpen] = useState(false);
  const fileSelectorRef = useRef(null);

  const [importClicked, setImportClicked] = useState(false);
  const configLoaded = useAppSelector((state) => state.appConfig.configLoaded);
  useEffect(() => {
    if (!configLoaded && importClicked) {
      setImportClicked(false);
      setPopoutDrawerOpen(false);
      navigate(APP_INITIALIZATION_ROUTE);
    }
  }, [navigate, configLoaded, importClicked]);
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
      case APP_INITIALIZATION_ROUTE:
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

    const showBackButton =
      redditAuthStatus == RedditAuthenticationStatus.AUTHENTICATED &&
      pathname != POST_ROW_ROUTE &&
      pathname != APP_INITIALIZATION_ROUTE;

    dispatch(setShowBackButton(showBackButton));
    dispatch(closeContextMenu());
    dispatch(clearSearchResults());
  }, [dispatch, location, redditAuthStatus]);

  const navigateTo = (pathName: string) => {
    setPopoutDrawerOpen(false);
    if (window.location.href.endsWith(POST_ROW_ROUTE)) {
      navigate(pathName);
    } else {
      navigate(pathName, { replace: true });
    }
  };

  return (
    <>
      <div
        style={{
          height: `calc(${NAVIGATION_HAMBURGER_TOOLBAR_HEIGHT})`,
          maxHeight: `calc(${NAVIGATION_HAMBURGER_TOOLBAR_HEIGHT})`,
        }}
        className="top-bar"
      >
        <div
          className="top-bar-inner"
          style={{
            height: `calc(${NAVIGATION_HAMBURGER_TOOLBAR_HEIGHT} - 0.2em )`,
            maxHeight: `calc(${NAVIGATION_HAMBURGER_TOOLBAR_HEIGHT} - 0.2em)`,
          }}
        >
          <div
            className="hamburger-icon"
            onClick={() => {
              setPopoutDrawerOpen(!popoutDrawerOpen);
            }}
          >
            <div></div>
            <div></div>
            <div></div>
          </div>

          <div
            className="back-arrow"
            onClick={() => {
              navigate(-1);
            }}
            style={{ display: `${showBackButton ? "" : "none"}` }}
          >
            <img
              src={`assets/back_arrow_${darkMode ? "white" : "black"}.png`}
            />
          </div>
          <h1 className="tool-bar-title">{pageName}</h1>
        </div>
      </div>

      <div style={{ visibility: `${popoutDrawerOpen ? "visible" : "hidden"}` }}>
        <div
          className="drawer-background"
          onClick={() => {
            setPopoutDrawerOpen(false);
          }}
        ></div>
        <div
          className={`drawer-popout ${
            popoutDrawerOpen ? "drawer-popout-open" : ""
          }`}
        >
          <div className="drawer-popout-header">
            <h1>Reddit Watcher</h1>
          </div>
          <hr />
          {redditAuthStatus == RedditAuthenticationStatus.AUTHENTICATED && (
            <div className="drawer-popout-main">
              <div
                className="drawer-popout-item"
                onClick={() => {
                  navigateTo(POST_ROW_ROUTE);
                }}
              >
                <p>Home</p>
              </div>
              <hr />
              <div
                className="drawer-popout-item"
                onClick={() => {
                  navigateTo(MODIFY_SUBREDDIT_LISTS_ROUTE);
                }}
              >
                <p>Modify Subreddit Lists</p>
              </div>
              <hr />
              <div
                className="drawer-popout-item"
                onClick={() => {
                  navigateTo(MODIFY_SUBREDDIT_QUEUE_ROUTE);
                }}
              >
                <p>Modify Subreddit Queue</p>
              </div>
              <hr />
              <div
                className="drawer-popout-item"
                onClick={() => navigateTo(REDDIT_WATCHER_SETTINGS_ROUTE)}
              >
                <p> Reddit Watcher Settings</p>
              </div>
              <hr />
              <div
                className="drawer-popout-item"
                onClick={() => navigateTo(REDDIT_POST_SETTINGS_ROUTE)}
              >
                <p>Reddit Post Settings</p>
              </div>
              <hr />
              <div
                className="drawer-popout-item"
                onClick={() => navigateTo(REDDIT_SIGNIN_ROUTE)}
              >
                <p>Reddit Auth</p>
              </div>
              <hr />
              <div className="drawer-popout-item flex cursor-default">
                <p>Dark Mode</p>

                <label className="switch">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={() => dispatch(toggleDarkMode())}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              <hr />
            </div>
          )}

          <div className="drawer-popout-footer">
            <hr />
            <div
              className="drawer-popout-item"
              onClick={() => {
                (
                  fileSelectorRef.current as unknown as HTMLInputElement
                ).click();
              }}
            >
              <input
                type="file"
                style={{ display: "hidden" }}
                hidden={true}
                ref={fileSelectorRef}
                onInput={(event) => {
                  const input = event.target as HTMLInputElement;
                  if (input.files != undefined) {
                    setImportClicked(true);
                    dispatch(importAppConfig(input.files[0]));
                  }
                }}
              />
              <p>Import Config</p>
            </div>
            <hr />
            <div
              className="drawer-popout-item"
              onClick={() => dispatch(exportAppConfig())}
            >
              <p>Export Config</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NavigationHambugerMenu;
