import { useContext, useEffect, useState } from "react";
import {
  loadConfig,
  loadSubredditListsFromFile,
} from "../service/ConfigService.ts";
import { AppConfig } from "../model/config/AppConfig.ts";
import { SubredditLists } from "../model/SubredditList/SubredditLists.ts";
import {
  POST_ROW_ROUTE,
  REDDIT_SIGN_IN_ROUTE,
} from "../RedditWatcherConstants.ts";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/store.ts";
import { RedditAuthenticationStatus } from "../model/RedditAuthenticationState.ts";
import { setAppConfig } from "../redux/slice/AppConfigSlice.ts";
import { v4 as uuidV4 } from "uuid";
import RedditService from "../service/RedditService.ts";
import { RedditClientContext } from "../context/reddit-client-context.ts";
import { UseRedditClient } from "./use-reddit-client.ts";
import { UseRedditList } from "./use-reddit-list.ts";

export default function useInitializeApp(
  redditService: RedditService,
  redditClient: UseRedditClient,
  redditListsHook: UseRedditList
) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [config, setConfig] = useState<AppConfig | undefined>(undefined);
  const [subredditLists, setSubredditListsState] = useState<
    SubredditLists[] | undefined
  >(undefined);
  const { redditClientContextData } = useContext(RedditClientContext);

  const [initializeAppPageText, setInitializeAppPageText] = useState("");
  const postRowsState = useAppSelector((state) => state.postRows);

  useEffect(() => {
    const init = async () => {
      if (config === undefined) {
        const loadedConfig = await loadConfig();
        dispatch(setAppConfig(loadedConfig));
        setConfig(loadedConfig);
      } else if (subredditLists === undefined) {
        let subredditLists: SubredditLists[] = [];
        try {
          subredditLists = await loadSubredditListsFromFile();
        } catch (e) {
          console.log("Error thrown while loading subreddit lists", e);
        }

        subredditLists.forEach((list) => {
          list.subredditListUuid = uuidV4();
          list.subreddits.map(
            (subreddit) => (subreddit.subredditUuid = uuidV4())
          );
        });
        redditListsHook.setSubredditLists(subredditLists);
        setSubredditListsState(subredditLists);
      } else {
        const redditCredentials = config.redditCredentials;
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
          setInitializeAppPageText("Logging In...");
          redditClient.authenticateReddit();
        } else if (
          redditClientContextData.redditAuthenticationStatus ==
          RedditAuthenticationStatus.AUTHENTICATION_DENIED
        ) {
          navigate(REDDIT_SIGN_IN_ROUTE);
        } else if (postRowsState.postRows.length == 0) {
          setInitializeAppPageText("Getting Posts...");
          if (!redditService.loopingForPosts) {
            redditService.startLoopingForPosts();
          }
        } else {
          navigate(POST_ROW_ROUTE);
        }
      }
    };
    init();
  }, [
    config,
    dispatch,
    navigate,
    postRowsState.postRows.length,
    redditClientContextData.redditAuthenticationStatus,
    redditService,
    subredditLists,
  ]);

  return initializeAppPageText;
}
