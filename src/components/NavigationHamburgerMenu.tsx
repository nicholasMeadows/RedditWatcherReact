import {FormEvent, useCallback, useContext, useEffect, useRef, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {
  APP_INITIALIZATION_ROUTE,
  APPLICATION_SETTINGS_ROUTE,
  MODIFY_SUBREDDIT_LISTS_ROUTE,
  MODIFY_SUBREDDIT_QUEUE_ROUTE,
  NAVIGATION_HAMBURGER_TOOLBAR_HEIGHT,
  NOT_FOUND_404,
  POST_ROW_ROUTE,
  REDDIT_SIGN_IN_ROUTE,
  REDDIT_SOURCE_SETTINGS_ROUTE,
  SINGLE_POST_ROUTE,
} from "../RedditWatcherConstants";
import {RedditAuthenticationStatus} from "../model/RedditAuthenticationState";
import packageJson from "../../package.json";
import {AppConfigDispatchContext, AppConfigStateContext,} from "../context/app-config-context.ts";
import {AppConfigActionType} from "../reducer/app-config-reducer.ts";
import {exportConfigDownload, importParsedAppConfig,} from "../service/ConfigService.ts";
import ImportExportConfig from "../model/ImportExportConfig.ts";
import {RedditListDispatchContext, RedditListStateContext} from "../context/reddit-list-context.ts";
import {RedditServiceDispatchContext, RedditServiceStateContext,} from "../context/reddit-service-context.ts";
import {RedditServiceActions} from "../reducer/reddit-service-reducer.ts";
import {ContextMenuDispatchContext} from "../context/context-menu-context.ts";
import {ContextMenuActionType} from "../reducer/context-menu-reducer.ts";
import {RedditListActionType} from "../reducer/reddit-list-reducer.ts";
import {PostRowPageDispatchContext} from "../context/post-row-page-context.ts";
import {PostRowPageActionType} from "../reducer/post-row-page-reducer.ts";

const NavigationHamburgerMenu: React.FC = () => {
  const appConfigDispatch = useContext(AppConfigDispatchContext);
  const appConfigState = useContext(AppConfigStateContext);
  const { redditAuthenticationStatus } = useContext(RedditServiceStateContext);
  const redditServiceDispatch = useContext(RedditServiceDispatchContext);
  const redditListDispatch = useContext(RedditListDispatchContext);
  const postRowPageDispatch = useContext(PostRowPageDispatchContext);
  const navigate = useNavigate();
  const location = useLocation();
  const redditListsState = useContext(RedditListStateContext);
  const [pageName, setPageName] = useState("");
  const [showBackButton, setShowBackButton] = useState(false);
  const darkMode = useContext(AppConfigStateContext).darkMode;

  const [popoutDrawerOpen, setPopoutDrawerOpen] = useState(false);
  const fileSelectorRef = useRef(null);
  const contextMenuDispatch = useContext(ContextMenuDispatchContext);
  
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
      case SINGLE_POST_ROUTE:
        pageName = "Single Post";
        break;
      case MODIFY_SUBREDDIT_LISTS_ROUTE:
        pageName = "Modify Subreddit List";
        break;
      case MODIFY_SUBREDDIT_QUEUE_ROUTE:
        pageName = "Modify Subreddit Queue";
        break;
      case NOT_FOUND_404:
        pageName = "Not Found";
        break;
    }

    const showBackButton =
      redditAuthenticationStatus == RedditAuthenticationStatus.AUTHENTICATED &&
      pathname != POST_ROW_ROUTE &&
      pathname != APP_INITIALIZATION_ROUTE;

    setPageName(pageName);
    setShowBackButton(showBackButton);
    contextMenuDispatch({
      type: ContextMenuActionType.CLOSE_CONTEXT_MENU,
    });
  }, [contextMenuDispatch, location, redditAuthenticationStatus]);
  const navigateTo = (pathName: string) => {
    setPopoutDrawerOpen(false);
    if (window.location.href.endsWith(POST_ROW_ROUTE)) {
      navigate(pathName);
    } else {
      navigate(pathName, { replace: true });
    }
  };

  const exportAppConfig = useCallback(async () => {
      const configObj: ImportExportConfig = {
        appConfig: appConfigState,
        subredditLists: redditListsState.subredditLists,
      };
      const myFile = new File(
        [JSON.stringify(configObj)],
        "reddit-watcher-config.json"
      );
      exportConfigDownload(myFile);
    },
    [appConfigState, redditListsState.subredditLists]
  );

  const importConfigFileSelected = useCallback((event: FormEvent< HTMLInputElement>) => {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if(files === null || files.length == 0) {
      console.log("No file import file was selected");
      return;
    }

    console.log("importing app config");
    new Promise<void>((resolve, reject) => {
      files[0].text().then((text) => {
        try {
          const parsed = JSON.parse(text);
          importParsedAppConfig(parsed as never)
              .then(() => resolve())
              .catch(err => reject(err));
        } catch (err) {
          reject("Failed to parse import file");
        }
      }).catch(() => reject("Failed to read input file"));
    }).then(() => {
      redditServiceDispatch({
        type: RedditServiceActions.SET_REDDIT_AUTHENTICATION_STATUS,
        payload: {
          authenticationStatus:
          RedditAuthenticationStatus.NOT_YET_AUTHED,
        },
      });
      setPopoutDrawerOpen(false);
      appConfigDispatch({
        type: AppConfigActionType.RESET_CONFIG_LOADED
      })
      redditListDispatch({
        type: RedditListActionType.RESET_SUBREDDIT_LISTS
      })
      redditServiceDispatch({
        type: RedditServiceActions.SET_REDDIT_AUTHENTICATION_STATUS,
        payload: {
          authenticationStatus: RedditAuthenticationStatus.NOT_YET_AUTHED
        }
      })
      postRowPageDispatch({
        type: PostRowPageActionType.CLEAR_POST_ROWS
      })

      navigate(APP_INITIALIZATION_ROUTE);
    }).catch(err => {
        console.log("Import failed with error", err);
      });
  },[appConfigDispatch, navigate, postRowPageDispatch, redditListDispatch, redditServiceDispatch])

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
          {redditAuthenticationStatus ==
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
                    onChange={() => {
                      appConfigDispatch({
                        type: AppConfigActionType.TOGGLE_DARK_MODE,
                      });
                    }}
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
                onInput={importConfigFileSelected}
              />
              <p className="drawer-popout-item-text">Import Config</p>
            </div>
            <hr />
            <div
              className="drawer-popout-item"
              onClick={() => exportAppConfig()}
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
