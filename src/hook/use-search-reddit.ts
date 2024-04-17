import { RefObject, useEffect, useState } from "react";
import getPlatform from "../util/PlatformUtil.ts";
import { Platform } from "../model/Platform.ts";
import { SubredditAccountSearchResult } from "../model/SubredditAccountSearchResult.ts";
import RedditService from "../service/RedditService.ts";

export default function useSearchReddit(
  redditService: RedditService,
  inputRef: RefObject<HTMLInputElement>
) {
  const [searchRedditResults, setSearchRedditResults] = useState<
    SubredditAccountSearchResult[]
  >([]);

  const searchReddit = async (input: string) => {
    try {
      setSearchRedditResults(
        await redditService.searchRedditForSubRedditAndUser(input)
      );
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
    if (subredditSearchResult.isSubscribed) {
      await redditService.unsubscribe(name);
    } else {
      await redditService.subscribe(name);
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
