import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  AppConfigDispatchContext,
  AppConfigStateContext,
} from "../context/app-config-context.ts";
import {
  loadConfig,
  loadSubredditListsFromFile,
  saveConfig,
} from "../service/ConfigService.ts";
import { AppConfigActionType } from "../reducer/app-config-reducer.ts";
import { SubredditLists } from "../model/SubredditList/SubredditLists.ts";
import { v4 as uuidV4 } from "uuid";
import { RedditListActionType } from "../reducer/reddit-list-reducer.ts";
import {
  RedditListDispatchContext,
  RedditListStateContext,
} from "../context/reddit-list-context.ts";
import {
  POST_ROW_ROUTE,
  REDDIT_SIGN_IN_ROUTE,
} from "../RedditWatcherConstants.ts";
import { RedditClientContext } from "../context/reddit-client-context.ts";
import { useNavigate } from "react-router-dom";
import { RedditAuthenticationStatus } from "../model/RedditAuthenticationState.ts";
import RedditClient from "../client/RedditClient.ts";
import useRedditService from "./use-reddit-service.ts";
import { RedditServiceStateContext } from "../context/reddit-service-context.ts";
import { PostRowsContext } from "../context/post-rows-context.ts";
import {
  GetPostsFromSubredditResponse,
  GetPostsFromSubredditState,
} from "../model/converter/GetPostsFromSubredditStateConverter.ts";

enum AppInitializationStepEnum {
  NOT_STARTED,
  LOADING_CONFIG,
  CONFIG_LOADED,
  LOADING_SUBREDDIT_LISTS,
  SUBREDDIT_LISTS_LOADED,
  AUTHENTICATING,
  AUTHENTICATED,
  FETCHING_SUBSCRIBED_SUBREDDITS,
  SUBSCRIBED_SUBREDDITS_LOADED,
  GETTING_FIRST_POST_ROW,
}

