import { useEffect, useState } from "react";
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
import store, { useAppDispatch, useAppSelector } from "../redux/store.ts";
import { RedditAuthenticationStatus } from "../model/RedditAuthenticationState.ts";
import { authenticateReddit } from "../redux/slice/RedditClientSlice.ts";
import { startLoopingForPosts } from "../service/RedditService.ts";
import { setAppConfig } from "../redux/slice/AppConfigSlice.ts";
import { v4 as uuidV4 } from "uuid";
import { setSubredditLists } from "../redux/slice/RedditListsSlice.ts";

export default function useInitializeApp() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [config, setConfig] = useState<AppConfig | undefined>(undefined);
  const [subredditLists, setSubredditListsState] = useState<
    SubredditLists[] | undefined
  >(undefined);

  const redditAuthenticationStatus = useAppSelector(
    (state) => state.redditClient.redditAuthenticationStatus
  );

  const postRows = useAppSelector((state) => state.postRows.postRows);
  const [initializeAppPageText, setInitializeAppPageText] = useState("");
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
        dispatch(setSubredditLists(subredditLists));
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
          redditAuthenticationStatus ==
          RedditAuthenticationStatus.NOT_YET_AUTHED
        ) {
          console.log("Authenticating Reddit");
          setInitializeAppPageText("Logging In...");
          dispatch(authenticateReddit());
        } else if (
          redditAuthenticationStatus ==
          RedditAuthenticationStatus.AUTHENTICATION_DENIED
        ) {
          navigate(REDDIT_SIGN_IN_ROUTE);
        } else if (postRows.length == 0) {
          setInitializeAppPageText("Getting Posts...");
          const loopingForPosts = store.getState().redditClient.loopingForPosts;
          if (!loopingForPosts) {
            startLoopingForPosts();
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
    postRows.length,
    redditAuthenticationStatus,
    subredditLists,
  ]);

  return initializeAppPageText;
}
