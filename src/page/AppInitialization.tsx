import { useCallback, useContext, useEffect, useState } from "react";
import {
  loadConfig,
  loadSubredditListsFromFile,
  saveConfig,
} from "../service/ConfigService.ts";
import { setAppConfig } from "../redux/slice/AppConfigSlice.ts";
import { AppConfig } from "../model/config/AppConfig.ts";
import store, { useAppDispatch, useAppSelector } from "../redux/store.ts";
import { SubredditLists } from "../model/SubredditList/SubredditLists.ts";
import { v4 as uuidV4 } from "uuid";
import { setSubredditLists } from "../redux/slice/RedditListSlice.ts";
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
import { setSecondsTillGettingNextPosts } from "../redux/slice/SideBarSlice.ts";

const AppInitialization: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [config, setConfig] = useState<AppConfig | undefined>(undefined);
  const [subredditLists, setSubredditListsState] = useState<
    SubredditLists[] | undefined
  >(undefined);
  const postRowsState = useAppSelector((state) => state.postRows);

  const [text, setText] = useState("");
  const { redditClientContextData, setRedditClientContextData } =
    useContext(RedditClientContext);

  const loadConfigAsync = useCallback(async () => {
    const loadedConfig = await loadConfig();
    dispatch(setAppConfig(loadedConfig));
    setConfig(loadedConfig);
  }, [dispatch]);

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
    store.dispatch(setSubredditLists(subredditListsLocal));
    setSubredditListsState(subredditListsLocal);
  }, []);

  const redditServiceContextState = useContext(RedditServiceContext);

  const loadSubscribedSubreddits = useCallback(async () => {
    if (
      redditServiceContextState.masterSubscribedSubredditList.current.length ===
      0
    ) {
      const redditService = new RedditService();
      await redditService.loadSubscribedSubreddits(
        redditServiceContextState.masterSubscribedSubredditList
      );
    }
  }, [redditServiceContextState.masterSubscribedSubredditList]);

  const { getPostRow } = useRedditService();
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

        const username = redditCredentials.username;
        const password = redditCredentials.password;
        const clientId = redditCredentials.clientId;
        const clientSecret = redditCredentials.clientSecret;

        try {
          if (
            username != undefined &&
            password != undefined &&
            clientId != undefined &&
            clientSecret != undefined
          ) {
            await new RedditClient().authenticate(
              username,
              password,
              clientId,
              clientSecret
            );
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
        getPostRow();
        dispatch(setSecondsTillGettingNextPosts(10));
      } else {
        navigate(POST_ROW_ROUTE);
      }
    },
    [
      dispatch,
      getPostRow,
      loadSubscribedSubreddits,
      navigate,
      postRowsState.postRows.length,
      redditClientContextData.redditAuthenticationStatus,
      redditServiceContextState.masterSubscribedSubredditList,
      setRedditClientContextData,
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
    dispatch,
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
