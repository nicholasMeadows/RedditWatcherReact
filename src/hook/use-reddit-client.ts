import store from "../redux/store.ts";
import RedditClient from "../client/RedditClient.ts";
import { saveConfig } from "../service/ConfigService.ts";
import { useContext } from "react";
import {
  RedditClientContext,
  RedditClientContextData,
} from "../context/reddit-client-context.ts";
import { RedditAuthenticationStatus } from "../model/RedditAuthenticationState.ts";
import { Subreddit } from "../model/Subreddit/Subreddit.ts";
import RedditService from "../service/RedditService.ts";

export type UseRedditClient = {
  resetRedditClient: (redditService: RedditService) => void;
  authenticateReddit: () => Promise<void>;
  setMasterSubscribedSubredditList: (
    masterSubscribedSubredditList: Array<Subreddit>
  ) => void;
  getRedditClientContextData: () => RedditClientContextData;
};
export default function useRedditClient(): UseRedditClient {
  const { redditClientContextData, setRedditClientContextData } =
    useContext(RedditClientContext);

  return {
    authenticateReddit: async () => {
      const currentState = store.getState();

      const username = currentState.appConfig.redditCredentials.username;
      const password = currentState.appConfig.redditCredentials.password;
      const clientId = currentState.appConfig.redditCredentials.clientId;
      const clientSecret =
        currentState.appConfig.redditCredentials.clientSecret;

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
          saveConfig(currentState.appConfig);

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
    },
    setMasterSubscribedSubredditList: (
      masterSubscribedSubredditList: Array<Subreddit>
    ) => {
      setRedditClientContextData((state) => ({
        ...state,
        masterSubscribedSubredditList: masterSubscribedSubredditList,
      }));
    },
    resetRedditClient: (redditService: RedditService) => {
      clearTimeout(redditService.loopingForPostsTimeout);
      redditService.loopingForPosts = false;
      redditService.loopingForPostsTimeout = undefined;
      setRedditClientContextData((state) => {
        return {
          ...state,
          redditAuthenticationStatus: RedditAuthenticationStatus.NOT_YET_AUTHED,
        };
      });
    },
    getRedditClientContextData: () => {
      return redditClientContextData;
    },
  };
}
