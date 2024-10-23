import { RefObject, useCallback, useContext, useEffect } from "react";
import { SubredditAccountSearchResult } from "../model/SubredditAccountSearchResult.ts";
import RedditClient from "../client/RedditClient.ts";
import { AppConfigStateContext } from "../context/app-config-context.ts";
import { SearchRedditBarDispatchContext } from "../context/search-reddit-bar-context.ts";
import { SearchRedditBarActionType } from "../reducer/search-reddit-bar-reducer.ts";
import ContentFilteringOptionEnum from "../model/config/enums/ContentFilteringOptionEnum.ts";
import { v4 as uuidV4 } from "uuid";
import getPlatform from "../util/PlatformUtil.ts";
import { Platform } from "../model/Platform.ts";

export default function useSearchReddit(
  searchResults: Array<SubredditAccountSearchResult>,
  inputRef: RefObject<HTMLInputElement>
) {
  const searchRedditBarDispatch = useContext(SearchRedditBarDispatchContext);
  const contentFiltering = useContext(AppConfigStateContext).contentFiltering;
  const { redditCredentials } = useContext(AppConfigStateContext);

  const searchReddit = useCallback(
    async (input: string) => {
      try {
        let { users, subreddits } = await new RedditClient(
          redditCredentials
        ).callSearchRedditForSubRedditAndUser(input);

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
        searchRedditBarDispatch({
          type: SearchRedditBarActionType.SET_SEARCH_RESULTS_OPEN,
          payload: true,
        });
        searchRedditBarDispatch({
          type: SearchRedditBarActionType.SET_SEARCH_RESULTS,
          payload: [...users, ...subreddits],
        });
      } catch (e) {
        console.log("exception", e);
        searchRedditBarDispatch({
          type: SearchRedditBarActionType.SET_SEARCH_RESULTS,
          payload: [],
        });
      }
    },
    [contentFiltering, redditCredentials, searchRedditBarDispatch]
  );

  const onKeyup = useCallback(
    (event: KeyboardEvent) => {
      if (event.key == "Enter") {
        const inputValue = (event.target as HTMLInputElement).value;
        searchReddit(inputValue);
      }
    },
    [searchReddit]
  );

  const onBlur = useCallback(
    (event: FocusEvent) => {
      const platform = getPlatform();
      if (platform == Platform.Android || platform == Platform.Ios) {
        const inputValue = (event.target as HTMLInputElement).value;
        searchReddit(inputValue);
      }
    },
    [searchReddit]
  );

  useEffect(() => {
    const inputElement = inputRef.current;
    if (inputElement === null) {
      return;
    }

    inputElement.addEventListener("keyup", onKeyup);
    inputElement.addEventListener("blur", onBlur);
    return () => {
      inputElement.removeEventListener("keyup", onKeyup);
      inputElement.removeEventListener("blur", onBlur);
    };
  }, [inputRef, onBlur, onKeyup]);

  const subOrUnSubFromSubreddit = async (
    subredditSearchResult: SubredditAccountSearchResult
  ) => {
    const name = subredditSearchResult.isUser
      ? subredditSearchResult.displayNamePrefixed
      : subredditSearchResult.displayName;
    const redditClient = new RedditClient(redditCredentials);
    if (subredditSearchResult.isSubscribed) {
      await redditClient.callUnsubscribe(name);
    } else {
      await redditClient.callSubscribe(name);
    }
    const foundSearchResultIndex = searchResults.findIndex(
      (result) =>
        result.searchResultUuid == subredditSearchResult.searchResultUuid
    );
    const foundSearchResult = { ...searchResults[foundSearchResultIndex] };
    const updatedSearchResults = [...searchResults];
    updatedSearchResults[foundSearchResultIndex] = foundSearchResult;

    foundSearchResult.isSubscribed = !foundSearchResult.isSubscribed;
    searchRedditBarDispatch({
      type: SearchRedditBarActionType.SET_SEARCH_RESULTS,
      payload: updatedSearchResults,
    });
  };

  return {
    subOrUnSubFromSubreddit: subOrUnSubFromSubreddit,
  };
}
