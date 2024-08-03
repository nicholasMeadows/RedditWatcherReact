import { AppConfigState } from "../model/config/AppConfigState.ts";
import { ValidationUtil } from "../util/ValidationUtil.ts";
import {
  MAX_AUTO_SCROLL_POST_ROW_RATE_SECONDS_FOR_SINGLE_POST_CARD,
  Max_CONCAT_REDDIT_URL_LENGTH,
  MAX_POST_ROWS_TO_SHOW_IN_VIEW,
  MAX_POSTS_TO_SHOW_IN_ROW,
  MAX_REDDIT_API_ITEM_LIMIT,
  MIN_AUTO_SCROLL_POST_ROW_RATE_SECONDS_FOR_SINGLE_POST_CARD,
  MIN_CONCAT_REDDIT_URL_LENGTH,
  MIN_POST_ROWS_TO_SHOW_IN_VIEW,
  MIN_POSTS_TO_SHOW_IN_ROW,
  MIN_REDDIT_API_ITEM_LIMIT,
} from "../RedditWatcherConstants.ts";
import SubredditSortOrderOptionsEnum from "../model/config/enums/SubredditSortOrderOptionsEnum.ts";
import { AutoScrollPostRowOptionEnum } from "../model/config/enums/AutoScrollPostRowOptionEnum.ts";
import { AutoScrollPostRowDirectionOptionEnum } from "../model/config/enums/AutoScrollPostRowDirectionOptionEnum.ts";
import ContentFilteringOptionEnum from "../model/config/enums/ContentFilteringOptionEnum.ts";
import SelectSubredditIterationMethodOptionsEnum from "../model/config/enums/SelectSubredditIterationMethodOptionsEnum.ts";
import TopTimeFrameOptionsEnum from "../model/config/enums/TopTimeFrameOptionsEnum.ts";
import PostSortOrderOptionsEnum from "../model/config/enums/PostSortOrderOptionsEnum.ts";
import SortOrderDirectionOptionsEnum from "../model/config/enums/SortOrderDirectionOptionsEnum.ts";
import SelectSubredditListMenuSortOptionEnum from "../model/config/enums/SelectSubredditListMenuSortOptionEnum.ts";
import RandomIterationSelectWeightOptionsEnum from "../model/config/enums/RandomIterationSelectWeightOptionsEnum.ts";
import { saveConfig } from "../service/ConfigService.ts";
import { AppConfig } from "../model/config/AppConfig.ts";
import SubredditSourceOptionsEnum from "../model/config/enums/SubredditSourceOptionsEnum.ts";

