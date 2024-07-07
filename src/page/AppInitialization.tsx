import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  loadConfig,
  loadSubredditListsFromFile,
  saveConfig,
} from "../service/ConfigService.ts";
import { AppConfig } from "../model/config/AppConfig.ts";
import { SubredditLists } from "../model/SubredditList/SubredditLists.ts";
import { v4 as uuidV4 } from "uuid";
import {
  POST_ROW_ROUTE,
  REDDIT_SIGN_IN_ROUTE,
} from "../RedditWatcherConstants.ts";
import { RedditAuthenticationStatus } from "../model/RedditAuthenticationState.ts";
import { useNavigate } from "react-router-dom";
import RedditClient from "../client/RedditClient.ts";
import { RedditClientContext } from "../context/reddit-client-context.ts";
import RedditServiceContext from "../context/reddit-service-context.ts";
import RedditService from "../service/RedditService.ts";
import useRedditService from "../hook/use-reddit-service.ts";
import {
  AppConfigDispatchContext,
  AppConfigStateContext,
} from "../context/app-config-context.ts";
import { AppConfigActionType } from "../reducer/app-config-reducer.ts";
import {
  PostRowsContext,
  PostRowsDispatchContext,
} from "../context/post-rows-context.ts";
import { SideBarDispatchContext } from "../context/side-bar-context.ts";
import { SideBarActionType } from "../reducer/side-bar-reducer.ts";
import { RedditListDispatchContext } from "../context/reddit-list-context.ts";
import { RedditListActionType } from "../reducer/reddit-list-reducer.ts";
import { GetPostsUpdatedValues } from "../model/converter/GetPostsFromSubredditStateConverter.ts";
import { AppNotificationsDispatchContext } from "../context/app-notifications-context.ts";
import { SubredditQueueDispatchContext } from "../context/sub-reddit-queue-context.ts";
import { Post } from "../model/Post/Post.ts";
import { Subreddit } from "../model/Subreddit/Subreddit.ts";

