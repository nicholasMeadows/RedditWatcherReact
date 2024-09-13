import RedditClient from "../client/RedditClient.ts";
import { RedditCredentials } from "../model/config/RedditCredentials.ts";
import {
  GetPostsFromSubredditResponse,
  GetPostsFromSubredditState,
} from "../model/converter/GetPostsFromSubredditStateConverter.ts";
import SubredditSourceOptionsEnum from "../model/config/enums/SubredditSourceOptionsEnum.ts";
import { Subreddit } from "../model/Subreddit/Subreddit.ts";
import PostSortOrderOptionsEnum from "../model/config/enums/PostSortOrderOptionsEnum.ts";
import TopTimeFrameOptionsEnum from "../model/config/enums/TopTimeFrameOptionsEnum.ts";
import { SubredditLists } from "../model/SubredditList/SubredditLists.ts";
import { Post } from "../model/Post/Post.ts";
import { GetPostsForSubredditUrlConverter } from "../model/converter/GetPostsForSubredditUrlConverter.ts";
import { MediaType } from "../model/Post/MediaTypeEnum.ts";
import SortOrderDirectionOptionsEnum from "../model/config/enums/SortOrderDirectionOptionsEnum.ts";
import SubredditSortOrderOptionsEnum from "../model/config/enums/SubredditSortOrderOptionsEnum.ts";
import SelectSubredditIterationMethodOptionsEnum from "../model/config/enums/SelectSubredditIterationMethodOptionsEnum.ts";
import RandomIterationSelectWeightOptionsEnum from "../model/config/enums/RandomIterationSelectWeightOptionsEnum.ts";
import {
  filterSubredditsListByUsersOnly,
  sortByDisplayName,
  sortByFromListThenSubscribers,
  sortSubredditsBySubscribers,
} from "../util/RedditServiceUtil.ts";
import { RedditListDotComConverter } from "../model/converter/RedditListDotComConverter.ts";
import { getSubredditsFromRedditListDotCom } from "./RedditListDotComClient.ts";
import ContentFilteringOptionEnum from "../model/config/enums/ContentFilteringOptionEnum.ts";
import { MAX_POSTS_PER_ROW } from "../RedditWatcherConstants.ts";
import { PostConverterFilteringOptions } from "../model/config/PostConverterFilteringOptions.ts";

export default class RedditService {
  declare redditClient: RedditClient;

  constructor(redditCredentials: RedditCredentials) {
    this.redditClient = new RedditClient(redditCredentials);
  }

  getPostsForPostRow(getPostsFromSubredditsState: GetPostsFromSubredditState) {
    return new Promise<GetPostsFromSubredditResponse>((resolve, reject) => {
      let getPostsPromise: Promise<GetPostsFromSubredditResponse>;
      console.log("about to get post row");
      if (getPostsFromSubredditsState.subredditQueue.length != 0) {
        getPostsPromise = this.handleGetPostsForSubredditQueue(
          getPostsFromSubredditsState
        );
      } else if (
        getPostsFromSubredditsState.subredditSourceOption ===
        SubredditSourceOptionsEnum.FrontPage
      ) {
        getPostsPromise = this.handleGetPostsForUserFrontPage(
          getPostsFromSubredditsState
        );
      } else {
        getPostsPromise = this.handleGetPosts(getPostsFromSubredditsState);
      }

      getPostsPromise
        .then((res) => {
          let filteredPostsFromSubreddit = this.filterPostContent(
            getPostsFromSubredditsState.contentFiltering,
            res.posts
          );
          if (filteredPostsFromSubreddit.length > 0) {
            if (filteredPostsFromSubreddit.length > MAX_POSTS_PER_ROW) {
              filteredPostsFromSubreddit = filteredPostsFromSubreddit.slice(
                0,
                MAX_POSTS_PER_ROW + 1
              );
            }
          }
          resolve({
            posts: filteredPostsFromSubreddit,
            fromSubreddits: res.fromSubreddits,
            subredditsToShowInSideBar: res.subredditsToShowInSideBar,
            nsfwRedditListIndex: res.nsfwRedditListIndex,
            subredditIndex: res.subredditIndex,
            mostRecentSubredditGotten: res.mostRecentSubredditGotten,
            masterSubscribedSubredditList: res.masterSubscribedSubredditList,
            subredditQueueItemToRemove: res.subredditQueueItemToRemove,
          });
        })
        .catch((err) => reject(err));
    });
  }