export enum AppConfigActionType {
  SET_USERNAME = "SET_USERNAME",
  SET_PASSWORD = "SET_PASSWORD",
  SET_CLIENT_ID = "SET_CLIENT_ID",
  SET_CLIENT_SECRET = "SET_CLIENT_SECRET",
  SET_SUBREDDIT_SOURCE_OPTION = "SET_SUBREDDIT_SOURCE_OPTION",
  SET_SUBREDDIT_SORT_ORDER_OPTION = "SET_SUBREDDIT_SORT_ORDER_OPTION",
  SET_GET_ALL_SUBREDDITS_AT_ONCE = "SET_GET_ALL_SUBREDDITS_AT_ONCE",
  SET_AUTO_SCROLL_POST_ROW_OPTION = "SET_AUTO_SCROLL_POST_ROW_OPTION",
  SET_AUTO_SCROLL_POST_ROW_DIRECTION_OPTION = "SET_AUTO_SCROLL_POST_ROW_DIRECTION_OPTION",
  SET_AUTO_SCROLL_POST_ROW_RATE_SECONDS_FOR_SINGLE_POST_CARD = "SET_AUTO_SCROLL_POST_ROW_RATE_SECONDS_FOR_SINGLE_POST_CARD",
  CLEAR_AUTO_SCROLL_POST_ROW_RATE_SECONDS_FOR_SINGLE_POST_CARD_VALIDATION_ERROR = "CLEAR_AUTO_SCROLL_POST_ROW_RATE_SECONDS_FOR_SINGLE_POST_CARD_VALIDATION_ERROR",
  SET_RANDOM_ITERATION_SELECT_WEIGHT_OPTION = "SET_RANDOM_ITERATION_SELECT_WEIGHT_OPTION",
  SET_SELECT_SUBREDDIT_LIST_MENU_SORT_OPTION = "SET_SELECT_SUBREDDIT_LIST_MENU_SORT_OPTION",
  SET_SORT_ORDER_DIRECTION_OPTION = "SET_SORT_ORDER_DIRECTION_OPTION",
  SET_POST_SORT_ORDER_OPTION = "SET_POST_SORT_ORDER_OPTION",
  SET_USER_FRONT_PAGE_POST_SORT_ORDER_OPTION = "SET_USER_FRONT_PAGE_POST_SORT_ORDER_OPTION",
  SET_TOP_TIME_FRAME_OPTION = "SET_TOP_TIME_FRAME_OPTION",
  SET_SELECT_SUBREDDIT_ITERATION_METHOD_OPTION = "SET_SELECT_SUBREDDIT_ITERATION_METHOD_OPTION",
  SET_CONCAT_REDDIT_URL_MAX_LENGTH = "SET_CONCAT_REDDIT_URL_MAX_LENGTH",
  CLEAR_CONCAT_REDDIT_URL_MAX_LENGTH_VALIDATION_ERROR = "CLEAR_CONCAT_REDDIT_URL_MAX_LENGTH_VALIDATION_ERROR",
  SET_CONTENT_FILTERING = "SET_CONTENT_FILTERING",
  SET_REDDIT_API_ITEM_LIMIT = "SET_REDDIT_API_ITEM_LIMIT",
  SET_POSTS_TO_SHOW_IN_ROW = "SET_POSTS_TO_SHOW_IN_ROW",
  CLEAR_POSTS_TO_SHOW_IN_ROW_VALIDATION_ERROR = "CLEAR_POSTS_TO_SHOW_IN_ROW_VALIDATION_ERROR",
  SET_POST_ROWS_TO_SHOW_IN_VIEW = "SET_POST_ROWS_TO_SHOW_IN_VIEW",
  CLEAR_POST_ROWS_TO_SHOW_IN_VIEW_VALIDATION_ERROR = "CLEAR_POST_ROWS_TO_SHOW_IN_VIEW_VALIDATION_ERROR",
  TOGGLE_DARK_MODE = "TOGGLE_DARK_MODE",
  RESET_CONFIG_LOADED = "RESET_CONFIG_LOADED",
  SET_APP_CONFIG = "SET_APP_CONFIG",
  CLEAR_REDDIT_API_ITEM_LIMIT_VALIDATION_ERROR = "CLEAR_REDDIT_API_ITEM_LIMIT_VALIDATION_ERROR",
  SET_USE_IN_MEMORY_IMAGES_AND_GIFS = "SET_USE_IN_MEMORY_IMAGES_AND_GIFS",
}

export type AppConfigActionStringPayload = {
  type:
    | AppConfigActionType.SET_USERNAME
    | AppConfigActionType.SET_PASSWORD
    | AppConfigActionType.SET_CLIENT_ID
    | AppConfigActionType.SET_CLIENT_SECRET
    | AppConfigActionType.CLEAR_AUTO_SCROLL_POST_ROW_RATE_SECONDS_FOR_SINGLE_POST_CARD_VALIDATION_ERROR
    | AppConfigActionType.CLEAR_CONCAT_REDDIT_URL_MAX_LENGTH_VALIDATION_ERROR
    | AppConfigActionType.CLEAR_POSTS_TO_SHOW_IN_ROW_VALIDATION_ERROR
    | AppConfigActionType.CLEAR_POST_ROWS_TO_SHOW_IN_VIEW_VALIDATION_ERROR;
  payload: string;
};
export type AppConfigActionSubredditSourceOptionEnumPayload = {
  type: AppConfigActionType.SET_SUBREDDIT_SOURCE_OPTION;
  payload: SubredditSourceOptionsEnum;
};
export type AppConfigActionSubredditSortOrderOptionsEnumPayload = {
  type: AppConfigActionType.SET_SUBREDDIT_SORT_ORDER_OPTION;
  payload: SubredditSortOrderOptionsEnum;
};

