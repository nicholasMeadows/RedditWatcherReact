import { RefObject, useEffect, useState } from "react";
import getPlatform from "../util/PlatformUtil.ts";
import { Platform } from "../model/Platform.ts";
import { SubredditAccountSearchResult } from "../model/SubredditAccountSearchResult.ts";
import RedditClient from "../client/RedditClient.ts";
import ContentFilteringOptionEnum from "../model/config/enums/ContentFilteringOptionEnum.ts";
import { useAppSelector } from "../redux/store.ts";
import { v4 as uuidV4 } from "uuid";

export default function useSearchReddit(inputRef: RefObject<HTMLInputElement>) {
  const contentFiltering = useAppSelector(
    (state) => state.appConfig.contentFiltering
  );
  const [searchRedditResults, setSearchRedditResults] = useState<
    SubredditAccountSearchResult[]
  >([]);

  const searchReddit = async (input: string) => {
    try {
      let { users, subreddits } =
        await new RedditClient().callSearchRedditForSubRedditAndUser(input);

      if (contentFiltering == ContentFilteringOptionEnum.SFW) {
        users = users.filter((result) => !result.over18);
        subreddits = subreddits.filter((result) => !result.over18);
      } else if (contentFiltering == ContentFilteringOptionEnum.NSFW) {
        users = users.filter((result) => result.over18);
        subreddits = subreddits.filter((result) => result.over18);
      }

      const sortByDisplayName = (
        aDisplayName: string,
        bDisplayName: string
      ) => {
        const aLowerCase = aDisplayName.toLowerCase();
        const bLowerCase = bDisplayName.toLowerCase();
        if (aLowerCase > bLowerCase) {
          return 1;
        } else if (aLowerCase < bLowerCase) {
          return -1;
        }
        return 0;
      };

      users.sort((a, b) => sortByDisplayName(a.displayName, b.displayName));
      subreddits.sort((a, b) =>
        sortByDisplayName(a.displayName, b.displayName)
      );

      users.map((result) => (result.searchResultUuid = uuidV4()));
      subreddits.map((result) => (result.searchResultUuid = uuidV4()));
      setSearchRedditResults([...users, ...subreddits]);
    } catch (e) {
      console.log("exception", e);
      setSearchRedditResults([]);
    }
  };
  const onKeyup = (event: KeyboardEvent) => {
    if (event.key == "Enter") {
      const inputValue = (event.target as HTMLInputElement).value;
      searchReddit(inputValue);
    }
  };

  const onBlur = (event: FocusEvent) => {
    const platform = getPlatform();
    if (platform == Platform.Android || platform == Platform.Ios) {
      const inputValue = (event.target as HTMLInputElement).value;
      searchReddit(inputValue);
    }
  };

  useEffect(() => {
    const inputElement = inputRef.current;
    if (inputElement !== null) {
      inputElement.addEventListener("keyup", onKeyup);
      inputElement.addEventListener("blur", onBlur);
    }

    return () => {
      if (inputElement !== null) {
        inputElement.removeEventListener("keyup", onKeyup);
        inputElement.removeEventListener("blur", onBlur);
      }
    };
  }, [inputRef, onBlur, onKeyup]);

  const clearSearchResults = () => {
    setSearchRedditResults([]);
  };

  const subOrUnSubFromSubreddit = async (
    subredditSearchResult: SubredditAccountSearchResult
  ) => {
    const name = subredditSearchResult.isUser
      ? subredditSearchResult.displayNamePrefixed
      : subredditSearchResult.displayName;
    const redditClient = new RedditClient();
    if (subredditSearchResult.isSubscribed) {
      await redditClient.callUnsubscribe(name);
    } else {
      await redditClient.callSubscribe(name);
    }
    const foundSearchResult = searchRedditResults.find(
      (result) =>
        result.searchResultUuid == subredditSearchResult.searchResultUuid
    );
    console.log("foundSearchResult", foundSearchResult);
    if (foundSearchResult != undefined) {
      foundSearchResult.isSubscribed = !foundSearchResult.isSubscribed;
    }
    setSearchRedditResults(searchRedditResults);
  };

  return {
    searchResults: searchRedditResults,
    clearSearchResults: clearSearchResults,
    subOrUnSubFromSubreddit: subOrUnSubFromSubreddit,
  };
}
