import { CapacitorHttp, HttpResponse } from "@capacitor/core";
import { Buffer } from "buffer";
import { v4 as uuidV4 } from "uuid";
import { Post } from "../model/Post/Post";
import ChildDataObj from "../model/RedditApiResponse/ChildDataObj";
import RedditApiResponse from "../model/RedditApiResponse/RedditApiResponse";
import { T2 } from "../model/RedditApiResponse/Types/T2/T2";
import { T3 } from "../model/RedditApiResponse/Types/T3/T3";
import { T5 } from "../model/RedditApiResponse/Types/T5";
import { Subreddit } from "../model/Subreddit/Subreddit";
import { SubredditAccountSearchResult } from "../model/SubredditAccountSearchResult";
import { SubredditAccountSearchSeperateArrs } from "../model/SubredditAccountSearchSeperateArrs";
import UserFrontPagePostSortOrderOptionsEnum from "../model/config/enums/UserFrontPagePostSortOrderOptionsEnum";
import { convertPost } from "../model/converter/PostConverter";
import {
  convertAccount,
  convertSubreddit,
} from "../model/converter/SubredditAccountSearchResultConverter";
// import store from "../redux/store";
import { GetPostsFromSubredditState } from "../model/converter/GetPostsFromSubredditStateConverter.ts";
import store from "../redux/store.ts";

const REDDIT_BASE_URL = "https://www.reddit.com";
const REDDIT_OAUTH_BASE_URL = "https://oauth.reddit.com";
const REDDIT_AUTH_ENDPOINT =
  "/api/v1/access_token?grant_type=password&username={username}&password={password}";
const GET_SUBSCRIBED_SUBREDDITS_ENDPOINT =
  "/subreddits/mine/subscriber?limit={limit}";
const SEARCH_REDDIT_ENDPOINT = "/search.json?q={search}&type=user,sr";
const SUBSCRIBE_UNSUBSCRIBE_ENDPOINT =
  "/api/subscribe?action={action}&sr_name={srName}";

const ACCESS_TOKEN_SESSION_STORAGE_KEY = "REDDIT_WATCHER_REDDIT_ACCESS_TOKEN";
const ACCESS_TOKEN_EXPIRATION_SESSION_STORAGE_KEY =
  "REDDIT_WATCHER_REDDIT_ACCESS_TOKEN_EXPIRATION";
const RATE_LIMIT_REMAINING_SESSION_STORAGE_KEY =
  "REDDIT_WATCHER_RATE_LIMIT_REMAINING";
const RATE_LIMIT_RESETS_AT_SESSION_STORAGE_KEY =
  "REDDIT_WATCHER_RATE_LIMIT_RESETS_AT";
const RATE_LIMIT_USED_SESSION_STORAGE_KEY = "REDDIT_WATCHER_RATE_LIMIT_USED";