export type AppConfigActionBooleanPayload = {
  type:
    | AppConfigActionType.SET_GET_ALL_SUBREDDITS_AT_ONCE
    | AppConfigActionType.SET_USE_IN_MEMORY_IMAGES_AND_GIFS;
  payload: boolean;
};

export type AppConfigActionAutoScrollPostRowOptionEnumPayload = {
  type: AppConfigActionType.SET_AUTO_SCROLL_POST_ROW_OPTION;
  payload: AutoScrollPostRowOptionEnum;
};
export type AppConfigActionAutoScrollPostRowDirectionOptionEnumPayload = {
  type: AppConfigActionType.SET_AUTO_SCROLL_POST_ROW_DIRECTION_OPTION;
  payload: AutoScrollPostRowDirectionOptionEnum;
};
export type AppConfigActionRandomIterationSelectWeightOptionEnumPayload = {
  type: AppConfigActionType.SET_RANDOM_ITERATION_SELECT_WEIGHT_OPTION;
  payload: RandomIterationSelectWeightOptionsEnum;
};
export type AppConfigActionSelectSubredditListMenuSortOptionEnumPayload = {
  type: AppConfigActionType.SET_SELECT_SUBREDDIT_LIST_MENU_SORT_OPTION;
  payload: SelectSubredditListMenuSortOptionEnum;
};
export type AppConfigActionSortOrderDirectionOptionEnumPayload = {
  type: AppConfigActionType.SET_SORT_ORDER_DIRECTION_OPTION;
  payload: SortOrderDirectionOptionsEnum;
};
export type AppConfigActionPostSortOrderOptionEnumPayload = {
  type: AppConfigActionType.SET_POST_SORT_ORDER_OPTION;
  payload: PostSortOrderOptionsEnum;
};
export type AppConfigActionTopTimeFrameOptionEnumPayload = {
  type: AppConfigActionType.SET_TOP_TIME_FRAME_OPTION;
  payload: TopTimeFrameOptionsEnum;
};
export type AppConfigActionSelectSubredditIterationMethodOptionEnumPayload = {
  type: AppConfigActionType.SET_SELECT_SUBREDDIT_ITERATION_METHOD_OPTION;
  payload: SelectSubredditIterationMethodOptionsEnum;
};
export type AppConfigActionContentFilteringEnumPayload = {
  type: AppConfigActionType.SET_CONTENT_FILTERING;
  payload: ContentFilteringOptionEnum;
};

export type AppConfigActionNumberPayload = {
  type:
    | AppConfigActionType.SET_AUTO_SCROLL_POST_ROW_RATE_SECONDS_FOR_SINGLE_POST_CARD
    | AppConfigActionType.SET_CONCAT_REDDIT_URL_MAX_LENGTH
    | AppConfigActionType.SET_REDDIT_API_ITEM_LIMIT
    | AppConfigActionType.SET_POSTS_TO_SHOW_IN_ROW
    | AppConfigActionType.SET_POST_ROWS_TO_SHOW_IN_VIEW;
  payload: number;
};

export type AppConfigActionNoPayload = {
  type:
    | AppConfigActionType.CLEAR_AUTO_SCROLL_POST_ROW_RATE_SECONDS_FOR_SINGLE_POST_CARD_VALIDATION_ERROR
    | AppConfigActionType.CLEAR_CONCAT_REDDIT_URL_MAX_LENGTH_VALIDATION_ERROR
    | AppConfigActionType.CLEAR_POSTS_TO_SHOW_IN_ROW_VALIDATION_ERROR
    | AppConfigActionType.CLEAR_POST_ROWS_TO_SHOW_IN_VIEW_VALIDATION_ERROR
    | AppConfigActionType.TOGGLE_DARK_MODE
    | AppConfigActionType.RESET_CONFIG_LOADED
    | AppConfigActionType.CLEAR_REDDIT_API_ITEM_LIMIT_VALIDATION_ERROR;
};

