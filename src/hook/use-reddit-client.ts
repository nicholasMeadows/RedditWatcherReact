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
import { SubredditQueueItem } from "../model/Subreddit/SubredditQueueItem.ts";
import { v4 as uuidV4 } from "uuid";
import RedditService from "../service/RedditService.ts";

export type UseRedditClient = {
  subredditQueueRemoveAt: (removeAt: number) => void;
  addSubredditToQueue: (subreddit: Subreddit) => void;
  resetRedditClient: (redditService: RedditService) => void;
  authenticateReddit: () => Promise<void>;
  moveSubredditQueueItemBack: (subredditQueueItemUuid: string) => void;
  removeSubredditQueueItem: (subredditQueueItemUuid: string) => void;
  setMasterSubscribedSubredditList: (
    masterSubscribedSubredditList: Array<Subreddit>
  ) => void;
  moveSubredditQueueItemForward: (subredditQueueItemUuid: string) => void;
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
    subredditQueueRemoveAt: (removeAt: number) => {
      redditClientContextData.subredditQueue.splice(removeAt, 1);
      setRedditClientContextData((state) => ({
        ...state,
        subredditQueue: redditClientContextData.subredditQueue,
      }));
    },
    addSubredditToQueue: (subreddit: Subreddit) => {
      if (
        subreddit.displayNamePrefixed.startsWith("u/") &&
        !subreddit.displayName.startsWith("u_")
      ) {
        subreddit.displayName = "u_" + subreddit.displayName;
      }

      const queueItem: SubredditQueueItem = {
        ...subreddit,
        subredditQueueItemUuid: uuidV4(),
      };
      redditClientContextData.subredditQueue.push(queueItem);
      setRedditClientContextData((state) => ({
        ...state,
        subredditQueue: redditClientContextData.subredditQueue,
      }));
    },
    moveSubredditQueueItemForward: (subredditQueueItemUuid: string) => {
      const foundIndex = redditClientContextData.subredditQueue.findIndex(
        (item) => item.subredditQueueItemUuid == subredditQueueItemUuid
      );
      if (foundIndex > 0) {
        redditClientContextData.subredditQueue[foundIndex] =
          redditClientContextData.subredditQueue.splice(
            foundIndex - 1,
            1,
            redditClientContextData.subredditQueue[foundIndex]
          )[0];
        setRedditClientContextData((state) => ({
          ...state,
          subredditQueue: redditClientContextData.subredditQueue,
        }));
      }
    },
    moveSubredditQueueItemBack: (subredditQueueItemUuid: string) => {
      const foundIndex = redditClientContextData.subredditQueue.findIndex(
        (item) => item.subredditQueueItemUuid == subredditQueueItemUuid
      );
      if (
        foundIndex != -1 &&
        foundIndex != redditClientContextData.subredditQueue.length - 1
      ) {
        redditClientContextData.subredditQueue[foundIndex] =
          redditClientContextData.subredditQueue.splice(
            foundIndex + 1,
            1,
            redditClientContextData.subredditQueue[foundIndex]
          )[0];
        setRedditClientContextData((state) => ({
          ...state,
          subredditQueue: redditClientContextData.subredditQueue,
        }));
      }
    },
    removeSubredditQueueItem: (subredditQueueItemUuid: string) => {
      const updated = redditClientContextData.subredditQueue.filter(
        (item) => item.subredditQueueItemUuid != subredditQueueItemUuid
      );
      setRedditClientContextData((state) => ({
        ...state,
        subredditQueue: updated,
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
