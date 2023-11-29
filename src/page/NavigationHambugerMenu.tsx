import { useLocation, useNavigate } from "react-router-dom";
import {
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
import { useAppDispatch, useAppSelector } from "../redux/store";
import { useRef, useState } from "react";
import {
  exportAppConfig,
  importAppConfig,
  toggleDarkMode,
} from "../redux/slice/AppConfigSlice";
import { setPostRowAndCurrentPost } from "../redux/slice/SinglePostPageSlice";
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
          height: `calc(${NAVIGATION_HAMBURGER_TOOLBAR_HEIGHT} - 0.2em)`,
          maxHeight: `calc(${NAVIGATION_HAMBURGER_TOOLBAR_HEIGHT} - 0.2em)`,
        }}
        className="top-bar"
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
          hidden={!showBackButton}
          style={{ visibility: `${showBackButton ? "visible" : "hidden"}` }}
          onClick={() => {
            if (location.pathname == SINGPLE_POST_ROUTE) {
              dispatch(
                setPostRowAndCurrentPost({
                  postRow: undefined,
                  postToShow: undefined,
                })
              );
            }
            navigate(-1);
          }}
        >
          &#10132;
        </div>
        <h1 className="tool-bar-title">{pageName}</h1>
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
          <div
            className="drawer-popout-header"
            style={{
              height: `calc(${NAVIGATION_HAMBURGER_TOOLBAR_HEIGHT} - 0.2em)`,
              maxHeight: `calc(${NAVIGATION_HAMBURGER_TOOLBAR_HEIGHT} - 0.2em)`,
            }}
          >
            <h1>Reddit Watcher</h1>
          </div>

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
              <div
                className="drawer-popout-item"
                onClick={() => {
                  navigateTo(MODIFY_SUBREDDIT_LISTS_ROUTE);
                }}
              >
                <p>Modify Subreddit Lists</p>
              </div>
              <div
                className="drawer-popout-item"
                onClick={() => {
                  navigateTo(MODIFY_SUBREDDIT_QUEUE_ROUTE);
                }}
              >
                <p>Modify Subreddit Queue</p>
              </div>
              <div
                className="drawer-popout-item"
                onClick={() => navigateTo(REDDIT_WATCHER_SETTINGS_ROUTE)}
              >
                <p> Reddit Watcher Settings</p>
              </div>
              <div
                className="drawer-popout-item"
                onClick={() => navigateTo(REDDIT_POST_SETTINGS_ROUTE)}
              >
                <p>Reddit Post Settings</p>
              </div>
              <div
                className="drawer-popout-item"
                onClick={() => navigateTo(REDDIT_SIGNIN_ROUTE)}
              >
                <p>Reddit Auth</p>
              </div>
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
            </div>
          )}

          <div className="drawer-popout-footer">
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
                    dispatch(importAppConfig(input.files[0]));
                  }
                }}
              />
              <p>Import Config</p>
            </div>
            <div
              className="drawer-popout-item"
              onClick={() => dispatch(exportAppConfig())}
            >
              <p>Export Config</p>
            </div>
          </div>
        </div>
      </div>
      {/* <IonMenu contentId="main-content" id="ionMenuDrawer">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Reddit Watcher</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="side-bar-menu">
          {redditAuthStatus == RedditAuthenticationStatus.AUTHENTICATED && (
            <>
              <IonItem
                onClick={() => {
                  navigateTo(POST_ROW_ROUTE);
                }}
              >
                Home
              </IonItem>
              <IonItem
                onClick={() => {
                  navigateTo(MODIFY_SUBREDDIT_LISTS_ROUTE);
                }}
              >
                Modify Subreddit Lists
              </IonItem>
              <IonItem
                onClick={() => {
                  navigateTo(MODIFY_SUBREDDIT_QUEUE_ROUTE);
                }}
              >
                Modify Subreddit Queue
              </IonItem>
              <IonItem
                onClick={() => {
                  navigateTo(REDDIT_WATCHER_SETTINGS_ROUTE);
                }}
              >
                Reddit Watcher Settings
              </IonItem>
              <IonItem
                onClick={() => {
                  navigateTo(REDDIT_POST_SETTINGS_ROUTE);
                }}
              >
                Reddit Post Settings
              </IonItem>
              <IonItem
                onClick={() => {
                  navigateTo(REDDIT_SIGNIN_ROUTE);
                }}
              >
                Reddit Auth
              </IonItem>
              <IonItem>
                <IonToggle
                  onIonChange={() => dispatch(toggleDarkMode())}
                  checked={store.getState().appConfig.darkMode}
                >
                  Dark Mode
                </IonToggle>
              </IonItem>
            </>
          )}
          <div className="side-bar-menu side-bar-menu-bottom">
            <IonItem onClick={() => dispatch(exportAppConfig())}>
              Export Config
            </IonItem>
            <input
              type="file"
              style={{ display: "hidden" }}
              hidden={true}
              ref={fileSelectorRef}
              onInput={(event) => {
                const input = event.target as HTMLInputElement;
                if (input.files != undefined) {
                  dispatch(importAppConfig(input.files[0]));
                }
              }}
            />
            <IonItem
              onClick={() => {
                (
                  fileSelectorRef.current as unknown as HTMLInputElement
                ).click();
              }}
            >
              Import
            </IonItem>
          </div>
        </IonContent>
      </IonMenu>
      <IonHeader id="main-content">
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
            {showBackButton &&
              RedditAuthenticationStatus.AUTHENTICATED == redditAuthStatus && (
                <IonBackButton defaultHref="#"></IonBackButton>
              )}
          </IonButtons>
          <IonTitle>{pageName}</IonTitle>
        </IonToolbar>
      </IonHeader> */}
    </>
  );
};

export default NavigationHambugerMenu;
