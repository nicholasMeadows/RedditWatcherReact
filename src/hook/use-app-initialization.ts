import { useCallback, useContext, useState } from "react";
import { AppConfigActionType } from "../reducer/app-config-reducer.ts";
import {
  loadConfig,
  loadSubredditListsFromFile,
  saveConfig,
} from "../service/ConfigService.ts";
import { v4 as uuidV4 } from "uuid";
import { RedditListActionType } from "../reducer/reddit-list-reducer.ts";
import { RedditListDispatchContext } from "../context/reddit-list-context.ts";
import {
  AppConfigDispatchContext,
  AppConfigStateContext,
} from "../context/app-config-context.ts";
import { SubredditLists } from "../model/SubredditList/SubredditLists.ts";
import { REDDIT_SIGN_IN_ROUTE } from "../RedditWatcherConstants.ts";
import { RedditAuthenticationStatus } from "../model/RedditAuthenticationState.ts";
import { RedditClientContext } from "../context/reddit-client-context.ts";
import { useNavigate } from "react-router-dom";
import RedditClient from "../client/RedditClient.ts";
import RedditService from "../service/RedditService.ts";
import RedditServiceContext from "../context/reddit-service-context.ts";
import { SideBarDispatchContext } from "../context/side-bar-context.ts";
import { SideBarActionType } from "../reducer/side-bar-reducer.ts";
import useRedditService from "./use-reddit-service.ts";
import { GetPostsUpdatedValues } from "../model/converter/GetPostsFromSubredditStateConverter.ts";
import { Post } from "../model/Post/Post.ts";
import { Subreddit } from "../model/Subreddit/Subreddit.ts";
import { AppNotificationsDispatchContext } from "../context/app-notifications-context.ts";
import { SubredditQueueDispatchContext } from "../context/sub-reddit-queue-context.ts";
import { PostRowsDispatchContext } from "../context/post-rows-context.ts";

export function useAppInitialization() {
  const appConfig = useContext(AppConfigStateContext);
  const appConfigDispatch = useContext(AppConfigDispatchContext);
  const redditListDispatch = useContext(RedditListDispatchContext);
  const { redditClientContextData, setRedditClientContextData } =
    useContext(RedditClientContext);
  const { masterSubscribedSubredditList } = useContext(RedditServiceContext);
  const sideBarDispatch = useContext(SideBarDispatchContext);
  const appNotificationsDispatch = useContext(AppNotificationsDispatchContext);
  const { subredditIndex, nsfwRedditListIndex, lastPostRowWasSortOrderNew } =
    useContext(RedditServiceContext);
  const subredditQueueDispatch = useContext(SubredditQueueDispatchContext);

  const postRowsDispatch = useContext(PostRowsDispatchContext);

  const { createCurrentStateObj } = useRedditService();
  const navigate = useNavigate();
  const [text, setText] = useState("");

  const loadConfigAsync = useCallback(async () => {
    const loadedConfig = await loadConfig();
    appConfigDispatch({
      type: AppConfigActionType.SET_APP_CONFIG,
      payload: loadedConfig,
    });
  }, [appConfigDispatch]);

  const loadSubredditListsAsync = useCallback(async () => {
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
  }, [redditListDispatch]);

  const authReddit = useCallback(async () => {
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
    }
  }, [
    appConfig,
    navigate,
    redditClientContextData.redditAuthenticationStatus,
    setRedditClientContextData,
  ]);

  const getFirstPostRow = useCallback(async () => {
    const redditService = new RedditService(appConfig.redditCredentials);
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
        subredditIndex,
        nsfwRedditListIndex,
        lastPostRowWasSortOrderNew,
        subredditQueueDispatch,
        appConfig.postsToShowInRow,
        postRowsDispatch,
        sideBarDispatch,
        currentState.subredditLists,
        currentState.subredditSourceOption
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
    appConfig.postsToShowInRow,
    appConfig.redditCredentials,
    lastPostRowWasSortOrderNew,
    nsfwRedditListIndex,
    subredditIndex,
    sideBarDispatch,
    subredditQueueDispatch,
  ]);

  const loadSubscribedSubredditsAndGetFirstPostRow = useCallback(async () => {
    setText("Loading Subscribed Subreddits...");
    const redditService = new RedditService(appConfig.redditCredentials);
    await redditService.loadSubscribedSubreddits(
      masterSubscribedSubredditList,
      appConfig.redditApiItemLimit
    );

    setText("Getting Posts...");
    getFirstPostRow();
    sideBarDispatch({
      type: SideBarActionType.SET_SECONDS_TILL_GETTING_NEXT_POSTS,
      payload: 10,
    });
  }, [
    appConfig.redditApiItemLimit,
    appConfig.redditCredentials,
    getFirstPostRow,
    masterSubscribedSubredditList,
    sideBarDispatch,
  ]);

  return {
    text,
    loadConfigAsync,
    loadSubredditListsAsync,
    authReddit,
    loadSubscribedSubredditsAndGetFirstPostRow,
  };
}
