import { CapacitorHttp, HttpResponse } from "@capacitor/core";
import { Buffer } from "buffer";
import { SubredditAccountSearchSeperateArrs } from "../model/SubredditAccountSearchSeperateArrs.ts";
import RedditApiResponse from "../model/RedditApiResponse/RedditApiResponse.ts";
import { T2 } from "../model/RedditApiResponse/Types/T2/T2.ts";
import { T5 } from "../model/RedditApiResponse/Types/T5.ts";
import { SubredditAccountSearchResult } from "../model/SubredditAccountSearchResult.ts";
import {
  convertAccount,
  convertSubreddit,
} from "../model/converter/SubredditAccountSearchResultConverter.ts";
import ChildDataObj from "../model/RedditApiResponse/ChildDataObj.ts";
import { T3 } from "../model/RedditApiResponse/Types/T3/T3.ts";
import { Post } from "../model/Post/Post.ts";
import { convertPost } from "../model/converter/PostConverter.ts";
import TopTimeFrameOptionsEnum from "../model/config/enums/TopTimeFrameOptionsEnum.ts";
import { Subreddit } from "../model/Subreddit/Subreddit.ts";
import { SubredditLists } from "../model/SubredditList/SubredditLists.ts";
import { v4 as uuidV4 } from "uuid";
import { RedditCredentials } from "../model/config/RedditCredentials.ts";
import PostSortOrderOptionsEnum from "../model/config/enums/PostSortOrderOptionsEnum.ts";

const REDDIT_BASE_URL = "https://www.reddit.com";
const REDDIT_OAUTH_BASE_URL = "https://oauth.reddit.com";
const REDDIT_AUTH_ENDPOINT =
  "/api/v1/access_token?grant_type=password&username={username}&password={password}";
const GET_SUBSCRIBED_SUBREDDITS_ENDPOINT =
  "/subreddits/mine/subscriber?limit={limit}";
const SEARCH_REDDIT_ENDPOINT = "/search.json?q={search}&type=user,sr";
const SUBSCRIBE_UNSUBSCRIBE_ENDPOINT =
  "/api/subscribe?action={action}&sr_name={srName}";

let accessToken: string | undefined = undefined;
let accessTokenExpiration: number | undefined = undefined;
let rateLimitRemaining: number | undefined = undefined;
let rateLimitResetsAt: number | undefined = undefined;
export default class RedditClient {
  declare redditCredentials;

  constructor(redditCredentials: RedditCredentials) {
    this.redditCredentials = redditCredentials;
  }

  async authenticate() {
    accessToken = undefined;
    accessTokenExpiration = undefined;
    const username = this.redditCredentials.username.trim();
    const password = this.redditCredentials.password.trim();
    const clientId = this.redditCredentials.clientId.trim();
    const clientSecret = this.redditCredentials.clientSecret.trim();
    const url =
      REDDIT_BASE_URL +
      REDDIT_AUTH_ENDPOINT.replace("{username}", username).replace(
        "{password}",
        password
      );

    const encodedAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64"
    );

    let httpResponse: HttpResponse;
    try {
      httpResponse = await CapacitorHttp.post({
        url: url,
        headers: {
          Authorization: `Basic ${encodedAuth}`,
        },
      });
    } catch (error) {
      throw new Error(`Authentication request failed with reason ${error}`);
    }

    const responseStatusCode = httpResponse.status;
    if (responseStatusCode < 200 || responseStatusCode >= 300) {
      throw new Error(
        `Reddit client responded with bad status code: ${responseStatusCode}, with status reason: ${httpResponse.data}`
      );
    }

    const authResponse = httpResponse.data;
    if (authResponse == null || authResponse["access_token"] == null) {
      throw new Error(
        "Reddit returned ok response but did not contain a access token."
      );
    }

