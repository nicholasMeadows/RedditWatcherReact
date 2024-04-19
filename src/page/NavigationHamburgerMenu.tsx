import { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  APP_INITIALIZATION_ROUTE,
  APPLICATION_SETTINGS_ROUTE,
  MODIFY_SUBREDDIT_LISTS_ROUTE,
  MODIFY_SUBREDDIT_QUEUE_ROUTE,
  NAVIGATION_HAMBURGER_TOOLBAR_HEIGHT,
  POST_ROW_ROUTE,
  REDDIT_SIGN_IN_ROUTE,
  REDDIT_SOURCE_SETTINGS_ROUTE,
  SINGPLE_POST_ROUTE,
} from "../RedditWatcherConstants";
import { RedditAuthenticationStatus } from "../model/RedditAuthenticationState";
import {
  exportAppConfig,
  importAppConfig,
  toggleDarkMode,
} from "../redux/slice/AppConfigSlice";
import { useAppDispatch, useAppSelector } from "../redux/store";
import useRedditClient from "../hook/use-reddit-client.ts";
import { RedditClientContext } from "../context/reddit-client-context.ts";
import { RedditServiceContext } from "../context/reddit-service-context.ts";
import { RedditListContext } from "../context/reddit-list-context.ts";
import useRedditList from "../hook/use-reddit-list.ts";
import packageJson from "../../package.json";
import { closeContextMenu } from "../redux/slice/ContextMenuSlice.ts";

const NavigationHamburgerMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const redditClient = useRedditClient();
  const redditListHook = useRedditList();
  const { redditClientContextData } = useContext(RedditClientContext);
  const redditService = useContext(RedditServiceContext);
  const { redditListContextData } = useContext(RedditListContext);
  const [pageName, setPageName] = useState("");
  const [showBackButton, setShowBackButton] = useState(false);
  const darkMode = useAppSelector((state) => state.appConfig.darkMode);

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
      case REDDIT_SIGN_IN_ROUTE:
        pageName = "Sign In";
        break;
      case APP_INITIALIZATION_ROUTE:
        pageName = "Loading";
        break;
      case POST_ROW_ROUTE:
        pageName = "Home";
        break;
      case REDDIT_SOURCE_SETTINGS_ROUTE:
        pageName = "Post Settings";
        break;
      case APPLICATION_SETTINGS_ROUTE:
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

    const showBackButton =
      redditClientContextData.redditAuthenticationStatus ==
        RedditAuthenticationStatus.AUTHENTICATED &&
      pathname != POST_ROW_ROUTE &&
      pathname != APP_INITIALIZATION_ROUTE;

    setPageName(pageName);
    setShowBackButton(showBackButton);
    dispatch(closeContextMenu());
  }, [dispatch, location, redditClientContextData.redditAuthenticationStatus]);
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
            style={{
              display: `${showBackButton ? "" : "none"}`,
            }}
          >
            <img alt={""} src={`assets/back_arrow_white.png`} />
          </div>

          <div className="top-bar-title-box">
            <p className="tool-bar-title">{pageName}</p>
          </div>
        </div>
      </div>

      <div style={{ visibility: `${popoutDrawerOpen ? "visible" : "hidden"}` }}>
        <div
          className="drawer-background"
          style={{
            top: `${NAVIGATION_HAMBURGER_TOOLBAR_HEIGHT}`,
          }}
          onClick={() => {
            setPopoutDrawerOpen(false);
          }}
        ></div>
        <div
          className={`drawer-popout ${
            popoutDrawerOpen ? "drawer-popout-open" : ""
          }`}
          style={{
            top: `${NAVIGATION_HAMBURGER_TOOLBAR_HEIGHT}`,
          }}
        >
          {redditClientContextData.redditAuthenticationStatus ==
            RedditAuthenticationStatus.AUTHENTICATED && (
            <div className="drawer-popout-main">
              <div
                className="drawer-popout-item"
                onClick={() => {
                  navigateTo(POST_ROW_ROUTE);
                }}
              >
                <p className="drawer-popout-item-text">Home</p>
              </div>
              <hr />
              <div
                className="drawer-popout-item"
                onClick={() => {
                  navigateTo(MODIFY_SUBREDDIT_LISTS_ROUTE);
                }}
              >
                <p className="drawer-popout-item-text">
                  Modify Subreddit Lists
                </p>
              </div>
              <hr />
              <div
                className="drawer-popout-item"
                onClick={() => {
                  navigateTo(MODIFY_SUBREDDIT_QUEUE_ROUTE);
                }}
              >
                <p className="drawer-popout-item-text">
                  Modify Subreddit Queue
                </p>
              </div>
              <hr />
              <div
                className="drawer-popout-item"
                onClick={() => navigateTo(APPLICATION_SETTINGS_ROUTE)}
              >
                <p className="drawer-popout-item-text">App Settings</p>
              </div>
              <hr />
              <div
                className="drawer-popout-item"
                onClick={() => navigateTo(REDDIT_SOURCE_SETTINGS_ROUTE)}
              >
                <p className="drawer-popout-item-text">Reddit Post Settings</p>
              </div>
              <hr />
              <div
                className="drawer-popout-item"
                onClick={() => navigateTo(REDDIT_SIGN_IN_ROUTE)}
              >
                <p className="drawer-popout-item-text">Reddit Auth</p>
              </div>
              <hr />
              <div className="drawer-popout-item cursor-default">
                <p className="drawer-popout-item-text">Dark Mode</p>

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
                    dispatch(
                      importAppConfig({
                        file: input.files[0],
                        redditClient: redditClient,
                        redditService: redditService,
                        redditListsHook: redditListHook,
                      })
                    );
                  }
                }}
              />
              <p className="drawer-popout-item-text">Import Config</p>
            </div>
            <hr />
            <div
              className="drawer-popout-item"
              onClick={() =>
                dispatch(exportAppConfig(redditListContextData.subredditLists))
              }
            >
              <p className="drawer-popout-item-text">Export Config</p>
            </div>
            <hr />
          </div>

          <div className={"app-version-div"}>
            <p>App Version: {packageJson.version}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NavigationHamburgerMenu;