export type AppConfigActionAppConfigPayload = {
  type: AppConfigActionType.SET_APP_CONFIG;
  payload: AppConfig;
};
export default function AppConfigReducer(
  state: AppConfigState,
  action:
    | AppConfigActionStringPayload
    | AppConfigActionSubredditSourceOptionEnumPayload
    | AppConfigActionSubredditSortOrderOptionsEnumPayload
    | AppConfigActionBooleanPayload
    | AppConfigActionAutoScrollPostRowOptionEnumPayload
    | AppConfigActionAutoScrollPostRowDirectionOptionEnumPayload
    | AppConfigActionRandomIterationSelectWeightOptionEnumPayload
    | AppConfigActionSelectSubredditListMenuSortOptionEnumPayload
    | AppConfigActionSortOrderDirectionOptionEnumPayload
    | AppConfigActionPostSortOrderOptionEnumPayload
    | AppConfigActionTopTimeFrameOptionEnumPayload
    | AppConfigActionSelectSubredditIterationMethodOptionEnumPayload
    | AppConfigActionContentFilteringEnumPayload
    | AppConfigActionNumberPayload
    | AppConfigActionNoPayload
    | AppConfigActionAppConfigPayload
): AppConfigState {
  switch (action.type) {
    case AppConfigActionType.SET_USERNAME:
      return setUsername(state, action);
    case AppConfigActionType.SET_PASSWORD:
      return setPassword(state, action);
    case AppConfigActionType.SET_CLIENT_ID:
      return setClientId(state, action);
    case AppConfigActionType.SET_CLIENT_SECRET:
      return setClientSecret(state, action);
    case AppConfigActionType.SET_SUBREDDIT_SOURCE_OPTION:
      return setSubredditSourceOption(state, action);
    case AppConfigActionType.SET_SUBREDDIT_SORT_ORDER_OPTION:
      return setSubredditSortOrderOption(state, action);
    case AppConfigActionType.SET_GET_ALL_SUBREDDITS_AT_ONCE:
      return setGetAllSubredditsAtOnce(state, action);
    case AppConfigActionType.SET_AUTO_SCROLL_POST_ROW_OPTION:
      return setAutoScrollPostRowOption(state, action);
    case AppConfigActionType.SET_AUTO_SCROLL_POST_ROW_DIRECTION_OPTION:
      return setAutoScrollPostRowDirectionOption(state, action);
    case AppConfigActionType.SET_AUTO_SCROLL_POST_ROW_RATE_SECONDS_FOR_SINGLE_POST_CARD:
      return setAutoScrollPostRowRateSecondsForSinglePostCard(state, action);
    case AppConfigActionType.CLEAR_AUTO_SCROLL_POST_ROW_RATE_SECONDS_FOR_SINGLE_POST_CARD_VALIDATION_ERROR:
      return clearAutoScrollPostRowRateSecondsForSinglePostCardValidationError(
        state
      );

    case AppConfigActionType.SET_RANDOM_ITERATION_SELECT_WEIGHT_OPTION:
      return setRandomIterationSelectWeightOption(state, action);
    case AppConfigActionType.SET_SELECT_SUBREDDIT_LIST_MENU_SORT_OPTION:
      return setSelectSubredditListMenuSortOption(state, action);
    case AppConfigActionType.SET_SORT_ORDER_DIRECTION_OPTION:
      return setSortOrderDirectionOption(state, action);
    case AppConfigActionType.SET_POST_SORT_ORDER_OPTION:
      return setPostSortOrderOption(state, action);
    case AppConfigActionType.SET_TOP_TIME_FRAME_OPTION:
      return setTopTimeFrameOption(state, action);
    case AppConfigActionType.SET_SELECT_SUBREDDIT_ITERATION_METHOD_OPTION:
      return setSelectSubredditIterationMethodOption(state, action);
    case AppConfigActionType.SET_CONCAT_REDDIT_URL_MAX_LENGTH:
      return setConcatRedditUrlMaxLength(state, action);
    case AppConfigActionType.CLEAR_CONCAT_REDDIT_URL_MAX_LENGTH_VALIDATION_ERROR:
      return clearConcatRedditUrlMaxLengthValidationError(state);
    case AppConfigActionType.SET_CONTENT_FILTERING:
      return setContentFiltering(state, action);
    case AppConfigActionType.SET_REDDIT_API_ITEM_LIMIT:
      return setRedditApiItemLimit(state, action);
    case AppConfigActionType.SET_POSTS_TO_SHOW_IN_ROW:
      return setPostsToShowInRow(state, action);
    case AppConfigActionType.CLEAR_POSTS_TO_SHOW_IN_ROW_VALIDATION_ERROR:
      return clearPostsToShowInRowValidationError(state);
    case AppConfigActionType.SET_POST_ROWS_TO_SHOW_IN_VIEW:
      return setPostRowsToShowInView(state, action);
    case AppConfigActionType.CLEAR_POST_ROWS_TO_SHOW_IN_VIEW_VALIDATION_ERROR:
      return clearPostRowsToShowInViewValidationError(state);
    case AppConfigActionType.TOGGLE_DARK_MODE:
      return toggleDarkMode(state);
    case AppConfigActionType.RESET_CONFIG_LOADED:
      return resetConfigLoaded(state);
    case AppConfigActionType.SET_APP_CONFIG:
      return setAppConfig(action);
    case AppConfigActionType.CLEAR_REDDIT_API_ITEM_LIMIT_VALIDATION_ERROR:
      return clearRedditApiItemLimitValidationError(state);
    case AppConfigActionType.SET_USE_IN_MEMORY_IMAGES_AND_GIFS:
      return setUseInMemoryImagesAndGifs(state, action);
    default:
      return state;
  }
}
const setUsername = (
  state: AppConfigState,
  action: AppConfigActionStringPayload
): AppConfigState => {
  const updatedCredentials = { ...state.redditCredentials };
  updatedCredentials.username = action.payload;
  updatedCredentials.usernameValidationError = ValidationUtil.validateRequire(
    "Username",
    updatedCredentials.username,
    1,
    40
  );
  const updatedState = {
    ...state,
    redditCredentials: updatedCredentials,
  };
  saveConfig(updatedState);
  return updatedState;
};
const setPassword = (
  state: AppConfigState,
  action: AppConfigActionStringPayload
): AppConfigState => {
  const updatedCredentials = { ...state.redditCredentials };
  updatedCredentials.password = action.payload;
  updatedCredentials.passwordValidationError = ValidationUtil.validateRequire(
    "Password",
    updatedCredentials.password,
    1,
    40
  );
  const updatedState = {
    ...state,
    redditCredentials: updatedCredentials,
  };
  saveConfig(updatedState);
  return updatedState;
};
const setClientId = (
  state: AppConfigState,
  action: AppConfigActionStringPayload
): AppConfigState => {
  const updatedCredentials = { ...state.redditCredentials };
  updatedCredentials.clientId = action.payload;
  updatedCredentials.clientIdValidationError = ValidationUtil.validateRequire(
    "Client ID",
    updatedCredentials.clientId,
    1,
    40
  );
  const updatedState = {
    ...state,
    redditCredentials: updatedCredentials,
  };
  saveConfig(updatedState);
  return updatedState;
};
const setClientSecret = (
  state: AppConfigState,
  action: AppConfigActionStringPayload
): AppConfigState => {
  const updatedCredentials = { ...state.redditCredentials };
  updatedCredentials.clientSecret = action.payload;
  updatedCredentials.clientSecretValidationError =
    ValidationUtil.validateRequire(
      "Client Secret",
      updatedCredentials.clientSecret,
      1,
      40
    );
  const updatedState = {
    ...state,
    redditCredentials: updatedCredentials,
  };
  saveConfig(updatedState);
  return updatedState;
};
const setSubredditSourceOption = (
  state: AppConfigState,
  action: AppConfigActionSubredditSourceOptionEnumPayload
): AppConfigState => {
  const updatedState = { ...state };
  updatedState.subredditSourceOption = action.payload;
  saveConfig(updatedState);
  return updatedState;
};
const setSubredditSortOrderOption = (
  state: AppConfigState,
  action: AppConfigActionSubredditSortOrderOptionsEnumPayload
): AppConfigState => {
  const updatedState = { ...state };
  updatedState.subredditSortOrderOption = action.payload;
  saveConfig(updatedState);
  return updatedState;
};