const AppInitialization: React.FC = () => {
  const redditListDispatch = useContext(RedditListDispatchContext);
  const sideBarDispatch = useContext(SideBarDispatchContext);
  const appConfigDispatch = useContext(AppConfigDispatchContext);
  const navigate = useNavigate();

  const [config, setConfig] = useState<AppConfig | undefined>(undefined);
  const [subredditLists, setSubredditListsState] = useState<
    SubredditLists[] | undefined
  >(undefined);
  const postRowsState = useContext(PostRowsContext);

  const [text, setText] = useState("");
  const { redditClientContextData, setRedditClientContextData } =
    useContext(RedditClientContext);

  const loadConfigAsync = useCallback(async () => {
    const loadedConfig = await loadConfig();
    appConfigDispatch({
      type: AppConfigActionType.SET_APP_CONFIG,
      payload: loadedConfig,
    });
    setConfig(loadedConfig);
  }, [appConfigDispatch]);

  const loadSubredditListsAsync = useCallback(async () => {
    let subredditListsLocal: SubredditLists[] = [];
    try {
      subredditListsLocal = await loadSubredditListsFromFile();
    } catch (e) {
      console.log("Error thrown while loading subreddit lists", e);
    }

    subredditListsLocal.forEach((list) => {
      list.subredditListUuid = uuidV4();
      list.subreddits.map((subreddit) => (subreddit.subredditUuid = uuidV4()));
    });
    redditListDispatch({
      type: RedditListActionType.SET_SUBREDDIT_LISTS,
      payload: subredditListsLocal,
    });
    setSubredditListsState(subredditListsLocal);
  }, [redditListDispatch]);

  const redditServiceContextState = useContext(RedditServiceContext);

  const redditApiItemLimit = useContext(
    AppConfigStateContext
  ).redditApiItemLimit;
  const redditCredentials = useContext(AppConfigStateContext).redditCredentials;

  const loadSubscribedSubreddits = useCallback(async () => {
    if (
      redditServiceContextState.masterSubscribedSubredditList.current.length ===
      0
    ) {
      const redditService = new RedditService(redditCredentials);
      await redditService.loadSubscribedSubreddits(
        redditServiceContextState.masterSubscribedSubredditList,
        redditApiItemLimit
      );
    }
  }, [
    redditApiItemLimit,
    redditCredentials,
    redditServiceContextState.masterSubscribedSubredditList,
  ]);

  const { createCurrentStateObj } = useRedditService();
  const getFirstPostRowAbortController = useRef<AbortController>(
    new AbortController()
  );
  const appNotificationsDispatch = useContext(AppNotificationsDispatchContext);
  const subredditQueueDispatch = useContext(SubredditQueueDispatchContext);
  const postsToShowInRow = useContext(AppConfigStateContext).postsToShowInRow;
  const postRowsDispatch = useContext(PostRowsDispatchContext);
  const getFirstPostRow = useCallback(async () => {
    getFirstPostRowAbortController.current.signal;
    const redditService = new RedditService(redditCredentials);
    let currentState = createCurrentStateObj();
    const updatedStateValues = {} as GetPostsUpdatedValues;
    let gottenPosts = new Array<Post>();
    let gottenFromSubreddits = new Array<Subreddit>();
    do {
      try {
        currentState = createCurrentStateObj();
        const { posts, fromSubreddits } =
          await redditService.getPostsForPostRow(
            currentState,
            updatedStateValues
          );
        gottenPosts = posts;
        gottenFromSubreddits = fromSubreddits;
      } catch (e) {
        console.log(`Caught error ${e} while getting first post row.`);
      }
      redditService.addPostRow(
        gottenPosts,
        gottenFromSubreddits,
        currentState,
        updatedStateValues,
        appNotificationsDispatch
      );
      redditService.applyUpdatedStateValues(
        updatedStateValues,
        redditServiceContextState.subredditIndex,
        redditServiceContextState.nsfwRedditListIndex,
        redditServiceContextState.lastPostRowWasSortOrderNew,
        subredditQueueDispatch,
        postsToShowInRow,
        postRowsDispatch,
        sideBarDispatch,
        currentState.subredditLists
      );
      if (gottenPosts.length === 0) {
        console.log(
          "Got 0 posts while trying to get first post row. Pausing for 1 second then trying again."
        );
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
      }
    } while (gottenPosts.length === 0);
  }, [
    appNotificationsDispatch,
    createCurrentStateObj,
    postRowsDispatch,
    postsToShowInRow,
    redditCredentials,
    redditServiceContextState.lastPostRowWasSortOrderNew,
    redditServiceContextState.nsfwRedditListIndex,
    redditServiceContextState.subredditIndex,
    sideBarDispatch,
    subredditQueueDispatch,
  ]);

  const authReddit = useCallback(
    async (appConfig: AppConfig) => {
      const redditCredentials = appConfig.redditCredentials;
      if (redditCredentials === undefined) {
        navigate(REDDIT_SIGN_IN_ROUTE);
        return;
      }

      const username = redditCredentials.username;
      const password = redditCredentials.password;
      const clientId = redditCredentials.clientId;
      const clientSecret = redditCredentials.clientSecret;

      if (
        username == "" ||
        password == "" ||
        clientId == "" ||
        clientSecret == ""
      ) {
        navigate(REDDIT_SIGN_IN_ROUTE);
        return;
      }

      if (
        redditClientContextData.redditAuthenticationStatus ==
        RedditAuthenticationStatus.NOT_YET_AUTHED
      ) {
        console.log("Authenticating Reddit");
        setText("Logging In...");

        try {
          if (
            redditCredentials.username != undefined &&
            redditCredentials.password != undefined &&
            redditCredentials.clientId != undefined &&
            redditCredentials.clientSecret != undefined
          ) {
            await new RedditClient(redditCredentials).authenticate();
            saveConfig(appConfig);
            setRedditClientContextData((state) => ({
              ...state,
              redditAuthenticationStatus:
                RedditAuthenticationStatus.AUTHENTICATED,
            }));
            return;
          }
        } catch (e) {
          console.log("Could not log into reddit.", e);
        }
        console.log("Reddit credentials were undefined");
        setRedditClientContextData((state) => ({
          ...state,
          redditAuthenticationStatus:
            RedditAuthenticationStatus.AUTHENTICATION_DENIED,
        }));
      } else if (
        redditClientContextData.redditAuthenticationStatus ==
        RedditAuthenticationStatus.AUTHENTICATION_DENIED
      ) {
        navigate(REDDIT_SIGN_IN_ROUTE);
      } else if (
        postRowsState.postRows.length == 0 &&
        redditServiceContextState.masterSubscribedSubredditList.current
          .length === 0
      ) {
        setText("Loading Subscribed Subreddits...");
        await loadSubscribedSubreddits();
        setText("Getting Posts...");
        getFirstPostRowAbortController.current.abort();
        getFirstPostRowAbortController.current = new AbortController();
        getFirstPostRow();
        sideBarDispatch({
          type: SideBarActionType.SET_SECONDS_TILL_GETTING_NEXT_POSTS,
          payload: 10,
        });
      } else {
        navigate(POST_ROW_ROUTE);
      }
    },
    [
      getFirstPostRow,
      loadSubscribedSubreddits,
      navigate,
      postRowsState.postRows.length,
      redditClientContextData.redditAuthenticationStatus,
      redditServiceContextState.masterSubscribedSubredditList,
      setRedditClientContextData,
      sideBarDispatch,
    ]
  );

  useEffect(() => {
    if (config === undefined) {
      loadConfigAsync();
    } else if (subredditLists === undefined) {
      loadSubredditListsAsync();
    } else {
      authReddit(config);
    }
  }, [
    authReddit,
    config,
    loadConfigAsync,
    loadSubredditListsAsync,
    navigate,
    postRowsState.postRows.length,
    redditClientContextData.redditAuthenticationStatus,
    setRedditClientContextData,
    subredditLists,
  ]);

  return (
    <>
      <div className="app-initialization-wrapper">
        <div className="loader"></div>
        <p className="app-initialization-text">{text}</p>
      </div>
    </>
  );
};

export default AppInitialization;