  handleGetPostsForSubredditQueue(
    getPostsFromSubredditsState: GetPostsFromSubredditState
  ) {
    return new Promise<GetPostsFromSubredditResponse>((resolve, reject) => {
      const firstQueuedSubreddit =
        getPostsFromSubredditsState.subredditQueue[0];
      this.getPostsForSubreddit(
        [firstQueuedSubreddit],
        getPostsFromSubredditsState.concatRedditUrlMaxLength,
        getPostsFromSubredditsState.postSortOrder,
        getPostsFromSubredditsState.topTimeFrame,
        getPostsFromSubredditsState.redditApiItemLimit,
        getPostsFromSubredditsState.masterSubredditList,
        getPostsFromSubredditsState.subredditLists,
        getPostsFromSubredditsState.useInMemoryImagesAndGifs,
        getPostsFromSubredditsState.postConverterFilteringOptions
      )
        .then((posts) => {
          resolve({
            subredditQueueItemToRemove: firstQueuedSubreddit,
            fromSubreddits: [firstQueuedSubreddit],
            posts: posts,
            masterSubscribedSubredditList: undefined,
            mostRecentSubredditGotten: firstQueuedSubreddit,
            subredditIndex: undefined,
            nsfwRedditListIndex: undefined,
            subredditsToShowInSideBar: undefined,
          });
        })
        .catch((err) => reject(err));
    });
  }

  handleGetPostsForUserFrontPage(
    getPostsFromSubredditsState: GetPostsFromSubredditState
  ) {
    return new Promise<GetPostsFromSubredditResponse>((resolve, reject) => {
      this.redditClient
        .getUserFrontPage(
          getPostsFromSubredditsState.postSortOrder,
          getPostsFromSubredditsState.topTimeFrame,
          getPostsFromSubredditsState.redditApiItemLimit,
          getPostsFromSubredditsState.masterSubredditList,
          getPostsFromSubredditsState.subredditLists,
          getPostsFromSubredditsState.postConverterFilteringOptions
        )
        .then((postsFromSubreddit) => {
          resolve({
            posts: postsFromSubreddit,
            fromSubreddits: [],
            subredditsToShowInSideBar:
              getPostsFromSubredditsState.masterSubredditList,
            nsfwRedditListIndex: undefined,
            subredditIndex: undefined,
            mostRecentSubredditGotten: undefined,
            masterSubscribedSubredditList: undefined,
            subredditQueueItemToRemove: undefined,
          });
        })
        .catch((err) => reject(err));
    });
  }

