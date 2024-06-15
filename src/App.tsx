import { HashRouter } from "react-router-dom";

/* Theme variables */
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

import { Provider } from "react-redux";
import RouterView from "./page/RouterView";
import store from "./redux/store";
import { useState } from "react";
import { RootFontSizeContext } from "./context/root-font-size-context.ts";
import { RedditAuthenticationStatus } from "./model/RedditAuthenticationState.ts";
import {
  RedditClientContext,
  RedditClientContextData,
} from "./context/reddit-client-context.ts";
import AppConfigContextProvider from "./context/provider/app-config-context-provider.tsx";

const App: React.FC = () => {
  const [rootFontSize, setRootFontSize] = useState(0);
  const [redditClientContextData, setRedditClientContextData] =
    useState<RedditClientContextData>({
      redditAuthenticationStatus: RedditAuthenticationStatus.NOT_YET_AUTHED,
    });
  return (
    <Provider store={store}>
      <HashRouter>
        <AppConfigContextProvider>
          <RootFontSizeContext.Provider
            value={{ fontSize: rootFontSize, setRootFontSize: setRootFontSize }}
          >
            <RedditClientContext.Provider
              value={{
                redditClientContextData: redditClientContextData,
                setRedditClientContextData: setRedditClientContextData,
              }}
            >
              <RouterView />
            </RedditClientContext.Provider>
          </RootFontSizeContext.Provider>
        </AppConfigContextProvider>
      </HashRouter>
    </Provider>
  );
};

export default App;