export default class RedditClient {
  authenticate(
    username: string,
    password: string,
    clientId: string,
    clientSecret: string
  ): Promise<{ accessToken: string; expiration: number }> {
    return new Promise((resolve, reject) => {
      sessionStorage.removeItem(ACCESS_TOKEN_SESSION_STORAGE_KEY);
      username = username.trim();
      password = password.trim();
      clientId = clientId.trim();
      clientSecret = clientSecret.trim();
      const url =
        REDDIT_BASE_URL +
        REDDIT_AUTH_ENDPOINT.replace("{username}", username).replace(
          "{password}",
          password
        );

      const encodedAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
        "base64"
      );

      CapacitorHttp.post({
        url: url,
        headers: {
          Authorization: `Basic ${encodedAuth}`,
        },
      })
        .then((response) => {
          if (response.status >= 200 && response.status < 300) {
            const authResponse = response.data;
            if (authResponse == null || authResponse["access_token"] == null) {
              reject(
                "Reddit returned ok response but did not contain a access token."
              );
              return;
            }

            const accessToken = authResponse["access_token"];
            const tokenClaim = accessToken?.split(".")[1];
            const decodedClaim = Buffer.from(tokenClaim, "base64").toString(
              "ascii"
            );
            const jwtClaim = JSON.parse(decodedClaim);
            const expiration = jwtClaim["exp"];
            resolve({ accessToken: accessToken, expiration: expiration });
          } else {
            reject(
              `Reddit client responded with bad status code: ${response.status}, with status reason: ${response.data}`
            );
          }
        })
        .catch((reason) => {
          reject(`Authentication request failed with readon ${reason}`);
        });
    });
  }

  async getSubscribedSubReddits(
    after: string | undefined
  ): Promise<{ after: string | undefined; subreddits: Array<Subreddit> }> {
    const authInfo = await this.getAuthInfo();
    this.checkRateLimits();
    const state = store.getState();
    const apiItemLimit = state.appConfig.redditApiItemLimit || 25;

    let url =
      REDDIT_OAUTH_BASE_URL +
      GET_SUBSCRIBED_SUBREDDITS_ENDPOINT.replace(
        "{limit}",
        apiItemLimit.toString()
      );

    if (after != undefined) {
      url += "&after=" + after;
    }

    const response = await CapacitorHttp.get({
      url: url,
      headers: {
        Authorization: `Bearer ${authInfo?.accessToken}`,
        // "User-Agent": "Redditwatcer App",
      },
    });

    if (response.status < 200 || response.status > 300) {
      throw new RangeError(
        `Get subreddits request failed with status code ${response.status} with status message ${response.data}`
      );
    }
    const responseObj: RedditApiResponse<T5> = response.data;

    this.updateRateLimitVariables(response);
    after = responseObj.data.after;

    const subreddits = new Array<Subreddit>();

    const children: Array<ChildDataObj<T5>> = responseObj.data.children;
    children.forEach((child) => {
      const subredditData = child.data;
      subreddits.push({
        displayName: subredditData.display_name,
        displayNamePrefixed: subredditData.display_name_prefixed,
        subscribers: subredditData.subscribers,
        over18: subredditData.over18,
        isSubscribed: subredditData.user_is_subscriber,
        fromList: "",
        subredditUuid: uuidV4(),
        isUser: subredditData.display_name_prefixed.startsWith("u_"),
      });
    });
    return { after: after, subreddits: subreddits };
  }

  async getUserFrontPage(
    getPostsFromSubredditsState: GetPostsFromSubredditState,
    masterSubscribedSubredditList: Array<Subreddit>
  ): Promise<Array<Post>> {
    // CheckIsUserLoggedIn();
    const authInfo = await this.getAuthInfo();
    this.checkRateLimits();

    let uri = REDDIT_OAUTH_BASE_URL + "/";
    switch (getPostsFromSubredditsState.userFrontPagePostSortOrderOption) {
      case UserFrontPagePostSortOrderOptionsEnum.Top:
        uri = "/top?t=" + getPostsFromSubredditsState.topTimeFrame;
        break;
      case UserFrontPagePostSortOrderOptionsEnum.New:
        uri = "/new";
        break;
      case UserFrontPagePostSortOrderOptionsEnum.Hot:
        uri = "/hot";
        break;
      case UserFrontPagePostSortOrderOptionsEnum.Random:
        uri = "/";
        break;
    }

    uri += "?limit=" + getPostsFromSubredditsState.redditApiItemLimit;
    const url = REDDIT_OAUTH_BASE_URL + uri;
    console.log("Getting User front page @ URL: ", url);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authInfo?.accessToken}`,
        // "User-Agent": "Redditwatcer App",
      },
    });

    if (response.status < 200 || response.status > 300) {
      throw new RangeError(
        "Get user front page returned a not OK error: " + response.statusText
      );
    }

    const redditResponse: RedditApiResponse<T3> = await response.json();
    const posts = new Array<Post>();

    const children: Array<ChildDataObj<T3>> = redditResponse.data.children;

    children.forEach((child) => {
      const post = convertPost(child.data, masterSubscribedSubredditList);
      if (
        post != null &&
        post.attachments != null &&
        post.attachments.length > 0
      ) {
        posts.push(post);
      }
    });

    return posts;
  }

  async getPostsForSubredditUri(
    uri: string,
    masterSubscribedSubredditList: Array<Subreddit>
  ): Promise<Array<Post>> {
    // CheckIsUserLoggedIn();
    const authInfo = await this.getAuthInfo();
    this.checkRateLimits();

    const url = REDDIT_OAUTH_BASE_URL + uri;
    const response = await CapacitorHttp.get({
      url: url,
      headers: {
        Authorization: `Bearer ${authInfo?.accessToken}`,
      },
    });

    if (response.status < 200 || response.status > 300) {
      throw new RangeError(
        `Reddit responded with ${response.status} status code.`
      );
    }
    this.updateRateLimitVariables(response);
    const responseObj: RedditApiResponse<T3> = response.data;
    const children: Array<ChildDataObj<T3>> = responseObj.data.children;
    const posts = new Array<Post>();
    children.forEach((child) => {
      const post = convertPost(child.data, masterSubscribedSubredditList);
      if (
        post != undefined &&
        post.attachments != undefined &&
        post.attachments.length > 0
      ) {
        posts.push(post);
      }
    });
    return posts;
  }

  async callSearchRedditForSubRedditAndUser(
    searchTerm: string
  ): Promise<SubredditAccountSearchSeperateArrs> {
    // CheckIsUserLoggedIn();
    const authInfo = await this.getAuthInfo();
    this.checkRateLimits();

    const url =
      REDDIT_OAUTH_BASE_URL +
      SEARCH_REDDIT_ENDPOINT.replace("{search}", searchTerm);
    const response = await CapacitorHttp.get({
      url: url,
      headers: {
        Authorization: `Bearer ${authInfo?.accessToken}`,
        // "User-Agent": "Redditwatcer App",
      },
    });
    if (response.status < 200 || response.status > 300) {
      throw new RangeError(
        "Search subreddit returned not ok response: " + response.data
      );
    }
    this.updateRateLimitVariables(response);

    const redditResponse: RedditApiResponse<T2 | T5> = response.data;
    const users = new Array<SubredditAccountSearchResult>();
    const subreddits = new Array<SubredditAccountSearchResult>();
    const children: Array<ChildDataObj<T2 | T5>> = redditResponse.data.children;
    children.forEach((child) => {
      const serializedObj = child.data;

      if (serializedObj != null) {
        const kind = child.kind;
        if ("t2" == kind) {
          const t2 = serializedObj as T2;
          if (t2["is_suspended"] == undefined && t2["subreddit"] != undefined) {
            users.push(convertAccount(t2));
          }
        }
        if ("t5" == kind) {
          const t5 = serializedObj as T5;
          subreddits.push(convertSubreddit(t5));
        }
      }
    });

    return { users: users, subreddits: subreddits };
  }

  async callUnsubscribe(name: string) {
    const authInfo = await this.getAuthInfo();
    // CheckIsUserLoggedIn();
    this.checkRateLimits();
    const url =
      REDDIT_OAUTH_BASE_URL +
      SUBSCRIBE_UNSUBSCRIBE_ENDPOINT.replace("{action}", "unsub").replace(
        "{srName}",
        name
      );
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authInfo?.accessToken}`,
        // "User-Agent": "Redditwatcer App",
      },
    });
    if (response.status < 200 || response.status > 300) {
      throw new RangeError(
        "Subscribe POST to sunsubscribe returned NOT OK status: " +
          response.statusText
      );
    }
    return;
  }

  async callSubscribe(name: string) {
    const authInfo = await this.getAuthInfo();

    // CheckIsUserLoggedIn();
    this.checkRateLimits();
    const url =
      REDDIT_OAUTH_BASE_URL +
      SUBSCRIBE_UNSUBSCRIBE_ENDPOINT.replace("{action}", "sub").replace(
        "{srName}",
        name
      );
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authInfo?.accessToken}`,
        // "User-Agent": "Redditwatcer App",
      },
    });
    if (response.status < 200 || response.status > 300) {
      throw new RangeError(
        "Subscribe POST to subscribereturned NOT OK status: " +
          response.statusText
      );
    }
    return;
  }

  private async getAuthInfo(): Promise<{
    accessToken: string;
    expiration: number;
  }> {
    const expiration = parseInt(
      sessionStorage.getItem(ACCESS_TOKEN_EXPIRATION_SESSION_STORAGE_KEY) || "0"
    );
    const state = store.getState();
    const secondsSinceEpoch = Date.now() / 1000;

    if (expiration == undefined || secondsSinceEpoch > expiration - 1000) {
      const username = state.appConfig.redditCredentials.username;
      const password = state.appConfig.redditCredentials.password;
      const clientId = state.appConfig.redditCredentials.clientId;
      const clientSecret = state.appConfig.redditCredentials.clientSecret;
      if (
        username != undefined &&
        password != undefined &&
        clientId != undefined &&
        clientSecret != undefined
      ) {
        const authInfo = await this.authenticate(
          username,
          password,
          clientId,
          clientSecret
        );
        sessionStorage.setItem(
          ACCESS_TOKEN_SESSION_STORAGE_KEY,
          authInfo.accessToken
        );
        sessionStorage.setItem(
          ACCESS_TOKEN_EXPIRATION_SESSION_STORAGE_KEY,
          authInfo.expiration.toString()
        );
        return authInfo;
      }
    }
    return {
      accessToken:
        sessionStorage.getItem(ACCESS_TOKEN_SESSION_STORAGE_KEY) || "",
      expiration:
        parseInt(
          sessionStorage.getItem(ACCESS_TOKEN_EXPIRATION_SESSION_STORAGE_KEY) ||
            "0"
        ) || 0,
    };
  }

  private checkRateLimits() {
    const rateLimitResetsAtEpoch = parseInt(
      sessionStorage.getItem(RATE_LIMIT_RESETS_AT_SESSION_STORAGE_KEY) || "0"
    );
    const rateLimitRemaining = parseInt(
      sessionStorage.getItem(RATE_LIMIT_REMAINING_SESSION_STORAGE_KEY) || "0"
    );
    if (
      rateLimitRemaining != undefined &&
      rateLimitResetsAtEpoch != undefined
    ) {
      if (
        Date.now() / 1000 < rateLimitResetsAtEpoch &&
        rateLimitRemaining == 0
      ) {
        throw new RangeError("Reddit rate limit remaining is 0");
      }
    }
  }

  private updateRateLimitVariables(response: HttpResponse) {
    const rateLimitRemainingHeader = "x-ratelimit-remaining";
    const rateLimitUsedHeader = "x-ratelimit-used";
    const rateLimitResetHeader = "x-ratelimit-reset";

    const headers = response.headers;
    const rateLimitRemaining = headers[rateLimitRemainingHeader];
    const rateLimitUsed = headers[rateLimitUsedHeader];
    const rateLimitReset = headers[rateLimitResetHeader];

    if (rateLimitRemaining != undefined) {
      sessionStorage.setItem(
        RATE_LIMIT_REMAINING_SESSION_STORAGE_KEY,
        rateLimitRemaining
      );
    }
    if (rateLimitUsed != undefined) {
      sessionStorage.setItem(
        RATE_LIMIT_USED_SESSION_STORAGE_KEY,
        rateLimitUsed
      );
    }
    if (rateLimitReset != undefined) {
      const rateResetsAt = Date.now() / 1000 + rateLimitReset;
      sessionStorage.setItem(
        RATE_LIMIT_RESETS_AT_SESSION_STORAGE_KEY,
        rateResetsAt
      );
    }
  }
}
