import { AppConfig } from "./AppConfig";
import { RedditCredentialsState } from "./RedditCredentialsState";

export interface AppConfigState extends AppConfig {
    redditCredentials: RedditCredentialsState,
    concatRedditUrlMaxLengthValidationError: string | undefined,
    redditApiItemLimitValidationError: string | undefined,
    postsToShowInRowValidationError: string | undefined,
    postRowsToShowInViewValidationError: string | undefined,
    configLoaded: boolean
}