import { RedditCredentialsState } from "./RedditCredentialsState";
import { AppConfig } from "../config/AppConfig.ts";

export interface AppConfigState extends AppConfig {
  redditCredentials: RedditCredentialsState;
  concatRedditUrlMaxLengthValidationError: string | undefined;
  redditApiItemLimitValidationError: string | undefined;
  postsToShowInRowValidationError: string | undefined;
  postRowsToShowInViewValidationError: string | undefined;
  configLoaded: boolean;
  autoScrollPostRowRateSecondsForSinglePostCardValidationError:
    | string
    | undefined;
  getPostRowIterationTimeValidationError: string | undefined;
}