export function useAppInitialization() {
  const appInitializationStep = useRef<AppInitializationStepEnum>(
    AppInitializationStepEnum.NOT_STARTED
  );

  const [text, setText] = useState("");

  const appConfigDispatch = useContext(AppConfigDispatchContext);
  const redditListDispatch = useContext(RedditListDispatchContext);
  const appConfig = useContext(AppConfigStateContext);
  const { redditClientContextData, setRedditClientContextData } =
    useContext(RedditClientContext);
  const navigate = useNavigate();
  const { subredditListsLoaded } = useContext(RedditListStateContext);

  const redditService = useRedditService();

  const { masterSubscribedSubredditList } = useContext(
    RedditServiceStateContext
  );
  const { postRows } = useContext(PostRowsContext);

  const loadConfigAsync = useCallback(async () => {
    setText("Loading App Config...");
    console.log("App Initialization - loadConfigAsync");
    const loadedConfig = await loadConfig();
    appConfigDispatch({
      type: AppConfigActionType.SET_APP_CONFIG,
      payload: loadedConfig,
    });
    appInitializationStep.current = AppInitializationStepEnum.CONFIG_LOADED;
  }, [appConfigDispatch]);

  const loadSubredditListsAsync = useCallback(async () => {
    setText("Loading Subreddit Lists...");
    console.log("App Initialization - loadSubredditListsAsync");
    let subredditListsLocal: SubredditLists[] = [];
    try {
      subredditListsLocal = await loadSubredditListsFromFile();
    } catch (e) {
      console.log("Error thrown while loading subreddit lists", e);
    }
    const mappedSubredditLists = subredditListsLocal.map((list) => {
      list.subredditListUuid = uuidV4();
      list.subreddits = list.subreddits.map((subreddit) => ({
        ...subreddit,
        subredditUuid: uuidV4(),
      }));
      return list;
    });
    redditListDispatch({
      type: RedditListActionType.SET_SUBREDDIT_LISTS,
      payload: mappedSubredditLists,
    });
    appInitializationStep.current =
      AppInitializationStepEnum.SUBREDDIT_LISTS_LOADED;
  }, [redditListDispatch]);

  const authReddit = useCallback(async () => {
    setText("Logging in...");
    console.log("App Initialization - authReddit");
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
          appInitializationStep.current =
            AppInitializationStepEnum.AUTHENTICATED;
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
    }
  }, [
    appConfig,
    navigate,
    redditClientContextData.redditAuthenticationStatus,
    setRedditClientContextData,
  ]);

  const fetchSubscribedSubreddits = useCallback(async () => {
    setText("Loading Subscribed Subreddits...");
    await redditService.loadSubscribedSubreddits(appConfig.redditApiItemLimit);
    appInitializationStep.current =
      AppInitializationStepEnum.SUBSCRIBED_SUBREDDITS_LOADED;
  }, [appConfig.redditApiItemLimit, redditService]);

  const getFirstPosts = useCallback(async () => {
    console.log("App Initialization - getFirstPosts");
    let getPostsResponse: GetPostsFromSubredditResponse | undefined = undefined;
    let initialState: GetPostsFromSubredditState | undefined = undefined;
    do {
      try {
        const { getPostsFromSubredditResponse, getPostsFromSubredditState } =
          await redditService.getPostsForPostRow(new AbortController().signal);
        getPostsResponse = getPostsFromSubredditResponse;
        initialState = getPostsFromSubredditState;
      } catch (e) {
        console.log("Caught error while fetching posts for first post row", e);
      }
      if (
        getPostsResponse === undefined ||
        getPostsResponse.posts.length === 0
      ) {
        console.log(
          "Got 0 posts while trying to get first post row. Pausing for 5 second then trying again."
        );
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
      }
    } while (
      getPostsResponse === undefined ||
      getPostsResponse.posts.length === 0
    );

    if (
      getPostsResponse.fromSubreddits !== undefined &&
      initialState !== undefined
    ) {
      redditService.handleGottenPosts(initialState, getPostsResponse);
    }
  }, [redditService]);

  useEffect(() => {
    const step = appInitializationStep.current;
    console.log(`App Initialization - useEffect current step is ${step}`);
    if (
      !appConfig.configLoaded &&
      step === AppInitializationStepEnum.NOT_STARTED
    ) {
      appInitializationStep.current = AppInitializationStepEnum.LOADING_CONFIG;
      loadConfigAsync();
    } else if (
      !subredditListsLoaded &&
      step === AppInitializationStepEnum.CONFIG_LOADED
    ) {
      appInitializationStep.current =
        AppInitializationStepEnum.LOADING_SUBREDDIT_LISTS;
      loadSubredditListsAsync();
    } else if (
      redditClientContextData.redditAuthenticationStatus ===
        RedditAuthenticationStatus.NOT_YET_AUTHED &&
      step === AppInitializationStepEnum.SUBREDDIT_LISTS_LOADED
    ) {
      appInitializationStep.current = AppInitializationStepEnum.AUTHENTICATING;
      authReddit();
    } else if (step === AppInitializationStepEnum.AUTHENTICATED) {
      appInitializationStep.current =
        AppInitializationStepEnum.FETCHING_SUBSCRIBED_SUBREDDITS;
      fetchSubscribedSubreddits();
    } else if (
      step === AppInitializationStepEnum.SUBSCRIBED_SUBREDDITS_LOADED &&
      masterSubscribedSubredditList.length > 0
    ) {
      appInitializationStep.current =
        AppInitializationStepEnum.GETTING_FIRST_POST_ROW;
      getFirstPosts();
    } else if (
      step === AppInitializationStepEnum.GETTING_FIRST_POST_ROW &&
      postRows.length > 0
    ) {
      navigate(POST_ROW_ROUTE);
    }
  }, [
    appConfig.configLoaded,
    appInitializationStep,
    authReddit,
    fetchSubscribedSubreddits,
    getFirstPosts,
    loadConfigAsync,
    loadSubredditListsAsync,
    masterSubscribedSubredditList.length,
    navigate,
    postRows.length,
    redditClientContextData.redditAuthenticationStatus,
    redditService,
    subredditListsLoaded,
  ]);

  return {
    text,
  };
}