  handleGetPosts(getPostsFromSubredditsState: GetPostsFromSubredditState) {
    return new Promise<GetPostsFromSubredditResponse>((resolve, reject) => {
      this.getPosts(
        getPostsFromSubredditsState.subredditSourceOption,
        getPostsFromSubredditsState.masterSubredditList,
        getPostsFromSubredditsState.sortOrderDirection,
        getPostsFromSubredditsState.subredditLists,
        getPostsFromSubredditsState.subredditSortOrderOption,
        getPostsFromSubredditsState.subredditIndex,
        getPostsFromSubredditsState.nsfwSubredditIndex,
        getPostsFromSubredditsState.concatRedditUrlMaxLength,
        getPostsFromSubredditsState.postSortOrder,
        getPostsFromSubredditsState.topTimeFrame,
        getPostsFromSubredditsState.redditApiItemLimit,
        getPostsFromSubredditsState.selectSubredditIterationMethodOption,
        getPostsFromSubredditsState.randomIterationSelectWeightOption,
        getPostsFromSubredditsState.getAllSubredditsAtOnce,
        getPostsFromSubredditsState.useInMemoryImagesAndGifs,
        getPostsFromSubredditsState.postConverterFilteringOptions
      )
        .then((res) => {
          resolve({
            posts: res.posts,
            subredditQueueItemToRemove: undefined,
            masterSubscribedSubredditList: undefined,
            mostRecentSubredditGotten: res.mostRecentSubredditGotten,
            subredditIndex: res.subredditIndex,
            nsfwRedditListIndex: res.nsfwRedditListIndex,
            subredditsToShowInSideBar: res.subredditsToShowInSideBar,
            fromSubreddits: res.fromSubreddits,
          });
        })
        .catch((err) => reject(err));
    });
  }

