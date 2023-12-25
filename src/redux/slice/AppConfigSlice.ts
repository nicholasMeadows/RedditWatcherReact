import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  MAX_POSTS_TO_SHOW_IN_ROW,
  MAX_POST_ROWS_TO_SHOW_IN_VIEW,
  MAX_REDDIT_API_ITEM_LIMIT,
  MIN_CONCAT_REDDIT_URL_LENGTH,
  MIN_POSTS_TO_SHOW_IN_ROW,
  MIN_POST_ROWS_TO_SHOW_IN_VIEW,
  MIN_REDDIT_API_ITEM_LIMIT,
  Max_CONCAT_REDDIT_URL_LENGTH,
} from "../../RedditWatcherConstants";
import ImportExportConfig from "../../model/ImportExportConfig";
import { Subreddit } from "../../model/Subreddit/Subreddit";
import { SubredditLists } from "../../model/SubredditList/SubredditLists";
import { AppConfig } from "../../model/config/AppConfig";
import { AppConfigState } from "../../model/config/AppConfigState";
import ContentFilteringOptionEnum from "../../model/config/enums/ContentFilteringOptionEnum";
import PostRowScrollOptionsEnum from "../../model/config/enums/PostRowScrollOptionsEnum";
import PostSortOrderOptionsEnum from "../../model/config/enums/PostSortOrderOptionsEnum";
import RandomIterationSelectWeightOptionsEnum from "../../model/config/enums/RandomIterationSelectWeightOptionsEnum";
import RowIncrementOptionsEnum from "../../model/config/enums/RowIncrementOptionsEnum";
import SelectSubredditIterationMethodOptionsEnum from "../../model/config/enums/SelectSubredditIterationMethodOptionsEnum";
import SelectSubredditListMenuSortOptionEnum from "../../model/config/enums/SelectSubredditListMenuSortOptionEnum";
import SelectedSubredditListSortOptionEnum from "../../model/config/enums/SelectedSubredditListSortOptionEnum";
import SortOrderDirectionOptionsEnum from "../../model/config/enums/SortOrderDirectionOptionsEnum";
import SubredditSortOrderOptionsEnum from "../../model/config/enums/SubredditSortOrderOptionsEnum";
import TopTimeFrameOptionsEnum from "../../model/config/enums/TopTimeFrameOptionsEnum";
import UserFrontPagePostSortOrderOptionsEnum from "../../model/config/enums/UserFrontPagePostSortOrderOptionsEnum";
import {
  exportConfigDownload,
  fillInMissingFieldsInConfigObj,
  loadConfig,
  saveConfig,
  saveSubredditLists,
} from "../../service/ConfigService";
import { ValidationUtil } from "../../util/ValidationUtil";
import store from "../store";
import { clearPostRows } from "./PostRowsSlice";
import { resetRedditClient } from "./RedditClientSlice";
import { resetSubredditListsLoaded } from "./RedditListsSlice";

const defaultSubredditSortOrderOption = SubredditSortOrderOptionsEnum.Random;
const defaultRowIncrementOption = RowIncrementOptionsEnum.IncrementBySinglePost;
const defaultPostRowScrollOption = PostRowScrollOptionsEnum.AutoScroll;
const defaultSelectedSubredditListSortOption =
  SelectedSubredditListSortOptionEnum.Alphabetically;
const defaultRandomIterationSelectWeightOption =
  RandomIterationSelectWeightOptionsEnum.PureRandom;
const defaultSelectSubredditListMenuSortOption =
  SelectSubredditListMenuSortOptionEnum.Alphabetically;
const defaultSortOrderDirectionOption = SortOrderDirectionOptionsEnum.Normal;
const defaultPostSortOrderOption = PostSortOrderOptionsEnum.Random;
const defaultUserFrontPagePostSortOrderOption =
  UserFrontPagePostSortOrderOptionsEnum.NotSelected;
const defaultTopTimeFrameOption = TopTimeFrameOptionsEnum.All;
const defaultSelectSubredditIterationMethodOption =
  SelectSubredditIterationMethodOptionsEnum.Sequential;