const setGetAllSubredditsAtOnce = (
  state: AppConfigState,
  action: AppConfigActionBooleanPayload
): AppConfigState => {
  const updatedState = {
    ...state,
    getAllSubredditsAtOnce: action.payload,
  };
  saveConfig(updatedState);
  return updatedState;
};
const setAutoScrollPostRowOption = (
  state: AppConfigState,
  action: AppConfigActionAutoScrollPostRowOptionEnumPayload
): AppConfigState => {
  const updatedState = { ...state };
  updatedState.autoScrollPostRowOption = action.payload;
  saveConfig(updatedState);
  return updatedState;
};
const setAutoScrollPostRowDirectionOption = (
  state: AppConfigState,
  action: AppConfigActionAutoScrollPostRowDirectionOptionEnumPayload
): AppConfigState => {
  const updatedState = {
    ...state,
    autoScrollPostRowDirectionOption: action.payload,
  };
  saveConfig(updatedState);
  return updatedState;
};
const setAutoScrollPostRowRateSecondsForSinglePostCard = (
  state: AppConfigState,
  action: AppConfigActionNumberPayload
): AppConfigState => {
  const validationError =
    validateAutoScrollPostRowRateSecondsForSinglePostCardField(action.payload);
  const updatedState = { ...state };
  if (validationError !== undefined) {
    updatedState.autoScrollPostRowRateSecondsForSinglePostCardValidationError =
      validationError;
    if (
      action.payload <
      MIN_AUTO_SCROLL_POST_ROW_RATE_SECONDS_FOR_SINGLE_POST_CARD
    ) {
      updatedState.autoScrollPostRowRateSecondsForSinglePostCard =
        MIN_AUTO_SCROLL_POST_ROW_RATE_SECONDS_FOR_SINGLE_POST_CARD;
    } else if (
      action.payload >
      MAX_AUTO_SCROLL_POST_ROW_RATE_SECONDS_FOR_SINGLE_POST_CARD
    ) {
      updatedState.autoScrollPostRowRateSecondsForSinglePostCard =
        MAX_AUTO_SCROLL_POST_ROW_RATE_SECONDS_FOR_SINGLE_POST_CARD;
    }
  } else {
    updatedState.autoScrollPostRowRateSecondsForSinglePostCardValidationError =
      undefined;
    updatedState.autoScrollPostRowRateSecondsForSinglePostCard = action.payload;
  }
  saveConfig(updatedState);
  return updatedState;
};
const clearAutoScrollPostRowRateSecondsForSinglePostCardValidationError = (
  state: AppConfigState
): AppConfigState => {
  return {
    ...state,
    autoScrollPostRowRateSecondsForSinglePostCardValidationError: undefined,
  };
};
const setRandomIterationSelectWeightOption = (
  state: AppConfigState,
  action: AppConfigActionRandomIterationSelectWeightOptionEnumPayload
): AppConfigState => {
  const updatedState = { ...state };
  updatedState.randomIterationSelectWeightOption = action.payload;
  saveConfig(updatedState);
  return updatedState;
};
const setSelectSubredditListMenuSortOption = (
  state: AppConfigState,
  action: AppConfigActionSelectSubredditListMenuSortOptionEnumPayload
): AppConfigState => {
  const updatedState = { ...state };
  updatedState.selectSubredditListMenuSortOption = action.payload;
  saveConfig(updatedState);
  return updatedState;
};
const setSortOrderDirectionOption = (
  state: AppConfigState,
  action: AppConfigActionSortOrderDirectionOptionEnumPayload
): AppConfigState => {
  const updatedState = { ...state };
  updatedState.sortOrderDirectionOption = action.payload;
  saveConfig(updatedState);
  return updatedState;
};
const setPostSortOrderOption = (
  state: AppConfigState,
  action: AppConfigActionPostSortOrderOptionEnumPayload
): AppConfigState => {
  const updatedState = { ...state };
  updatedState.postSortOrderOption = action.payload;
  saveConfig(updatedState);
  return updatedState;
};
const setTopTimeFrameOption = (
  state: AppConfigState,
  action: AppConfigActionTopTimeFrameOptionEnumPayload
): AppConfigState => {
  const updatedState = { ...state };
  updatedState.topTimeFrameOption = action.payload;
  saveConfig(updatedState);
  return updatedState;
};
const setSelectSubredditIterationMethodOption = (
  state: AppConfigState,
  action: AppConfigActionSelectSubredditIterationMethodOptionEnumPayload
): AppConfigState => {
  const updatedState = { ...state };
  updatedState.selectSubredditIterationMethodOption = action.payload;
  saveConfig(updatedState);
  return updatedState;
};
const setConcatRedditUrlMaxLength = (
  state: AppConfigState,
  action: AppConfigActionNumberPayload
): AppConfigState => {
  const concatRedditUrlMaxLength = action.payload;
  const validationError = validateConcatRedditUrlLengthField(
    concatRedditUrlMaxLength
  );
  const updatedState = { ...state };
  if (validationError !== undefined) {
    updatedState.concatRedditUrlMaxLengthValidationError = validationError;
    if (concatRedditUrlMaxLength < MIN_CONCAT_REDDIT_URL_LENGTH) {
      updatedState.concatRedditUrlMaxLength = MIN_CONCAT_REDDIT_URL_LENGTH;
    } else if (concatRedditUrlMaxLength > Max_CONCAT_REDDIT_URL_LENGTH) {
      updatedState.concatRedditUrlMaxLength = Max_CONCAT_REDDIT_URL_LENGTH;
    }
  } else {
    updatedState.concatRedditUrlMaxLength = concatRedditUrlMaxLength;
    updatedState.concatRedditUrlMaxLengthValidationError = undefined;
  }
  saveConfig(updatedState);
  return updatedState;
};
const clearConcatRedditUrlMaxLengthValidationError = (
  state: AppConfigState
): AppConfigState => {
  return {
    ...state,
    concatRedditUrlMaxLengthValidationError: undefined,
  };
};
const setContentFiltering = (
  state: AppConfigState,
  action: AppConfigActionContentFilteringEnumPayload
): AppConfigState => {
  const updatedState = { ...state };
  updatedState.contentFiltering = action.payload;
  saveConfig(updatedState);
  return updatedState;
};
const setRedditApiItemLimit = (
  state: AppConfigState,
  action: AppConfigActionNumberPayload
): AppConfigState => {
  const redditApiItemLimit = action.payload;
  const validationError = validateRedditApiItemLimitField(redditApiItemLimit);
  const updatedState = { ...state };
  if (validationError !== undefined) {
    updatedState.redditApiItemLimitValidationError = validationError;
    if (redditApiItemLimit < MIN_REDDIT_API_ITEM_LIMIT) {
      updatedState.redditApiItemLimit = MIN_REDDIT_API_ITEM_LIMIT;
    } else if (redditApiItemLimit > MAX_REDDIT_API_ITEM_LIMIT) {
      updatedState.redditApiItemLimit = MAX_REDDIT_API_ITEM_LIMIT;
    }
  } else {
    updatedState.redditApiItemLimit = redditApiItemLimit;
    updatedState.redditApiItemLimitValidationError = undefined;
  }

  saveConfig(updatedState);
  return updatedState;
};