  private getPosts(
    subredditSourceOption: SubredditSourceOptionsEnum,
    masterSubredditList: Subreddit[],
    sortOrderDirection: SortOrderDirectionOptionsEnum,
    subredditLists: SubredditLists[],
    subredditSortOption: SubredditSortOrderOptionsEnum,
    subredditIndex: number,
    nsfwSubredditIndex: number,
    concatUrlMaxLength: number,
    postSortOrder: PostSortOrderOptionsEnum,
    topTimeFrame: TopTimeFrameOptionsEnum,
    redditApiItemLimit: number,
    selectSubredditIterationMethodOption: SelectSubredditIterationMethodOptionsEnum,
    randomIterationSelectWeightOption: RandomIterationSelectWeightOptionsEnum,
    getAllSubredditsAtOnce: boolean,
    useInMemoryImagesAndGifs: boolean,
    postConverterFilteringOptions: PostConverterFilteringOptions
  ): Promise<{
    posts: Array<Post>;
    fromSubreddits: Array<Subreddit>;
    subredditsToShowInSideBar: Array<Subreddit>;
    subredditIndex: number;
    nsfwRedditListIndex: number;
    mostRecentSubredditGotten: Subreddit | undefined;
  }> {
    return new Promise((resolve, reject) => {
      this.getSourceSubreddits(
        subredditSourceOption,
        masterSubredditList,
        sortOrderDirection,
        subredditLists
      )
        .then((sourceSubreddits) => {
          const sortedSubreddits = this.sortSourceSubreddits(
            sourceSubreddits,
            subredditSourceOption,
            subredditSortOption,
            sortOrderDirection
          );

          const {
            subredditsToGet,
            updatedSubredditIndex,
            updatedNsfwSubredditIndex,
            mostRecentSubredditGotten,
          } = this.getSubredditsToGetPostsFor(
            sourceSubreddits,
            subredditSourceOption,
            getAllSubredditsAtOnce,
            selectSubredditIterationMethodOption,
            randomIterationSelectWeightOption,
            nsfwSubredditIndex,
            subredditIndex
          );
          this.getPostsForSubreddit(
            subredditsToGet,
            concatUrlMaxLength,
            postSortOrder,
            topTimeFrame,
            redditApiItemLimit,
            masterSubredditList,
            subredditLists,
            useInMemoryImagesAndGifs,
            postConverterFilteringOptions
          )
            .then((posts) => {
              resolve({
                posts: posts,
                fromSubreddits: subredditsToGet,
                subredditIndex: updatedSubredditIndex,
                nsfwRedditListIndex: updatedNsfwSubredditIndex,
                mostRecentSubredditGotten: mostRecentSubredditGotten,
                subredditsToShowInSideBar: sortedSubreddits,
              });
            })
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });
  }

  private getSourceSubreddits(
    subredditSourceOption: SubredditSourceOptionsEnum,
    masterSubredditList: Subreddit[],
    sortOrderDirection: SortOrderDirectionOptionsEnum,
    subredditLists: SubredditLists[]
  ): Promise<Subreddit[]> {
    return new Promise<Subreddit[]>((resolve) => {
      if (
        subredditSourceOption ==
          SubredditSourceOptionsEnum.RedditListDotComRecentActivity ||
        subredditSourceOption ==
          SubredditSourceOptionsEnum.RedditListDotComSubscribers ||
        subredditSourceOption ==
          SubredditSourceOptionsEnum.RedditListDotCom24HourGrowth
      ) {
        resolve(
          this.getSubredditsToGetPostsForFromRedditListDotCom(
            subredditSourceOption
          )
        );
        return;
      } else if (
        subredditSourceOption ===
        SubredditSourceOptionsEnum.SubscribedSubreddits
      ) {
        resolve(masterSubredditList);
        return;
      } else if (
        subredditSourceOption === SubredditSourceOptionsEnum.RedditUsersOnly
      ) {
        //Sort subscribed reddits by users only. Get random or next in iteration based on iteration method
        resolve(
          filterSubredditsListByUsersOnly(
            masterSubredditList,
            sortOrderDirection
          )
        );
        return;
      } else if (
        subredditSourceOption ===
        SubredditSourceOptionsEnum.SelectedSubRedditLists
      ) {
        const subreddits = new Array<Subreddit>();
        const selectedLists = subredditLists.filter(
          (subredditList) => subredditList.selected
        );
        if (selectedLists !== undefined) {
          selectedLists.forEach((list) => {
            list.subreddits.forEach((subreddit) => {
              const foundSubreddit = subreddits.find(
                (sub) => sub.displayName === subreddit.displayName
              );
              if (foundSubreddit === undefined) {
                subreddits.push(subreddit);
              }
            });
          });
        }
        resolve(subreddits);
        return;
      } else if (
        subredditSourceOption === SubredditSourceOptionsEnum.AllSubRedditLists
      ) {
        const subreddits = new Array<Subreddit>();
        subredditLists.forEach((list) => {
          list.subreddits.forEach((subreddit) => {
            const foundSubreddit = subreddits.find(
              (sub) => sub.displayName === subreddit.displayName
            );
            if (foundSubreddit === undefined) {
              subreddits.push(subreddit);
            }
          });
        });
        resolve(subreddits);
        return;
      }
      resolve([]);
    });
  }

  private getSubredditsToGetPostsForFromRedditListDotCom(
    subredditSourceOption: SubredditSourceOptionsEnum
  ): Promise<Subreddit[]> {
    return new Promise<Array<Subreddit>>((resolve, reject) => {
      console.log("getting from redditlist.com");
      const converter = new RedditListDotComConverter();
      getSubredditsFromRedditListDotCom()
        .then((htmlArray) => {
          switch (subredditSourceOption) {
            case SubredditSourceOptionsEnum.RedditListDotComRecentActivity:
              resolve(
                converter.convertToReddListDotComRecentActivity(htmlArray)
              );
              break;
            case SubredditSourceOptionsEnum.RedditListDotComSubscribers:
              resolve(converter.convertToReddListDotComSubscribers(htmlArray));
              break;
            case SubredditSourceOptionsEnum.RedditListDotCom24HourGrowth:
              resolve(converter.convertToReddListDotCom24HourGrowth(htmlArray));
              break;
            default:
              resolve([]);
          }
        })
        .catch((err) => reject(err));
    });
  }

  private sortSourceSubreddits(
    subreddits: Subreddit[],
    subredditSourceOption: SubredditSourceOptionsEnum,
    subredditSortOption: SubredditSortOrderOptionsEnum,
    sortOrderDirection: SortOrderDirectionOptionsEnum
  ) {
    if (
      subredditSourceOption ===
        SubredditSourceOptionsEnum.RedditListDotComRecentActivity ||
      subredditSourceOption ===
        SubredditSourceOptionsEnum.RedditListDotComSubscribers ||
      subredditSourceOption ===
        SubredditSourceOptionsEnum.RedditListDotCom24HourGrowth
    ) {
      return subreddits;
    }
    switch (subredditSortOption) {
      case SubredditSortOrderOptionsEnum.Alphabetically:
        return sortByDisplayName(subreddits, sortOrderDirection);
      case SubredditSortOrderOptionsEnum.SubCount:
        return sortSubredditsBySubscribers(subreddits, sortOrderDirection);
      case SubredditSortOrderOptionsEnum.SubCountAndListName:
        return sortByFromListThenSubscribers(subreddits, sortOrderDirection);
    }
  }

  private getSubredditsToGetPostsFor(
    sourceSubreddits: Subreddit[],
    subredditSourceOption: SubredditSourceOptionsEnum,
    getAllSubredditsAtOnce: boolean,
    selectSubredditIterationMethodOption: SelectSubredditIterationMethodOptionsEnum,
    randomIterationSelectWeightOption: RandomIterationSelectWeightOptionsEnum,
    nsfwSubredditIndex: number,
    subredditIndex: number
  ): {
    subredditsToGet: Subreddit[];
    updatedSubredditIndex: number;
    updatedNsfwSubredditIndex: number;
    mostRecentSubredditGotten: Subreddit | undefined;
  } {
    let subredditsToGet = [];
    if (getAllSubredditsAtOnce) {
      return {
        subredditsToGet: sourceSubreddits,
        updatedNsfwSubredditIndex: nsfwSubredditIndex,
        updatedSubredditIndex: subredditIndex,
        mostRecentSubredditGotten: undefined,
      };
    }

    let index = 0;
    let updatedNsfwSubredditIndex = nsfwSubredditIndex;
    let updatedSubredditIndex = subredditIndex;
    if (
      selectSubredditIterationMethodOption ===
      SelectSubredditIterationMethodOptionsEnum.Random
    ) {
      index = Math.floor(Math.random() * sourceSubreddits.length);

      if (
        RandomIterationSelectWeightOptionsEnum.PureRandom ==
        randomIterationSelectWeightOption
      ) {
        index = Math.floor(Math.random() * sourceSubreddits.length);
      } else if (
        RandomIterationSelectWeightOptionsEnum.WeightedBySubCount ==
        randomIterationSelectWeightOption
      ) {
        let totalWeight: number = 0;
        sourceSubreddits.map((sub) => (totalWeight += sub.subscribers));
        const randomWeightedIndex = Math.floor(Math.random() * totalWeight);
        let itemWeightedIndex = 0;
        for (let i = 0; i < sourceSubreddits.length; ++i) {
          const item = sourceSubreddits[i];
          itemWeightedIndex += item.subscribers;
          if (randomWeightedIndex < itemWeightedIndex) {
            index = i;
            break;
          }
        }
      }
    } else if (
      subredditSourceOption ===
        SubredditSourceOptionsEnum.RedditListDotCom24HourGrowth ||
      subredditSourceOption ===
        SubredditSourceOptionsEnum.RedditListDotComRecentActivity ||
      subredditSourceOption ===
        SubredditSourceOptionsEnum.RedditListDotComSubscribers
    ) {
      index =
        nsfwSubredditIndex >= sourceSubreddits.length ? 0 : nsfwSubredditIndex;
      updatedNsfwSubredditIndex = index + 1;
    } else {
      index = subredditIndex >= sourceSubreddits.length ? 0 : subredditIndex;
      updatedSubredditIndex = index + 1;
    }

    const singleSubredditToGet = sourceSubreddits[index];
    subredditsToGet = [singleSubredditToGet];
    return {
      subredditsToGet: subredditsToGet,
      updatedSubredditIndex: updatedSubredditIndex,
      updatedNsfwSubredditIndex: updatedNsfwSubredditIndex,
      mostRecentSubredditGotten: singleSubredditToGet,
    };
  }

  private getPostsForSubreddit(
    subreddits: Array<Subreddit>,
    concatRedditUrlMaxLength: number,
    postSortOrder: PostSortOrderOptionsEnum,
    topTimeFrame: TopTimeFrameOptionsEnum,
    redditApiItemLimit: number,
    masterSubredditList: Subreddit[],
    subredditLists: SubredditLists[],
    useInMemoryImagesAndGifs: boolean,
    postConverterFilteringOptions: PostConverterFilteringOptions
  ) {
    return new Promise<Array<Post>>((resolve, reject) => {
      const urlConverter = new GetPostsForSubredditUrlConverter();
      const [url, randomSourceString] = urlConverter.convert(
        subreddits,
        concatRedditUrlMaxLength,
        postSortOrder,
        topTimeFrame,
        redditApiItemLimit
      );
      this.redditClient
        .getPostsForSubredditUri(
          url,
          masterSubredditList,
          subredditLists,
          postConverterFilteringOptions
        )
        .then((posts) => {
          const mappedPosts = posts.map<Post>((value) => {
            value.randomSourceString = randomSourceString;
            return value;
          });
          if (useInMemoryImagesAndGifs) {
            this.getBase64ForImages(mappedPosts).then(() => {
              resolve(mappedPosts);
            });
          } else {
            resolve(posts);
          }
        })
        .catch((error) => reject(error));
    });
  }

  private async getBase64ForImages(posts: Array<Post>) {
    return new Promise<void>((resolve) => {
      const promiseArr = new Array<Promise<string | ArrayBuffer | null>>();

      posts.forEach((post) => {
        post.attachments.forEach((attachment) => {
          if (
            attachment.mediaType === MediaType.Image ||
            attachment.mediaType === MediaType.Gif
          ) {
            const prom = this.getBase64ForImgUrl(attachment.url);
            prom
              .then((res) => {
                attachment.base64Img = res;
              })
              .catch((err) => {
                console.log("Caught error while fetching base64 img", err);
              });
            promiseArr.push(prom);
            if (attachment.mediaType === MediaType.Image) {
              const resolutions = attachment.attachmentResolutions;
              if (resolutions !== undefined) {
                resolutions.forEach((resolution) => {
                  const resolutionPromise = this.getBase64ForImgUrl(
                    resolution.url
                  );
                  resolutionPromise
                    .then((res) => (resolution.base64Img = res))
                    .catch((err) => {
                      console.log(
                        "Caught error while fetching base64 attachment",
                        err
                      );
                    });
                  promiseArr.push(resolutionPromise);
                });
              }
            }
          }
        });
      });
      Promise.allSettled(promiseArr).then(() => resolve());
    });
  }

  private getBase64ForImgUrl(imgUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const timeoutController = new AbortController();
      const timeoutId = setTimeout(() => timeoutController.abort(), 30000);
      fetch(imgUrl, { signal: timeoutController.signal })
        .then((fetchResponse) => {
          if (fetchResponse.status === 200) {
            fetchResponse
              .blob()
              .then((blob) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  const result = reader.result;
                  if (result === null) {
                    reject("reader returned null");
                  } else {
                    resolve(result.toString());
                  }
                };
                reader.onerror = (err) => {
                  reject(err);
                };
                reader.readAsDataURL(blob);
              })
              .catch((err) => {
                reject(err);
              });
          } else {
            reject(
              `Fetch response did not return OK response. Actual was ${fetchResponse.status}`
            );
          }
        })
        .catch((err) => {
          reject(err);
        });
      clearTimeout(timeoutId);
    });
  }

  private filterPostContent(
    contentFiltering: ContentFilteringOptionEnum,
    posts: Array<Post>
  ) {
    if (ContentFilteringOptionEnum.SFW === contentFiltering) {
      return posts.filter((post) => !post.over18);
    }

    if (ContentFilteringOptionEnum.NSFW === contentFiltering) {
      return posts.filter((post) => post.over18);
    }
    return posts;
  }
}