const defaultConcatRedditUrlMaxLength = 1000;
const defaultContentFiltering = ContentFilteringOptionEnum.SFW;
const defaultRedditApiItemLimit = 25;
const defaultPostsToShowInRow = 4;
const defaultPostRowsToShowInView = 3;
const defaultDarkMode = false;

export const loadAppConfig = createAsyncThunk(
  "appConfig/loadAppConfig",
  async () => {
    const config = await loadConfig();
    return config;
  }
);

export const importAppConfig = createAsyncThunk(
  "appConfig/importAppConfig",
  async (file: File) => {
    try {
      console.log("importing app config");
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (parsed["appConfig"] != undefined) {
        console.log(
          "appConfig was not undefined. Setting up app config",
          parsed["appConfig"]
        );
        const config = fillInMissingFieldsInConfigObj(parsed["appConfig"]);
        await saveConfig(config);
      }

      if (parsed["subredditLists"] != undefined) {
        const subredditListsToSave = new Array<SubredditLists>();
        let failedParsing = false;
        const subredditLists = parsed["subredditLists"];
        if (Array.isArray(subredditLists)) {
          for (const list of subredditLists) {
            if (
              Object.hasOwn(list, "subredditListUuid") &&
              Object.hasOwn(list, "listName") &&
              Object.hasOwn(list, "subreddits") &&
              Object.hasOwn(list, "selected")
            ) {
              const parsedSubreddits = new Array<Subreddit>();
              if (Array.isArray(list["subreddits"])) {
                const subreddits = list["subreddits"];
                for (const subreddit of subreddits) {
                  if (
                    Object.hasOwn(subreddit, "displayName") &&
                    Object.hasOwn(subreddit, "displayNamePrefixed") &&
                    Object.hasOwn(subreddit, "subscribers") &&
                    Object.hasOwn(subreddit, "over18") &&
                    Object.hasOwn(subreddit, "isSubscribed") &&
                    Object.hasOwn(subreddit, "fromList") &&
                    Object.hasOwn(subreddit, "subredditUuid")
                  ) {
                    parsedSubreddits.push({
                      displayName: subreddit["displayName"],
                      displayNamePrefixed: subreddit["displayNamePrefixed"],
                      subscribers: subreddit["subscribers"],
                      over18: subreddit["over18"],
                      isSubscribed: subreddit["isSubscribed"],
                      fromList: subreddit["fromList"],
                      subredditUuid: subreddit["subredditUuid"],
                      isUser: subreddit["isUser"],
                    });
                  } else {
                    failedParsing = true;
                    break;
                  }
                }
              }
              if (failedParsing) {
                break;
              } else {
                const subredditList: SubredditLists = {
                  subredditListUuid: "",
                  listName: list["listName"],
                  subreddits: parsedSubreddits,
                  selected: list["selected"],
                };
                subredditListsToSave.push(subredditList);
              }
            } else {
              failedParsing = false;
              break;
            }
          }
        } else {
          failedParsing = true;
        }

        if (!failedParsing) {
          await saveSubredditLists(subredditListsToSave);
        }
      }

      console.log("done importing");
      store.dispatch(clearPostRows());
      store.dispatch(resetConfigLoaded());
      store.dispatch(resetSubredditListsLoaded());
      store.dispatch(resetRedditClient());
    } catch (e) {
      console.log("exception", e);
    }
  }
);

export const exportAppConfig = createAsyncThunk(
  "appConfig/exportAppConfig",
  async () => {
    const state = store.getState();
    const configObj: ImportExportConfig = {
      appConfig: state.appConfig as AppConfig,
      subredditLists: state.subredditLists.subredditLists,
    };
    const myFile = new File(
      [JSON.stringify(configObj)],
      "reddit-watcher-config.json"
    );
    exportConfigDownload(myFile);
  }
);

function validateCredentialFields(state: AppConfigState) {
  state.redditCredentials.usernameValidationError =
    ValidationUtil.validateRequire(
      "Username",
      state.redditCredentials.username,
      1,
      40
    );
  state.redditCredentials.passwordValidationError =
    ValidationUtil.validateRequire(
      "Password",
      state.redditCredentials.password,
      1,
      40
    );
  state.redditCredentials.clientIdValidationError =
    ValidationUtil.validateRequire(
      "Client ID",
      state.redditCredentials.clientId,
      1,
      40
    );
  state.redditCredentials.clientSecretValidationError =
    ValidationUtil.validateRequire(
      "Client Secret",
      state.redditCredentials.clientSecret,
      1,
      40
    );
}

