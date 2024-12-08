import { Post } from "../model/Post/Post";
import { Subreddit } from "../model/Subreddit/Subreddit";
import { SubredditLists } from "../model/SubredditList/SubredditLists";
import SortOrderDirectionOptionsEnum from "../model/config/enums/SortOrderDirectionOptionsEnum";
import ContentFilteringOptionEnum from "../model/config/enums/ContentFilteringOptionEnum.ts";
import {MediaType} from "../model/Post/MediaTypeEnum.ts";

export function sortSubredditsBySubscribers(
  subreddits: Array<Subreddit>,
  sortDirection: SortOrderDirectionOptionsEnum
): Array<Subreddit> {
  const sortedSubreddits = [...subreddits];
  if (SortOrderDirectionOptionsEnum.Normal == sortDirection) {
    sortedSubreddits.sort((sub1, sub2) => {
      const sub1Subscribers = sub1.subscribers;
      const sub2Subscribers = sub2.subscribers;
      if (sub1Subscribers < sub2Subscribers) {
        return 1;
      } else if (sub1Subscribers > sub2Subscribers) {
        return -1;
      }
      return 0;
    });
  } else if (SortOrderDirectionOptionsEnum.Reversed == sortDirection) {
    sortedSubreddits.sort((sub1, sub2) => {
      const sub1Subscribers = sub1.subscribers;
      const sub2Subscribers = sub2.subscribers;
      if (sub1Subscribers < sub2Subscribers) {
        return -1;
      } else if (sub1Subscribers > sub2Subscribers) {
        return 1;
      }
      return 0;
    });
  }
  return sortedSubreddits;
}

export function filterSubredditsListByUsersOnly(
  subreddits: Array<Subreddit>,
  sortOrderDirection: SortOrderDirectionOptionsEnum
): Array<Subreddit> {
  const userOnlyList = subreddits.filter((sub) =>
    sub.displayName.startsWith("u_")
  );
  return sortSubredditListAlphabetically(userOnlyList, sortOrderDirection);
}

export function sortSubredditListAlphabetically(
  subreddits: Array<Subreddit>,
  sortOrderDirection: SortOrderDirectionOptionsEnum
): Array<Subreddit> {
  if (SortOrderDirectionOptionsEnum.Normal == sortOrderDirection) {
    subreddits = subreddits.sort((sub1, sub2) => {
      if (sub1.displayName.toLowerCase() < sub2.displayName.toLowerCase()) {
        return 1;
      } else if (
        sub1.displayName.toLowerCase() > sub2.displayName.toLowerCase()
      ) {
        return -1;
      }
      return 0;
    });
  } else if (SortOrderDirectionOptionsEnum.Reversed == sortOrderDirection) {
    subreddits = subreddits.sort((sub1, sub2) => {
      if (sub1.displayName.toLowerCase() > sub2.displayName.toLowerCase()) {
        return 1;
      } else if (
        sub1.displayName.toLowerCase() < sub2.displayName.toLowerCase()
      ) {
        return -1;
      }
      return 0;
    });
  }
  return subreddits;
}

export function concatSelectedSubredditLists(
  subredditLists: Array<SubredditLists>
): Array<Subreddit> {
  const selectedSubReddits = new Array<Subreddit>();
  for (const subredditList of subredditLists.filter((list) => list.selected)) {
    selectedSubReddits.push(...subredditList.subreddits);
  }
  return selectedSubReddits;
}

export function sortByDisplayName(
  selectedSubReddits: Array<Subreddit>,
  sortOrderDirection: SortOrderDirectionOptionsEnum
): Array<Subreddit> {
  if (SortOrderDirectionOptionsEnum.Normal == sortOrderDirection) {
    return selectedSubReddits.sort((sub1, sub2) => {
      if (sub1.displayName.toLowerCase() > sub2.displayName.toLowerCase()) {
        return 1;
      } else if (
        sub1.displayName.toLowerCase() < sub2.displayName.toLowerCase()
      ) {
        return -1;
      }
      return 0;
    });
  } else if (SortOrderDirectionOptionsEnum.Reversed == sortOrderDirection) {
    return selectedSubReddits.sort((sub1, sub2) => {
      if (sub1.displayName < sub2.displayName) {
        return 1;
      } else if (sub1.displayName > sub2.displayName) {
        return -1;
      }
      return 0;
    });
  }
  return [];
}

export function sortByFromListThenSubscribers(
  selectedSubReddits: Array<Subreddit>,
  sortOrderDirection: SortOrderDirectionOptionsEnum
): Array<Subreddit> {
  if (SortOrderDirectionOptionsEnum.Normal == sortOrderDirection) {
    return selectedSubReddits.sort((sub1, sub2) => {
      if (sub1.fromList > sub2.fromList) {
        return 1;
      } else if (sub1.fromList < sub2.fromList) {
        return -1;
      } else {
        if (sub1.subscribers > sub2.subscribers) {
          return 1;
        } else if (sub1.subscribers < sub2.subscribers) {
          return -1;
        }
        return 0;
      }
    });
  } else if (SortOrderDirectionOptionsEnum.Reversed == sortOrderDirection) {
    return selectedSubReddits.sort((sub1, sub2) => {
      if (sub1.fromList < sub2.fromList) {
        return 1;
      } else if (sub1.fromList > sub2.fromList) {
        return -1;
      } else {
        if (sub1.subscribers < sub2.subscribers) {
          return 1;
        } else if (sub1.subscribers > sub2.subscribers) {
          return -1;
        }
        return 0;
      }
    });
  }
  return [];
}

export function sortPostsByCreate(posts: Array<Post>) {
  return posts.sort((p1, p2) => {
    const p1Create = p1.created;
    const p2Created = p2.created;

    if (p1Create < p2Created) {
      return 1;
    } else if (p1Create > p2Created) {
      return -1;
    }
    return 0;
  });
}

export function sortSubredditsRandomly(
  subreddits: Array<Subreddit>
): Array<Subreddit> {
  // declare the function

  for (let i = subreddits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [subreddits[i], subreddits[j]] = [subreddits[j], subreddits[i]];
  }
  return subreddits;
}

export function filterPostContent(
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

export async function getBase64ForImages(posts: Array<Post>)  {
  return new Promise<void>((resolve) => {
    const promiseArr = new Array<Promise<string | ArrayBuffer | null>>();

    posts.forEach((post) => {
      post.attachments.forEach((attachment) => {
        if (
            attachment.mediaType === MediaType.Image ||
            attachment.mediaType === MediaType.Gif
        ) {
          const prom = getBase64ForImgUrl(attachment.url);
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
                const resolutionPromise = getBase64ForImgUrl(
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

const getBase64ForImgUrl = (imgUrl: string): Promise<string> => {
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