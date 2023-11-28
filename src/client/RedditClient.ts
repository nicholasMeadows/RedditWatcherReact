import { Buffer } from "buffer";
import store from "../redux/store";
import {
  setAccessToken,
  setAccessTokenExpiration,
  setRateLimitRemaining,
  setRateLimitResetsAtEpoch,
  setRateLimitUsed,
} from "../redux/slice/RedditClientSlice";
import { Subreddit } from "../model/Subreddit/Subreddit";
import { Post } from "../model/Post/Post";
import { convertPost } from "../model/converter/PostConverter";
import UserFrontPagePostSortOrderOptionsEnum from "../model/config/enums/UserFrontPagePostSortOrderOptionsEnum";
import { SubredditAccountSearchResult } from "../model/SubredditAccountSearchResult";
import {
  convertAccount,
  convertSubreddit,
} from "../model/converter/SubredditAccountSearchResultConverter";
import { v4 as uuidV4 } from "uuid";
import RedditApiResponse from "../model/RedditApiResponse/RedditApiResponse";
import { T3 } from "../model/RedditApiResponse/Types/T3/T3";
import ChildDataObj from "../model/RedditApiResponse/ChildDataObj";
import { T5 } from "../model/RedditApiResponse/Types/T5";
import { T2 } from "../model/RedditApiResponse/Types/T2/T2";

const REDDIT_BASE_URL = "https://www.reddit.com";
const REDDIT_OAUTH_BASE_URL = "https://oauth.reddit.com";
const REDDIT_AUTH_ENDTPOINT =
  "/api/v1/access_token?grant_type=password&username={username}&password={password}";
const GET_SUBSCRIBED_SUBREDDITS_ENDPOINT =
  "/subreddits/mine/subscriber?limit={limit}";
const SEARCH_REDDIT_ENDPOINT = "/search.json?q={search}&type=user,sr";
const SUBSCRIBE_UNSUBSCRIBE_ENDPOINT =
  "/api/subscribe?action={action}&sr_name={srName}";

export default function authenticate(
  username: string,
  password: string,
  clientId: string,
  clientSecret: string
): Promise<{ accessToken: string; expiration: number }> {
  return new Promise((resolve, reject) => {
    store.dispatch(setAccessToken(undefined));
    username = username.trim();
    password = password.trim();
    clientId = clientId.trim();
    clientSecret = clientSecret.trim();
    const url =
      REDDIT_BASE_URL +
      REDDIT_AUTH_ENDTPOINT.replace("{username}", username).replace(
        "{password}",
        password
      );

    const encodedAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64"
    );

    fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${encodedAuth}`,
        "User-Agent": "Redditwatcer App",
      },
    })
      .then((response) => {
        if (response.status >= 200 && response.status < 300) {
          response.text().then((responseBody) => {
            const authResponse = JSON.parse(responseBody);

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
          });
        } else {
          reject(
            `Reddit client responded with bad status code: ${response.status}, with status reason: ${response.statusText}`
          );
        }
      })
      .catch((reason) => {
        reject(`Authentication request failed with readon ${reason}`);
      });
  });
}

export async function getSubscribedSubReddits(
  after: string | undefined
): Promise<{ after: string | undefined; subreddits: Array<Subreddit> }> {
  const authInfo = await getAuthInfo();
  checkRateLimits();
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

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${authInfo?.accessToken}`,
      "User-Agent": "Redditwatcer App",
    },
  });

  if (response.status < 200 || response.status > 300) {
    throw new RangeError(
      `Get subreddits request failed with status code ${response.status} with status message ${response.statusText}`
    );
  }
  const responseObj: RedditApiResponse<T5> = await response.json();

  updateRateLimitVariables(response);
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
    });
  });
  return { after: after, subreddits: subreddits };
}