function validateConcateRedditUrlLengthField(concateRedditUrlLength: number) {
  return ValidationUtil.validateNumberRequire(
    "Reddit URL Max Length",
    concateRedditUrlLength,
    MIN_CONCAT_REDDIT_URL_LENGTH,
    Max_CONCAT_REDDIT_URL_LENGTH
  );
}
function validateRedditApiItemLimitField(redditApiItemLimit: number) {
  return ValidationUtil.validateNumberRequire(
    "Reddit API Limit",
    redditApiItemLimit,
    MIN_REDDIT_API_ITEM_LIMIT,
    MAX_REDDIT_API_ITEM_LIMIT
  );
}
function validatePostsToShowInRowField(postsToShowInRow: number) {
  return ValidationUtil.validateNumberRequire(
    "Posts to Show In Row",
    postsToShowInRow,
    MIN_POSTS_TO_SHOW_IN_ROW,
    MAX_POSTS_TO_SHOW_IN_ROW
  );
}

function validatePostRowsToShowInViewField(postRowsToShowInView: number) {
  return ValidationUtil.validateNumberRequire(
    "Post Rows to Show In View",
    postRowsToShowInView,
    MIN_POST_ROWS_TO_SHOW_IN_VIEW,
    MAX_POST_ROWS_TO_SHOW_IN_VIEW
  );
}

const initialState: AppConfigState = {
  redditCredentials: {
    username: "",
    usernameValidationError: undefined,
    password: "",
    passwordValidationError: undefined,
    clientId: "",
    clientIdValidationError: undefined,
    clientSecret: "",
    clientSecretValidationError: undefined,
  },
  subredditSortOrderOption: defaultSubredditSortOrderOption,
  rowIncrementOption: defaultRowIncrementOption,
  postRowScrollOption: defaultPostRowScrollOption,
  selectedSubredditListSortOption: defaultSelectedSubredditListSortOption,
  randomIterationSelectWeightOption: defaultRandomIterationSelectWeightOption,
  selectSubredditListMenuSortOption: defaultSelectSubredditListMenuSortOption,
  sortOrderDirectionOption: defaultSortOrderDirectionOption,
  postSortOrderOption: defaultPostSortOrderOption,
  userFrontPagePostSortOrderOption: defaultUserFrontPagePostSortOrderOption,
  topTimeFrameOption: defaultTopTimeFrameOption,
  selectSubredditIterationMethodOption:
    defaultSelectSubredditIterationMethodOption,
  concatRedditUrlMaxLength: defaultConcatRedditUrlMaxLength,
  concatRedditUrlMaxLengthValidationError: undefined,
  contentFiltering: defaultContentFiltering,
  redditApiItemLimit: defaultRedditApiItemLimit,
  redditApiItemLimitValidationError: undefined,
  postsToShowInRow: defaultPostsToShowInRow,
  postsToShowInRowValidationError: undefined,
  postRowsToShowInView: defaultPostRowsToShowInView,
  postRowsToShowInViewValidationError: undefined,
  configLoaded: false,
  darkMode: defaultDarkMode,
};

