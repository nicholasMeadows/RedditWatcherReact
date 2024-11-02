import { HashRouter } from "react-router-dom"; /* Theme variables */
import "./theme/app-initialization.scss";
import "./theme/app-notifications.scss";
import "./theme/app-notification.scss";
import "./theme/context-menu.scss";
import "./theme/global.scss";
import "./theme/modify-subreddit-lists.scss";
import "./theme/modify-subreddit-queue.scss";
import "./theme/navigation-hamburger-menu.scss";
import "./theme/post-element.scss";
import "./theme/reddit-post-settings.scss";
import "./theme/reddit-signin.scss";
import "./theme/reddit-watcher-settings.scss";
import "./theme/search-reddit-bar.scss";
import "./theme/side-bar.scss";
import "./theme/single-post-page.scss";
import "./theme/variables.css";
import RouterView from "./page/RouterView";
import { useState } from "react";
import { RootFontSizeContext } from "./context/root-font-size-context.ts";
import AppConfigContextProvider from "./context/provider/app-config-context-provider.tsx";
import ContextMenuContextProvider from "./context/provider/context-menu-context-provider.tsx";
import { PostRowsContextProvider } from "./context/provider/post-rows-context-provider.tsx";
import SearchRedditBarContextProvider from "./context/provider/search-reddit-bar-context-provider.tsx";
import NodeRedProvider from "./context/provider/node-red-provider.tsx";

const App: React.FC = () => {
  const [rootFontSize, rootFontSizeDispatch] = useState(0);
  return (
    <HashRouter>
      <AppConfigContextProvider>
        <ContextMenuContextProvider>
          <PostRowsContextProvider>
            <RootFontSizeContext.Provider
              value={{
                fontSize: rootFontSize,
                rootFontSizeDispatch: rootFontSizeDispatch,
              }}
            >
              <SearchRedditBarContextProvider>
                <NodeRedProvider>
                  <RouterView />
                </NodeRedProvider>
              </SearchRedditBarContextProvider>
            </RootFontSizeContext.Provider>
          </PostRowsContextProvider>
        </ContextMenuContextProvider>
      </AppConfigContextProvider>
    </HashRouter>
  );
};

export default App;