const clearRedditApiItemLimitValidationError = (state: AppConfigState) => {
  return {
    ...state,
    redditApiItemLimitValidationError: undefined,
  };
};

const setUseInMemoryImagesAndGifs = (
  state: AppConfigState,
  action: AppConfigActionBooleanPayload
): AppConfigState => {
  const updatedState = {
    ...state,
    useInMemoryImagesAndGifs: action.payload,
  };
  saveConfig(updatedState);
  return updatedState;
};
const setPostsToShowInRow = (
  state: AppConfigState,
  action: AppConfigActionNumberPayload
): AppConfigState => {
  const postsToShowInRow = action.payload;
  const validationError = validatePostsToShowInRowField(postsToShowInRow);
  const updatedState = { ...state };
  if (validationError !== undefined) {
    updatedState.postsToShowInRowValidationError = validationError;
    if (postsToShowInRow < MIN_POSTS_TO_SHOW_IN_ROW) {
      updatedState.postsToShowInRow = MIN_POSTS_TO_SHOW_IN_ROW;
    } else if (postsToShowInRow > MAX_POSTS_TO_SHOW_IN_ROW) {
      updatedState.postsToShowInRow = MAX_POSTS_TO_SHOW_IN_ROW;
    }
  } else {
    updatedState.postsToShowInRowValidationError = undefined;
    updatedState.postsToShowInRow = postsToShowInRow;
  }
  saveConfig(updatedState);
  return updatedState;
};
const clearPostsToShowInRowValidationError = (
  state: AppConfigState
): AppConfigState => {
  return {
    ...state,
    postsToShowInRowValidationError: undefined,
  };
};
const setPostRowsToShowInView = (
  state: AppConfigState,
  action: AppConfigActionNumberPayload
): AppConfigState => {
  const postRowsToShowInView = action.payload;
  const validationError =
    validatePostRowsToShowInViewField(postRowsToShowInView);
  const updatedState = { ...state };
  if (validationError !== undefined) {
    updatedState.postRowsToShowInViewValidationError = validationError;
    if (postRowsToShowInView < MIN_POST_ROWS_TO_SHOW_IN_VIEW) {
      updatedState.postRowsToShowInView = MIN_POST_ROWS_TO_SHOW_IN_VIEW;
    } else if (postRowsToShowInView > MAX_POST_ROWS_TO_SHOW_IN_VIEW) {
      updatedState.postRowsToShowInView = MAX_POST_ROWS_TO_SHOW_IN_VIEW;
    }
  } else {
    updatedState.postRowsToShowInViewValidationError = undefined;
    updatedState.postRowsToShowInView = postRowsToShowInView;
  }
  saveConfig(updatedState);
  return updatedState;
};
const clearPostRowsToShowInViewValidationError = (
  state: AppConfigState
): AppConfigState => {
  return {
    ...state,
    postRowsToShowInViewValidationError: undefined,
  };
};
const toggleDarkMode = (state: AppConfigState): AppConfigState => {
  const updatedState = {
    ...state,
    darkMode: !state.darkMode,
  };
  saveConfig(updatedState);
  return updatedState;
};
const resetConfigLoaded = (state: AppConfigState): AppConfigState => {
  return {
    ...state,
    configLoaded: false,
  };
};
const setAppConfig = (
  action: AppConfigActionAppConfigPayload
): AppConfigState => {
  return { ...(action.payload as AppConfigState), configLoaded: true };
};

