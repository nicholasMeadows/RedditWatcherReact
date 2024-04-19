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
import { SinglePostPageContext } from "./context/single-post-page-context.ts";
import { RedditServiceContext } from "./context/reddit-service-context.ts";
import RedditService from "./service/RedditService.ts";
import { SideBarContext, SideBarFields } from "./context/side-bar-context.ts";
import { Subreddit } from "./model/Subreddit/Subreddit.ts";
import { SubredditLists } from "./model/SubredditList/SubredditLists.ts";
import { SIDE_BAR_SUBREDDIT_LIST_FILTER_NOT_SELECTED } from "./RedditWatcherConstants.ts";
import { PostRow } from "./model/PostRow.ts";
import {
  PostRowsContext,
  PostRowsContextData,
} from "./context/post-rows-context.ts";
import { RedditAuthenticationStatus } from "./model/RedditAuthenticationState.ts";
import { SubredditQueueItem } from "./model/Subreddit/SubredditQueueItem.ts";
import {
  RedditClientContext,
  RedditClientContextData,
} from "./context/reddit-client-context.ts";
import RedditListContextData, {
  RedditListContext,
} from "./context/reddit-list-context.ts";

const App: React.FC = () => {
  const [rootFontSize, setRootFontSize] = useState(0);
  const [singlePostPagePostRowUuid, setSinglePostPagePostRowUuid] = useState<
    string | undefined
  >(undefined);
  const [singlePostPagePostUuid, setSinglePostPagePostUuid] = useState<
    string | undefined
  >(undefined);

  const [sidebarContextData, setSidebarContextData] = useState<SideBarFields>({
    subredditsToShowInSideBar: new Array<Subreddit>(),
    subredditsToShow: new Array<Subreddit>(),
    mostRecentSubredditGotten: undefined,
    availableSubredditListsForFilter: new Array<SubredditLists>(),
    listToFilterByUuid: SIDE_BAR_SUBREDDIT_LIST_FILTER_NOT_SELECTED,
    searchInput: "",
    sideBarOpen: false,
    openSidebarButtonTopPercent: 50,
    mouseOverSubredditList: false,
    timeTillNextGetPostsSeconds: 0,
  });

  const [postRowsContextData, setPostRowsContextData] =
    useState<PostRowsContextData>({
      getPostRowsPaused: false,
      getPostRowsPausedTimeout: undefined,
      currentPath: "",
      scrollY: 0,
      clickedOnPlayPauseButton: false,
      postRowsHasAtLeast1PostRow: false,
      postRows: new Array<PostRow>(),
      postCardWidthPercentage: 0,
      postRowContentWidthPx: 0,
    });

  const [redditClientContextData, setRedditClientContextData] =
    useState<RedditClientContextData>({
      redditAuthenticationStatus: RedditAuthenticationStatus.NOT_YET_AUTHED,
      subredditQueue: new Array<SubredditQueueItem>(),
    });
  const redditServiceRef = useRef(new RedditService());

  const [redditListContextData, setRedditListContextData] =
    useState<RedditListContextData>({
      subredditLists: [],
      modifyListMode: undefined,
      showModifyListBox: false,
      modifyListBoxTitle: "",
      createUpdateInputValue: "",
      createUpdateInputValidationError: "",
      createUpdateButtonText: "",
      updatingListUuid: undefined,
    });
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
            <RedditServiceContext.Provider value={redditServiceRef.current}>
              <SideBarContext.Provider
                value={{
                  sidebarContextData: sidebarContextData,
                  setSidebarContextData: setSidebarContextData,
                }}
              >
                <PostRowsContext.Provider
                  value={{
                    postRowsContextData: postRowsContextData,
                    setPostRowsContextData: setPostRowsContextData,
                  }}
                >
                  <RedditClientContext.Provider
                    value={{
                      redditClientContextData: redditClientContextData,
                      setRedditClientContextData: setRedditClientContextData,
                    }}
                  >
                    <RedditListContext.Provider
                      value={{
                        redditListContextData: redditListContextData,
                        setRedditListContextData: setRedditListContextData,
                      }}
                    >
                      <RouterView />
                    </RedditListContext.Provider>
                  </RedditClientContext.Provider>
                </PostRowsContext.Provider>
              </SideBarContext.Provider>
            </RedditServiceContext.Provider>
          </SinglePostPageContext.Provider>
        </RootFontSizeContext.Provider>
      </HashRouter>
    </Provider>
  );
};

export default App;
