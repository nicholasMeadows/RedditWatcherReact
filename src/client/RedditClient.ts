import { CapacitorHttp, HttpResponse } from "@capacitor/core";
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
import { PostConverterFilteringOptions } from "../model/config/PostConverterFilteringOptions.ts";
import StringUtil from "../util/StringUtil.ts";
import {
    FAILED_TO_PARSE_REDDIT_API_RESPONSE_FRIENDLY_ERROR_MESSAGE,
    HTTP_REQUEST_FAILED_FRIENDLY_ERROR_MESSAGE,
    HTTP_REQUEST_FAILED_WITH_STATUS_FRIENDLY_ERROR_MESSAGE,
    UNABLE_TO_GET_AUTH_INFO_FRIENDLY_ERROR_MESSAGE
} from "../RedditWatcherConstants.ts";

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
    return new Promise<void>((resolve, reject) => {
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

      const encodedAuth = btoa(`${clientId}:${clientSecret}`);

      CapacitorHttp.post({
        url: url,
        headers: {
          Authorization: `Basic ${encodedAuth}`,
        },
      })
        .then((httpResponse) => {
          const responseStatusCode = httpResponse.status;
          if (responseStatusCode < 200 || responseStatusCode >= 300) {
            reject(
              new Error(
                `Reddit client responded with bad status code: ${responseStatusCode}, with status reason: ${httpResponse.data}`
              )
            );
            return;
          }

          const authResponse = httpResponse.data;
          if (authResponse == null || authResponse["access_token"] == null) {
            reject(
              new Error(
                "Reddit returned ok response but did not contain a access token."
              )
            );
            return;
          }

          accessToken = authResponse["access_token"];
          if (accessToken === undefined) {
            reject(new Error("Reddit response did not contain access token."));
            return;
          }
          const tokenClaim = accessToken.split(".")[1];
          const decodedClaim = atob(tokenClaim)
          const jwtClaim = JSON.parse(decodedClaim);
          accessTokenExpiration = jwtClaim["exp"];
          resolve();
        })
        .catch((error) => {
          reject(
            new Error(`Authentication request failed with reason ${error}`)
          );
        });
    });
  }

  async getSubscribedSubReddits(
    redditApiItemLimit: number,
    after: string | undefined
  ): Promise<{ after: string | undefined; subreddits: Array<Subreddit> }> {
    return new Promise<{
      after: string | undefined;
      subreddits: Array<Subreddit>;
    }>((resolve, reject) => {
      this.getAuthInfo()
        .then((authInfo) => {
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

          CapacitorHttp.get({
            url: url,
            headers: {
              Authorization: `Bearer ${authInfo?.accessToken}`,
              // "User-Agent": "Redditwatcer App",
            },
          })
            .then((response) => {
              if (response.status < 200 || response.status > 300) {
                reject(
                  new RangeError(
                    `Get subreddits request failed with status code ${response.status} with status message ${response.data}`
                  )
                );
              }
              const responseObj: RedditApiResponse<T5> = response.data;

              this.updateRateLimitVariables(response);
              after = responseObj.data.after;

              const subreddits = new Array<Subreddit>();

              const children: Array<ChildDataObj<T5>> =
                responseObj.data.children;
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
              resolve({ after: after, subreddits: subreddits });
            })
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });
  }

  private createUserFrontPageUrl(redditApiItemLimit: number, postSortOrder: PostSortOrderOptionsEnum, topTimeFrame: TopTimeFrameOptionsEnum){
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
      return REDDIT_OAUTH_BASE_URL + uri + queryStr;
  }

  async getUserFrontPage(
    postSortOrder: PostSortOrderOptionsEnum,
    topTimeFrame: TopTimeFrameOptionsEnum,
    redditApiItemLimit: number,
    masterSubscribedSubredditList: Array<Subreddit>,
    redditLists: Array<SubredditLists>,
    filteringOption: PostConverterFilteringOptions
  ): Promise<Array<Post>> {
    return new Promise<Array<Post>>((resolve, reject) => {
      this.getAuthInfo()
        .then((authInfo) => {
          // CheckIsUserLoggedIn();
          this.checkRateLimits();
          const url = this.createUserFrontPageUrl(redditApiItemLimit, postSortOrder, topTimeFrame);
          console.log("Getting User front page @ URL: ", url);
          fetch(url, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authInfo?.accessToken}`,
              // "User-Agent": "Redditwatcer App",
            },
          })
            .then((response) => {
              if (response.status < 200 || response.status > 300) {
                reject(
                  new RangeError(
                    "Get user front page returned a not OK error: " +
                      response.statusText
                  )
                );
              }
              response
                .json()
                .then((response) => {
                  const redditResponse = response as RedditApiResponse<T3>;
                  const posts = new Array<Post>();

                  const children: Array<ChildDataObj<T3>> =
                    redditResponse.data.children;

                  children.forEach((child) => {
                    const post = convertPost(
                      child.data,
                      masterSubscribedSubredditList,
                      redditLists,
                      filteringOption
                    );
                    if (
                      post != null &&
                      post.attachments != null &&
                        post.attachments.length > 0
                    ) {
                        posts.push(post);
                    }
                  });

                    resolve(posts);
                })
                  .catch(() => reject({
                      statusCode: undefined,
                      friendlyMessage: FAILED_TO_PARSE_REDDIT_API_RESPONSE_FRIENDLY_ERROR_MESSAGE
                  }));
            })
              .catch(() => reject({
                  statusCode: undefined,
                  friendlyMessage: HTTP_REQUEST_FAILED_FRIENDLY_ERROR_MESSAGE
              }));
        })
          .catch(() => reject({statusCode: undefined, friendlyMessage: HTTP_REQUEST_FAILED_WITH_STATUS_FRIENDLY_ERROR_MESSAGE}));
    });
  }

  async getPostsForSubredditUri(
    uri: string,
    masterSubscribedSubredditList: Array<Subreddit>,
    redditLists: Array<SubredditLists>,
    filteringOption: PostConverterFilteringOptions
  ): Promise<Array<Post>> {
    return new Promise<Array<Post>>((resolve, reject: (err: {statusCode: number | undefined, friendlyMessage: string}) => void) => {
      console.log(`getting posts from uri ${uri}`);
      // CheckIsUserLoggedIn();
      this.getAuthInfo()
        .then((authInfo) => {
          this.checkRateLimits();
          const url = REDDIT_OAUTH_BASE_URL + uri;
          CapacitorHttp.get({
            url: url,
            headers: {
              Authorization: `Bearer ${authInfo?.accessToken}`,
            },
          })
            .then((response) => {
              if (response.status < 200 || response.status > 300) {
                  reject({statusCode: response.status, friendlyMessage: StringUtil.format(HTTP_REQUEST_FAILED_WITH_STATUS_FRIENDLY_ERROR_MESSAGE, response.status)})
              }
              this.updateRateLimitVariables(response);
              const responseObj: RedditApiResponse<T3> = response.data;
              const children: Array<ChildDataObj<T3>> =
                responseObj.data.children;
              const posts = new Array<Post>();
              children.forEach((child) => {
                const post = convertPost(
                  child.data,
                  masterSubscribedSubredditList,
                  redditLists,
                  filteringOption
                );
                if (
                  post != undefined &&
                  post.attachments != undefined &&
                  post.attachments.length > 0
                ) {
                  posts.push(post);
                }
              });
              resolve(posts);
            })
            .catch(() => reject({statusCode: undefined, friendlyMessage: HTTP_REQUEST_FAILED_FRIENDLY_ERROR_MESSAGE}));
        })
        .catch(() => reject({statusCode: undefined, friendlyMessage: UNABLE_TO_GET_AUTH_INFO_FRIENDLY_ERROR_MESSAGE}));
    });
  }

  async callSearchRedditForSubRedditAndUser(
    searchTerm: string
  ): Promise<SubredditAccountSearchSeperateArrs> {
    return new Promise<SubredditAccountSearchSeperateArrs>(
      (resolve, reject) => {
        // CheckIsUserLoggedIn();
        this.getAuthInfo()
          .then((authInfo) => {
            this.checkRateLimits();
            const url =
              REDDIT_OAUTH_BASE_URL +
              SEARCH_REDDIT_ENDPOINT.replace("{search}", searchTerm);
            CapacitorHttp.get({
              url: url,
              headers: {
                Authorization: `Bearer ${authInfo?.accessToken}`,
                // "User-Agent": "Redditwatcer App",
              },
            })
              .then((response) => {
                if (response.status < 200 || response.status > 300) {
                  reject(
                    new RangeError(
                      "Search subreddit returned not ok response: " +
                        response.data
                    )
                  );
                }
                this.updateRateLimitVariables(response);

                const redditResponse: RedditApiResponse<T2 | T5> =
                  response.data;
                const users = new Array<SubredditAccountSearchResult>();
                const subreddits = new Array<SubredditAccountSearchResult>();
                const children: Array<ChildDataObj<T2 | T5>> =
                  redditResponse.data.children;
                children.forEach((child) => {
                  const serializedObj = child.data;

                  if (serializedObj != null) {
                    const kind = child.kind;
                    if ("t2" == kind) {
                      const t2 = serializedObj as T2;
                      if (
                        t2["is_suspended"] == undefined &&
                        t2["subreddit"] != undefined
                      ) {
                        users.push(convertAccount(t2));
                      }
                    }
                    if ("t5" == kind) {
                      const t5 = serializedObj as T5;
                      subreddits.push(convertSubreddit(t5));
                    }
                  }
                });

                resolve({ users: users, subreddits: subreddits });
              })
              .catch((err) => reject(err));
          })
          .catch((err) => reject(err));
      }
    );
  }

  async callUnsubscribe(name: string) {
    return new Promise<void>((resolve, reject) => {
      this.getAuthInfo()
        .then((authInfo) => {
          // CheckIsUserLoggedIn();
          this.checkRateLimits();
          const url =
            REDDIT_OAUTH_BASE_URL +
            SUBSCRIBE_UNSUBSCRIBE_ENDPOINT.replace("{action}", "unsub").replace(
              "{srName}",
              name
            );
          fetch(url, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authInfo?.accessToken}`,
              // "User-Agent": "Redditwatcer App",
            },
          })
            .then((response) => {
              if (response.status < 200 || response.status > 300) {
                reject(
                  new RangeError(
                    "Subscribe POST to sunsubscribe returned NOT OK status: " +
                      response.statusText
                  )
                );
              }
              resolve();
            })
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });
  }

  async callSubscribe(name: string) {
    return new Promise<void>((resolve, reject) => {
      this.getAuthInfo()
        .then((authInfo) => {
          // CheckIsUserLoggedIn();
          this.checkRateLimits();
          const url =
            REDDIT_OAUTH_BASE_URL +
            SUBSCRIBE_UNSUBSCRIBE_ENDPOINT.replace("{action}", "sub").replace(
              "{srName}",
              name
            );
          fetch(url, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authInfo?.accessToken}`,
              // "User-Agent": "Redditwatcer App",
            },
          })
            .then((response) => {
              if (response.status < 200 || response.status > 300) {
                reject(
                  new RangeError(
                    "Subscribe POST to subscribereturned NOT OK status: " +
                      response.statusText
                  )
                );
              }
              resolve();
            })
            .catch((error) => reject(error));
        })
        .catch((error) => reject(error));
    });
  }

  private async getAuthInfo(): Promise<{
    accessToken: string;
    expiration: number;
  }> {
    return new Promise((resolve, reject) => {
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
          this.authenticate()
            .then(() => {
              resolve({
                accessToken: accessToken === undefined ? "" : accessToken,
                expiration:
                  accessTokenExpiration === undefined
                    ? 0
                    : accessTokenExpiration,
              });
            })
            .catch((error) => reject(error));
        }
      }
      resolve({
        accessToken: accessToken === undefined ? "" : accessToken,
        expiration:
          accessTokenExpiration === undefined ? 0 : accessTokenExpiration,
      });
    });
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