export async function getUserFrontPage(): Promise<Array<Post>> {
  // CheckIsUserLoggedIn();
  const authInfo = await getAuthInfo();
  checkRateLimits();
  const state = store.getState();

  const userFrontPageEnum = state.appConfig.userFrontPagePostSortOrderOption;
  const topTimeFrame = state.appConfig.topTimeFrameOption;
  let uri = REDDIT_OAUTH_BASE_URL + "/";
  switch (userFrontPageEnum) {
    case UserFrontPagePostSortOrderOptionsEnum.Top:
      uri = "/top?t=" + topTimeFrame;
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

  uri += "?limit=" + state.appConfig.redditApiItemLimit;
  const url = REDDIT_OAUTH_BASE_URL + uri;
  console.log("Getting User front page @ URL: ", url);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${authInfo?.accessToken}`,
      "User-Agent": "Redditwatcer App",
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
    const post = convertPost(child.data);
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

export async function getPostsForSubredditUri(
  uri: string
): Promise<Array<Post>> {
  // CheckIsUserLoggedIn();
  const authInfo = await getAuthInfo();
  checkRateLimits();

  const url = REDDIT_OAUTH_BASE_URL + uri;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${authInfo?.accessToken}`,
      "User-Agent": "Redditwatcer App",
    },
  });

  if (response.status < 200 || response.status > 300) {
    throw new RangeError(
      "Get posts for subreddit did not return OK response: " +
        response.statusText
    );
  }
  updateRateLimitVariables(response);
  const responseObj: RedditApiResponse<T3> = await response.json();
  const children: Array<ChildDataObj<T3>> = responseObj.data.children;
  const posts = new Array<Post>();
  children.forEach((child) => {
    const post = convertPost(child.data);
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

export async function callSearchRedditForSubRedditAndUser(
  searchTerm: string
): Promise<Array<SubredditAccountSearchResult>> {
  // CheckIsUserLoggedIn();
  const authInfo = await getAuthInfo();
  checkRateLimits();

  const url =
    REDDIT_OAUTH_BASE_URL +
    SEARCH_REDDIT_ENDPOINT.replace("{search}", searchTerm);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${authInfo?.accessToken}`,
      "User-Agent": "Redditwatcer App",
    },
  });
  if (response.status < 200 || response.status > 300) {
    throw new RangeError(
      "Search subreddit returned not ok response: " + response.statusText
    );
  }
  updateRateLimitVariables(response);

  const redditResponse: RedditApiResponse<T2 | T5> = await response.json();
  const results = new Array<SubredditAccountSearchResult>();
  const children: Array<ChildDataObj<T2 | T5>> = redditResponse.data.children;
  children.forEach((child) => {
    const serializedObj = child.data;

    if (serializedObj != null) {
      const kind = child.kind;
      if ("t2" == kind) {
        const t2 = serializedObj as T2;
        if (t2["is_suspended"] == undefined && t2["subreddit"] != undefined) {
          results.push(convertAccount(t2));
        }
      }
      if ("t5" == kind) {
        const t5 = serializedObj as T5;
        results.push(convertSubreddit(t5));
      }
    }
  });

  return results;
}

export async function callUnsubscribe(name: string) {
  const authInfo = await getAuthInfo();
  // CheckIsUserLoggedIn();
  checkRateLimits();
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
      "User-Agent": "Redditwatcer App",
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

export async function callSubscribe(name: string) {
  const authInfo = await getAuthInfo();

  // CheckIsUserLoggedIn();
  checkRateLimits();
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
      "User-Agent": "Redditwatcer App",
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

async function getAuthInfo(): Promise<{
  accessToken: string;
  expiration: number;
}> {
  const state = store.getState();
  const expiration = state.redditClient.accessTokenExpiration;
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
      const authInfo = await authenticate(
        username,
        password,
        clientId,
        clientSecret
      );
      store.dispatch(setAccessToken(authInfo.accessToken));
      store.dispatch(setAccessTokenExpiration(authInfo.expiration));
      return authInfo;
    }
  }
  return {
    accessToken: state.redditClient.accessToken || "",
    expiration: state.redditClient.accessTokenExpiration || 0,
  };
}

function checkRateLimits() {
  const state = store.getState();
  const rateLimitResetsAtEpoch = state.redditClient.rateLimitResetsAtEpoch;
  const rateLimitRemaining = state.redditClient.rateLimitRemaining;
  if (rateLimitRemaining != undefined && rateLimitResetsAtEpoch != undefined) {
    if (Date.now() / 1000 < rateLimitResetsAtEpoch && rateLimitRemaining == 0) {
      throw new RangeError("Reddit rate limit remaining is 0");
    }
  }
}

function updateRateLimitVariables(response: Response) {
  const rateLimitRemainingHeader = "x-ratelimit-remaining";
  const rateLimitUsedHeader = "x-ratelimit-used";
  const rateLimitResetHeader = "x-ratelimit-reset";

  const headers = response.headers;
  const rateLimitRemaining = headers.get(rateLimitRemainingHeader);
  const rateLimitUsed = headers.get(rateLimitUsedHeader);
  const rateLimitReset = headers.get(rateLimitResetHeader);

  if (rateLimitRemaining != undefined) {
    store.dispatch(setRateLimitRemaining(rateLimitRemaining));
  }
  if (rateLimitUsed != undefined) {
    store.dispatch(setRateLimitUsed(rateLimitUsed));
  }
  if (rateLimitReset != undefined) {
    const rateResetsAt = Date.now() / 1000 + rateLimitReset;
    store.dispatch(setRateLimitResetsAtEpoch(rateResetsAt));
  }
}