    accessToken = authResponse["access_token"];
    if (accessToken === undefined) {
      throw new Error("Reddit response did not contain access token.");
    }
    const tokenClaim = accessToken.split(".")[1];
    const decodedClaim = Buffer.from(tokenClaim, "base64").toString("ascii");
    const jwtClaim = JSON.parse(decodedClaim);
    accessTokenExpiration = jwtClaim["exp"];
  }

  async getSubscribedSubReddits(
    redditApiItemLimit: number,
    after: string | undefined
  ): Promise<{ after: string | undefined; subreddits: Array<Subreddit> }> {
    const authInfo = await this.getAuthInfo();
    this.checkRateLimits();
    const apiItemLimit = redditApiItemLimit || 25;

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
    postSortOrder: PostSortOrderOptionsEnum,
    topTimeFrame: TopTimeFrameOptionsEnum,
    redditApiItemLimit: number,
    masterSubscribedSubredditList: Array<Subreddit>,
    redditLists: Array<SubredditLists>
  ): Promise<Array<Post>> {
    // CheckIsUserLoggedIn();
    const authInfo = await this.getAuthInfo();
    this.checkRateLimits();

    let queryStr = `?feed=home&limit=${redditApiItemLimit}`;
    let uri = "/";

    const setTopUri = (topTimeFrame: TopTimeFrameOptionsEnum) => {
      queryStr += `&t=${topTimeFrame.toLowerCase()}`;
      uri = "/top";
    };
    const setNewUri = () => {
      uri = "/new";
    };
    const setHotUri = () => {
      uri = "/hot";
    };
    const handlePostSortOrderRandom = () => {
      switch (Math.floor(Math.random() * 3)) {
        case 0:
          setNewUri();
          break;
        case 1:
          setHotUri();
          break;
        case 2:
          {
            const randomIndex = Math.floor(Math.random() * 6);
            let randomTopTimeFrame: TopTimeFrameOptionsEnum =
              TopTimeFrameOptionsEnum.All;
            switch (randomIndex) {
              case 0:
                randomTopTimeFrame = TopTimeFrameOptionsEnum.All;
                break;
              case 1:
                randomTopTimeFrame = TopTimeFrameOptionsEnum.Day;
                break;
              case 2:
                randomTopTimeFrame = TopTimeFrameOptionsEnum.Hour;
                break;
              case 3:
                randomTopTimeFrame = TopTimeFrameOptionsEnum.Year;
                break;
              case 4:
                randomTopTimeFrame = TopTimeFrameOptionsEnum.Week;
                break;
              case 5:
                randomTopTimeFrame = TopTimeFrameOptionsEnum.Month;
                break;
            }
            setTopUri(randomTopTimeFrame);
          }
          break;
      }
    };
    switch (postSortOrder) {
      case PostSortOrderOptionsEnum.Top:
        setTopUri(topTimeFrame);
        break;
      case PostSortOrderOptionsEnum.New:
        setNewUri();
        break;
      case PostSortOrderOptionsEnum.Hot:
        setHotUri();
        break;
      case PostSortOrderOptionsEnum.Random:
        handlePostSortOrderRandom();
        break;
    }
    const url = REDDIT_OAUTH_BASE_URL + uri + queryStr;
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
      const post = convertPost(
        child.data,
        masterSubscribedSubredditList,
        redditLists
      );
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
    masterSubscribedSubredditList: Array<Subreddit>,
    redditLists: Array<SubredditLists>
  ): Promise<Array<Post>> {
    console.log(`getting posts from uri ${uri}`);
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
      const post = convertPost(
        child.data,
        masterSubscribedSubredditList,
        redditLists
      );
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
    const expiration =
      accessTokenExpiration === undefined ? 0 : accessTokenExpiration;
    const secondsSinceEpoch = Date.now() / 1000;

    if (expiration == undefined || secondsSinceEpoch > expiration - 1000) {
      if (
        this.redditCredentials.username != undefined &&
        this.redditCredentials.password != undefined &&
        this.redditCredentials.clientId != undefined &&
        this.redditCredentials.clientSecret != undefined
      ) {
        await this.authenticate();
      }
    }
    return {
      accessToken: accessToken === undefined ? "" : accessToken,
      expiration:
        accessTokenExpiration === undefined ? 0 : accessTokenExpiration,
    };
  }

  private checkRateLimits() {
    if (rateLimitRemaining != undefined && rateLimitResetsAt != undefined) {
      if (Date.now() / 1000 < rateLimitResetsAt && rateLimitRemaining == 0) {
        throw new RangeError("Reddit rate limit remaining is 0");
      }
    }
  }

  private updateRateLimitVariables(response: HttpResponse) {
    const rateLimitRemainingHeader = "x-ratelimit-remaining";
    const rateLimitResetHeader = "x-ratelimit-reset";

    const headers = response.headers;
    const rateLimitRemainingHeaderVal = headers[rateLimitRemainingHeader];
    const rateLimitResetHeaderVal = headers[rateLimitResetHeader];

    if (rateLimitRemainingHeaderVal != undefined) {
      rateLimitRemaining = parseInt(rateLimitRemainingHeaderVal);
    }
    if (rateLimitResetHeaderVal != undefined) {
      rateLimitResetsAt = Date.now() / 1000 + parseInt(rateLimitResetHeaderVal);
    }
  }
}
