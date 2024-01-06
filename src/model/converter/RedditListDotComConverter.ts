import { v4 as uuidV4 } from "uuid";
import { Subreddit } from "../Subreddit/Subreddit.ts";

const RECENT_ACTIVITY_LIST_INDEX = 0;
const SUBSCRIBERS_LIST_INDEX = 1;
const TWENTY_FOUR_HOUR_GROWTH_LIST_INDEX = 2;

export class RedditListDotComConverter {
  convertToReddListDotComRecentActivity(htmls: Array<string>) {
    return this.#htmlToSubredditList(htmls, RECENT_ACTIVITY_LIST_INDEX);
  }

  convertToReddListDotComSubscribers(htmls: Array<string>) {
    return this.#htmlToSubredditList(htmls, SUBSCRIBERS_LIST_INDEX);
  }

  convertToReddListDotCom24HourGrowth(htmls: Array<string>) {
    return this.#htmlToSubredditList(htmls, TWENTY_FOUR_HOUR_GROWTH_LIST_INDEX);
  }

  #htmlToSubredditList(htmls: Array<string>, listIndex: number) {
    const reddits = new Array<Subreddit>();
    htmls.forEach((html) => {
      const dom = new DOMParser().parseFromString(html, "text/html");
      const listItems = dom
        .getElementById("listing-parent")
        ?.children[listIndex].getElementsByClassName("listing-item");
      if (listItems != undefined) {
        for (let i = 0; i < listItems.length; ++i) {
          const listItem = listItems.item(i);
          if (listItem != undefined) {
            const subRedditName = listItem
              .getElementsByClassName("subreddit-url")[0]
              .getElementsByTagName("a")[0].innerHTML;

            reddits.push({
              displayName: subRedditName,
              displayNamePrefixed: `r/${subRedditName}`,
              subscribers: 0,
              over18: true,
              isSubscribed: false,
              fromList: "",
              subredditUuid: uuidV4(),
              isUser: false,
            });
          }
        }
      }
    });
    return reddits;
  }
}
