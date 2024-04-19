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
import { useRef, useState } from "react";
import { RootFontSizeContext } from "./context/root-font-size-context.ts";
import { RedditServiceContext } from "./context/reddit-service-context.ts";
import RedditService from "./service/RedditService.ts";
import { RedditAuthenticationStatus } from "./model/RedditAuthenticationState.ts";
import { SubredditQueueItem } from "./model/Subreddit/SubredditQueueItem.ts";
import {
  RedditClientContext,
  RedditClientContextData,
} from "./context/reddit-client-context.ts";

const App: React.FC = () => {
  const [rootFontSize, setRootFontSize] = useState(0);
  const [redditClientContextData, setRedditClientContextData] =
    useState<RedditClientContextData>({
      redditAuthenticationStatus: RedditAuthenticationStatus.NOT_YET_AUTHED,
      subredditQueue: new Array<SubredditQueueItem>(),
    });
  const redditServiceRef = useRef(new RedditService());
  return (
    <Provider store={store}>
      <HashRouter>
        <RootFontSizeContext.Provider
          value={{ fontSize: rootFontSize, setRootFontSize: setRootFontSize }}
        >
          <RedditServiceContext.Provider value={redditServiceRef.current}>
            <RedditClientContext.Provider
              value={{
                redditClientContextData: redditClientContextData,
                setRedditClientContextData: setRedditClientContextData,
              }}
            >
              <RouterView />
            </RedditClientContext.Provider>
          </RedditServiceContext.Provider>
        </RootFontSizeContext.Provider>
      </HashRouter>
    </Provider>
  );
};

export default App;
