import { Subreddit } from "../Subreddit/Subreddit.ts";
import PostSortOrderOptionsEnum from "../config/enums/PostSortOrderOptionsEnum.ts";
import TopTimeFrameOptionsEnum from "../config/enums/TopTimeFrameOptionsEnum.ts";

export class GetPostsForSubredditUrlConverter {
  convert(
    subreddits: Array<Subreddit>,
    concatRedditUrlMaxLength: number,
    postSortOrder: PostSortOrderOptionsEnum,
    topTimeFrame: TopTimeFrameOptionsEnum,
    redditApiItemLimit: number
  ): [string, string] {
    let isUser = false;
    if (subreddits.length == 1) {
      isUser = subreddits[0].displayName.startsWith("u_");
    }

    const [urlSuffix, randomSourceString] = this.#createUrlSuffix(
      isUser,
      postSortOrder,
      topTimeFrame,
      redditApiItemLimit
    );
    let url = "/r/";
    const subredditNamesAlreadyAdded = new Array<string>();


    const randomizedSubredditArray = [...subreddits];

    for (let i = randomizedSubredditArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [randomizedSubredditArray[i], randomizedSubredditArray[j]] = [randomizedSubredditArray[j], randomizedSubredditArray[i]];
    }

    for (const subreddit of randomizedSubredditArray) {
      const displayName = subreddit.displayName;
      if (!subredditNamesAlreadyAdded.includes(displayName)) {
        if (
          (url + displayName + urlSuffix).length >= concatRedditUrlMaxLength
        ) {
          break;
        }
        url += displayName + "+";
        subredditNamesAlreadyAdded.push(displayName);
      }
    }

    if (url.endsWith("+")) {
      url = url.substring(0, url.length - 1);
    }
    url += urlSuffix;
    return [url, randomSourceString];
  }

  #createUrlSuffix(
    isUser: boolean,
    postSortOrder: PostSortOrderOptionsEnum,
    topTimeFrame: TopTimeFrameOptionsEnum,
    redditApiItemLimit: number
  ): [string, string] {
    let randomSourceString = "";
    let url = "";

    const randomUrl = () => {
      let random = Math.floor(Math.random() * 3);
      switch (random) {
        case 0:
          {
            randomSourceString = "Top";
            url = isUser ? "?sort=top&t=" : "/top?t=";
            random = Math.floor(Math.random() * 7);
            switch (random) {
              case 0:
                {
                  randomSourceString += ", All";
                  url += TopTimeFrameOptionsEnum.All;
                }
                break;
              case 1:
                {
                  randomSourceString += ", Day";
                  url += TopTimeFrameOptionsEnum.Day;
                }
                break;
              case 2:
                {
                  randomSourceString += ", Hour";
                  url += TopTimeFrameOptionsEnum.Hour;
                }
                break;
              case 3:
                {
                  randomSourceString += ", Month";
                  url += TopTimeFrameOptionsEnum.Month;
                }
                break;
              case 4:
                {
                  randomSourceString += ", Week";
                  url += TopTimeFrameOptionsEnum.Week;
                }
                break;
              case 5:
                {
                  randomSourceString += ", Year";
                  url += TopTimeFrameOptionsEnum.Year;
                }
                break;
            }
            url += `&limit=${redditApiItemLimit}`;
          }
          break;
        case 1:
          {
            randomSourceString = "New";
            newUrl();
          }

          break;
        case 2:
          {
            randomSourceString = "Hot";
            hotUrl();
          }
          break;
      }
    };

    const topUrl = () => {
      url = isUser ? "?sort=top&t=" : "/top?t=";
      switch (topTimeFrame) {
        case TopTimeFrameOptionsEnum.All:
          url += "all";
          break;
        case TopTimeFrameOptionsEnum.Day:
          url += "day";
          break;
        case TopTimeFrameOptionsEnum.Hour:
          url += "hour";
          break;
        case TopTimeFrameOptionsEnum.Month:
          url += "month";
          break;
        case TopTimeFrameOptionsEnum.Week:
          url += "week";
          break;
        case TopTimeFrameOptionsEnum.Year:
          url += "year";
          break;
      }
      url += `&limit=${redditApiItemLimit}`;
    };

    const newUrl = () => {
      url = isUser
        ? `/?sort=new&limit=${redditApiItemLimit}`
        : `/new?limit=${redditApiItemLimit}`;
    };

    const hotUrl = () => {
      url = isUser
        ? `/?sort=hot&limit=${redditApiItemLimit}`
        : `/hot?limit=${redditApiItemLimit}`;
    };

    switch (postSortOrder) {
      case PostSortOrderOptionsEnum.Random:
        randomUrl();
        break;
      case PostSortOrderOptionsEnum.Top:
        topUrl();
        break;
      case PostSortOrderOptionsEnum.New:
        newUrl();
        break;
      case PostSortOrderOptionsEnum.Hot:
        hotUrl();
        break;
    }

    return [url, randomSourceString];
  }
}
