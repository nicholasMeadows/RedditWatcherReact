import { HashRouter } from "react-router-dom";

/* Theme variables */
import "./theme/app-initialization.scss";
import "./theme/app-notification.scss";
import "./theme/context-menu.scss";
import "./theme/global.scss";
import "./theme/modify-subreddit-lists.scss";
import "./theme/modify-subreddit-queue.scss";
import "./theme/navigation-hamburger-menu.scss";
import "./theme/post-element.scss";
import "./theme/post-rows.scss";
import "./theme/reddit-post-settings.scss";
import "./theme/reddit-signin.scss";
import "./theme/reddit-watcher-settings.scss";
import "./theme/search-reddit-bar.scss";
import "./theme/side-bar.scss";
import "./theme/single-post-page.scss";
import "./theme/variables.css";

import { Provider } from "react-redux";
import RouterView from "./page/RouterView";
import store from "./redux/store";
import { useState } from "react";
import {
  ContextMenuContext,
  ContextMenuContextData,
  InitialContextMenuContextData,
} from "./context/context-menu-context.ts";
import { RootFontSizeContext } from "./context/root-font-size-context.ts";
import { SinglePostPageContext } from "./context/single-post-page-context.ts";
import { RedditServiceContext } from "./context/reddit-service-context.ts";
import RedditService from "./service/RedditService.ts";
import {
  AppNotificationContext,
  AppNotificationItem,
} from "./context/app-notification-context.ts";

const App: React.FC = () => {
  const [rootFontSize, setRootFontSize] = useState(0);
  const [singlePostPagePostRowUuid, setSinglePostPagePostRowUuid] = useState<
    string | undefined
  >(undefined);
  const [singlePostPagePostUuid, setSinglePostPagePostUuid] = useState<
    string | undefined
  >(undefined);
  const [contextMenuData, setContextMenuData] =
    useState<ContextMenuContextData>(InitialContextMenuContextData);
  const [appNotifications, setAppNotifications] = useState<
    AppNotificationItem[]
  >([]);
  return (
    <Provider store={store}>
      <HashRouter>
        <RootFontSizeContext.Provider
          value={{ fontSize: rootFontSize, setRootFontSize: setRootFontSize }}
        >
          <SinglePostPageContext.Provider
            value={{
              postRowUuid: singlePostPagePostRowUuid,
              postUuid: singlePostPagePostUuid,
              setSinglePostPagePostRowUuid: setSinglePostPagePostRowUuid,
              setSinglePostPagePostUuid: setSinglePostPagePostUuid,
            }}
          >
            <ContextMenuContext.Provider
              value={{
                contextMenuData: contextMenuData,
                setContextMenuData: (data) => {
                  setContextMenuData(data);
                },
              }}
            >
              <RedditServiceContext.Provider value={new RedditService()}>
                <AppNotificationContext.Provider
                  value={{
                    appNotifications: appNotifications,
                    setAppNotifications: setAppNotifications,
                  }}
                >
                  <RouterView />
                </AppNotificationContext.Provider>
              </RedditServiceContext.Provider>
            </ContextMenuContext.Provider>
          </SinglePostPageContext.Provider>
        </RootFontSizeContext.Provider>
      </HashRouter>
    </Provider>
  );
};

export default App;