export const appConfigSlice = createSlice({
  name: "appConfig",
  initialState: initialState,
  reducers: {
    setUsername: (state, action) => {
      state.redditCredentials.username = action.payload;
      validateCredentialFields(state);
      saveConfig(state);
    },
    setPassword: (state, action) => {
      state.redditCredentials.password = action.payload;
      validateCredentialFields(state);
      saveConfig(state);
    },
    setClientId: (state, action) => {
      state.redditCredentials.clientId = action.payload;
      validateCredentialFields(state);
      saveConfig(state);
    },
    setClientSecret: (state, action) => {
      state.redditCredentials.clientSecret = action.payload;
      validateCredentialFields(state);
      saveConfig(state);
    },
    setSubredditSortOrderOption: (state, action) => {
      state.subredditSortOrderOption = action.payload;
      saveConfig(state);
    },
    setRowIncrementOption: (state, action) => {
      state.rowIncrementOption = action.payload;
      saveConfig(state);
    },
    setPostRowScrollOption: (state, action) => {
      state.postRowScrollOption = action.payload;
      saveConfig(state);
    },
    setSelectedSubredditListSortOption: (state, action) => {
      state.selectedSubredditListSortOption = action.payload;
      saveConfig(state);
    },
    setRandomIterationSelectWeightOption: (state, action) => {
      state.randomIterationSelectWeightOption = action.payload;
      saveConfig(state);
    },
    setSelectSubredditListMenuSortOption: (state, action) => {
      state.selectSubredditListMenuSortOption = action.payload;
      saveConfig(state);
    },
    setSortOrderDirectionOption: (state, action) => {
      state.sortOrderDirectionOption = action.payload;
      saveConfig(state);
    },
    setPostSortOrderOption: (state, action) => {
      state.postSortOrderOption = action.payload;
      saveConfig(state);
    },
    setUserFrontPagePostSortOrderOption: (state, action) => {
      state.userFrontPagePostSortOrderOption = action.payload;
      saveConfig(state);
    },
    setTopTimeFrameOption: (state, action) => {
      state.topTimeFrameOption = action.payload;
      saveConfig(state);
    },
    setSelectSubredditIterationMethodOption: (state, action) => {
      state.selectSubredditIterationMethodOption = action.payload;
      saveConfig(state);
    },
    validateConcateRedditUrlLength: (
      state,
      action: { type: string; payload: number }
    ) => {
      state.concatRedditUrlMaxLengthValidationError =
        validateConcateRedditUrlLengthField(action.payload);
    },
    setConcatRedditUrlMaxLength: (
      state,
      action: { type: string; payload: number }
    ) => {
      const concatRedditUrlMaxLength = action.payload;
      const validationError = validateConcateRedditUrlLengthField(
        concatRedditUrlMaxLength
      );
      if (validationError == undefined) {
        state.concatRedditUrlMaxLength = concatRedditUrlMaxLength;
      } else {
        if (concatRedditUrlMaxLength < MIN_CONCAT_REDDIT_URL_LENGTH) {
          state.concatRedditUrlMaxLength = MIN_CONCAT_REDDIT_URL_LENGTH;
        } else if (concatRedditUrlMaxLength > Max_CONCAT_REDDIT_URL_LENGTH) {
          state.concatRedditUrlMaxLength = Max_CONCAT_REDDIT_URL_LENGTH;
        }
      }
      state.concatRedditUrlMaxLengthValidationError = validationError;
      saveConfig(state);
    },
    setContentFiltering: (state, action) => {
      state.contentFiltering = action.payload;
      saveConfig(state);
    },
    validateRedditApiItemLimit: (
      state,
      action: { type: string; payload: number }
    ) => {
      state.redditApiItemLimitValidationError = validateRedditApiItemLimitField(
        action.payload
      );
    },
    setRedditApiItemLimit: (
      state,
      action: { type: string; payload: number }
    ) => {
      const redditApiItemLimit = action.payload;
      const validationError =
        validateRedditApiItemLimitField(redditApiItemLimit);
      if (validationError == undefined) {
        state.redditApiItemLimit = redditApiItemLimit;
      } else {
        if (redditApiItemLimit < MIN_REDDIT_API_ITEM_LIMIT) {
          state.redditApiItemLimit = MIN_REDDIT_API_ITEM_LIMIT;
        } else if (redditApiItemLimit > MAX_REDDIT_API_ITEM_LIMIT) {
          state.redditApiItemLimit = MAX_REDDIT_API_ITEM_LIMIT;
        }
      }
      state.redditApiItemLimitValidationError = validationError;
      saveConfig(state);
    },
    validatePostsToShowInRow: (
      state,
      action: { type: string; payload: number }
    ) => {
      state.postsToShowInRowValidationError = validatePostsToShowInRowField(
        action.payload
      );
    },
    setPostsToShowInRow: (state, action: { type: string; payload: number }) => {
      const postsToShowInRow = action.payload;
      const validationError = validatePostsToShowInRowField(postsToShowInRow);
      if (validationError == undefined) {
        state.postsToShowInRow = postsToShowInRow;
      } else {
        if (postsToShowInRow < MIN_POSTS_TO_SHOW_IN_ROW) {
          state.postsToShowInRow = MIN_POSTS_TO_SHOW_IN_ROW;
        } else if (postsToShowInRow > MAX_POSTS_TO_SHOW_IN_ROW) {
          state.postsToShowInRow = MAX_POSTS_TO_SHOW_IN_ROW;
        }
      }
      state.postsToShowInRowValidationError = validationError;
      saveConfig(state);
    },
    validatePostRowsToShowInView: (
      state,
      action: { type: string; payload: number }
    ) => {
      state.postRowsToShowInViewValidationError =
        validatePostRowsToShowInViewField(action.payload);
    },
    setPostRowsToShowInView: (
      state,
      action: { type: string; payload: number }
    ) => {
      const postRowsToShowInView = action.payload;
      const validationError =
        validatePostRowsToShowInViewField(postRowsToShowInView);
      if (validationError == undefined) {
        state.postRowsToShowInView = postRowsToShowInView;
      } else {
        if (postRowsToShowInView < MIN_POST_ROWS_TO_SHOW_IN_VIEW) {
          state.postRowsToShowInView = MIN_POST_ROWS_TO_SHOW_IN_VIEW;
        } else if (postRowsToShowInView > MAX_POST_ROWS_TO_SHOW_IN_VIEW) {
          state.postRowsToShowInView = MAX_POST_ROWS_TO_SHOW_IN_VIEW;
        }
      }
      state.postRowsToShowInViewValidationError = validationError;
      saveConfig(state);
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      saveConfig(state);
    },
    resetConfigLoaded: (state) => {
      state.configLoaded = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadAppConfig.fulfilled, (state, action) => {
      const incoming = action.payload as AppConfigState;
      state.redditCredentials = incoming.redditCredentials;
      state.subredditSortOrderOption = incoming.subredditSortOrderOption;
      state.rowIncrementOption = incoming.rowIncrementOption;
      state.postRowScrollOption = incoming.postRowScrollOption;
      state.selectedSubredditListSortOption =
        incoming.selectedSubredditListSortOption;
      state.randomIterationSelectWeightOption =
        incoming.randomIterationSelectWeightOption;
      state.selectSubredditListMenuSortOption =
        incoming.selectSubredditListMenuSortOption;
      state.sortOrderDirectionOption = incoming.sortOrderDirectionOption;
      state.postSortOrderOption = incoming.postSortOrderOption;
      state.userFrontPagePostSortOrderOption =
        incoming.userFrontPagePostSortOrderOption;
      state.topTimeFrameOption = incoming.topTimeFrameOption;
      state.selectSubredditIterationMethodOption =
        incoming.selectSubredditIterationMethodOption;
      state.concatRedditUrlMaxLength = incoming.concatRedditUrlMaxLength;
      state.contentFiltering = incoming.contentFiltering;
      state.redditApiItemLimit = incoming.redditApiItemLimit;
      state.postsToShowInRow = incoming.postsToShowInRow;
      state.postRowsToShowInView = incoming.postRowsToShowInView;
      state.darkMode = incoming.darkMode;
      state.configLoaded = true;
    });
  },
});

export const {
  setClientId,
  setClientSecret,
  setPassword,
  setUsername,
  setSubredditSortOrderOption,
  setRowIncrementOption,
  setPostRowScrollOption,
  setSelectedSubredditListSortOption,
  setRandomIterationSelectWeightOption,
  setSelectSubredditListMenuSortOption,
  setSortOrderDirectionOption,
  setPostSortOrderOption,
  setUserFrontPagePostSortOrderOption,
  setTopTimeFrameOption,
  setSelectSubredditIterationMethodOption,
  validateConcateRedditUrlLength,
  setConcatRedditUrlMaxLength,
  setContentFiltering,
  validateRedditApiItemLimit,
  setRedditApiItemLimit,
  validatePostsToShowInRow,
  setPostsToShowInRow,
  validatePostRowsToShowInView,
  setPostRowsToShowInView,
  toggleDarkMode,
  resetConfigLoaded,
} = appConfigSlice.actions;
export default appConfigSlice.reducer;
