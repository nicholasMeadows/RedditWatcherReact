import { useCallback, useContext, useEffect, useRef, useState } from "react";
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
import store, { useAppDispatch, useAppSelector } from "../redux/store";
import { RedditClientContext } from "../context/reddit-client-context.ts";
import packageJson from "../../package.json";
import { closeContextMenu } from "../redux/slice/ContextMenuSlice.ts";
import {
  AppConfigDispatchContext,
  AppConfigStateContext,
} from "../context/app-config-context.ts";
import { AppConfigActionType } from "../reducer/app-config-reducer.ts";
import {
  exportConfigDownload,
  fillInMissingFieldsInConfigObj,
  saveConfig,
  saveSubredditLists,
} from "../service/ConfigService.ts";
import { SubredditLists } from "../model/SubredditList/SubredditLists.ts";
import { Subreddit } from "../model/Subreddit/Subreddit.ts";
import { clearPostRows } from "../redux/slice/PostRowsSlice.ts";
import ImportExportConfig from "../model/ImportExportConfig.ts";

const NavigationHamburgerMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const appConfigDispatch = useContext(AppConfigDispatchContext);
  const appConfigState = useContext(AppConfigStateContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { redditClientContextData, setRedditClientContextData } =
    useContext(RedditClientContext);
  const redditListsState = useAppSelector((state) => state.redditLists);
  const [pageName, setPageName] = useState("");
  const [showBackButton, setShowBackButton] = useState(false);
  const darkMode = useContext(AppConfigStateContext).darkMode;

  const [popoutDrawerOpen, setPopoutDrawerOpen] = useState(false);
  const fileSelectorRef = useRef(null);

  const [importClicked, setImportClicked] = useState(false);
  const configLoaded = useContext(AppConfigStateContext).configLoaded;
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

  const importAppConfig = useCallback(
    async (file: File) => {
      try {
        console.log("importing app config");
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (parsed["appConfig"] != undefined) {
          console.log(
            "appConfig was not undefined. Setting up app config",
            parsed["appConfig"]
          );
          const config = fillInMissingFieldsInConfigObj(parsed["appConfig"]);
          await saveConfig(config);
        }

        if (parsed["subredditLists"] != undefined) {
          const subredditListsToSave = new Array<SubredditLists>();
          let failedParsing = false;
          const subredditLists = parsed["subredditLists"];
          if (Array.isArray(subredditLists)) {
            for (const list of subredditLists) {
              if (
                Object.hasOwn(list, "subredditListUuid") &&
                Object.hasOwn(list, "listName") &&
                Object.hasOwn(list, "subreddits") &&
                Object.hasOwn(list, "selected")
              ) {
                const parsedSubreddits = new Array<Subreddit>();
                if (Array.isArray(list["subreddits"])) {
                  const subreddits = list["subreddits"];
                  for (const subreddit of subreddits) {
                    if (
                      Object.hasOwn(subreddit, "displayName") &&
                      Object.hasOwn(subreddit, "displayNamePrefixed") &&
                      Object.hasOwn(subreddit, "subscribers") &&
                      Object.hasOwn(subreddit, "over18") &&
                      Object.hasOwn(subreddit, "isSubscribed") &&
                      Object.hasOwn(subreddit, "fromList") &&
                      Object.hasOwn(subreddit, "subredditUuid")
                    ) {
                      parsedSubreddits.push({
                        displayName: subreddit["displayName"],
                        displayNamePrefixed: subreddit["displayNamePrefixed"],
                        subscribers: subreddit["subscribers"],
                        over18: subreddit["over18"],
                        isSubscribed: subreddit["isSubscribed"],
                        fromList: subreddit["fromList"],
                        subredditUuid: subreddit["subredditUuid"],
                        isUser: subreddit["isUser"],
                      });
                    } else {
                      failedParsing = true;
                      break;
                    }
                  }
                }
                if (failedParsing) {
                  break;
                } else {
                  const subredditList: SubredditLists = {
                    subredditListUuid: "",
                    listName: list["listName"],
                    subreddits: parsedSubreddits,
                    selected: list["selected"],
                  };
                  subredditListsToSave.push(subredditList);
                }
              } else {
                failedParsing = false;
                break;
              }
            }
          } else {
            failedParsing = true;
          }

          if (!failedParsing) {
            await saveSubredditLists(subredditListsToSave);
          }
        }

        console.log("done importing");
        store.dispatch(clearPostRows());
        appConfigDispatch({ type: AppConfigActionType.RESET_CONFIG_LOADED });
      } catch (e) {
        console.log("exception", e);
      }
    },
    [appConfigDispatch]
  );

  const exportAppConfig = useCallback(
    async (subredditLists: Array<SubredditLists>) => {
      const configObj: ImportExportConfig = {
        appConfig: appConfigState,
        subredditLists: subredditLists,
      };
      const myFile = new File(
        [JSON.stringify(configObj)],
        "reddit-watcher-config.json"
      );
      exportConfigDownload(myFile);
    },
    [appConfigState]
  );
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
                onInput={(event) => {
                  const input = event.target as HTMLInputElement;
                  if (input.files != undefined) {
                    setImportClicked(true);
                    importAppConfig(input.files[0]);
                    setRedditClientContextData((prevState) => {
                      return {
                        ...prevState,
                        redditAuthenticationStatus:
                          RedditAuthenticationStatus.NOT_YET_AUTHED,
                      };
                    });
                  }
                }}
              />
              <p className="drawer-popout-item-text">Import Config</p>
            </div>
            <hr />
            <div
              className="drawer-popout-item"
              onClick={() => exportAppConfig(redditListsState.subredditLists)}
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