const validateAutoScrollPostRowRateSecondsForSinglePostCardField = (
  postsPerSecond: number
) => {
  return ValidationUtil.validateNumberRequire(
    "Seconds to Move Single Post Card",
    postsPerSecond,
    MIN_AUTO_SCROLL_POST_ROW_RATE_SECONDS_FOR_SINGLE_POST_CARD,
    MAX_AUTO_SCROLL_POST_ROW_RATE_SECONDS_FOR_SINGLE_POST_CARD
  );
};

const validateConcatRedditUrlLengthField = (concateRedditUrlLength: number) => {
  return ValidationUtil.validateNumberRequire(
    "Reddit URL Max Length",
    concateRedditUrlLength,
    MIN_CONCAT_REDDIT_URL_LENGTH,
    Max_CONCAT_REDDIT_URL_LENGTH
  );
};

const validateRedditApiItemLimitField = (redditApiItemLimit: number) => {
  return ValidationUtil.validateNumberRequire(
    "Reddit API Limit",
    redditApiItemLimit,
    MIN_REDDIT_API_ITEM_LIMIT,
    MAX_REDDIT_API_ITEM_LIMIT
  );
};

const validatePostsToShowInRowField = (postsToShowInRow: number) => {
  return ValidationUtil.validateNumberRequire(
    "Posts to Show In Row",
    postsToShowInRow,
    MIN_POSTS_TO_SHOW_IN_ROW,
    MAX_POSTS_TO_SHOW_IN_ROW
  );
};

const validatePostRowsToShowInViewField = (postRowsToShowInView: number) => {
  return ValidationUtil.validateNumberRequire(
    "Post Rows to Show In View",
    postRowsToShowInView,
    MIN_POST_ROWS_TO_SHOW_IN_VIEW,
    MAX_POST_ROWS_TO_SHOW_IN_VIEW
  );
};
