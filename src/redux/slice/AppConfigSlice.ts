import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
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
import { ValidationUtil } from "../../util/ValidationUtil";
import {
  exportConfigDownload,
  fillInMissingFieldsInConfigObj,
  loadConfig,
  saveConfig,
  saveSubredditLists,
} from "../../service/ConfigService";
import { AppConfig } from "../../model/config/AppConfig";
import store from "../store";
import ImportExportConfig from "../../model/ImportExportConfig";
import { SubredditLists } from "../../model/SubredditList/SubredditLists";
import { Subreddit } from "../../model/Subreddit/Subreddit";
import { resetSubredditListsLoaded } from "./RedditListsSlice";
import { resetRedditClient } from "./RedditClientSlice";
import { clearPostRows } from "./PostRowsSlice";
import { useNavigate } from "react-router-dom";

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
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (parsed["appConfig"] != undefined) {
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

    store.dispatch(clearPostRows());
    store.dispatch(resetConfigLoaded());
    store.dispatch(resetSubredditListsLoaded());
    store.dispatch(resetRedditClient());

    useNavigate()("/");
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
    setConcatRedditUrlMaxLength: (state, action) => {
      const validationError = ValidationUtil.validateNumberRequire(
        "Reddit URL Max Length",
        action.payload,
        1,
        1000
      );
      if (validationError == undefined) {
        state.concatRedditUrlMaxLength = action.payload;
      }
      state.concatRedditUrlMaxLengthValidationError = validationError;
      saveConfig(state);
    },
    setContentFiltering: (state, action) => {
      state.contentFiltering = action.payload;
      saveConfig(state);
    },
    setRedditApiItemLimit: (state, action) => {
      const validationError = ValidationUtil.validateNumberRequire(
        "Reddit API Limit",
        action.payload,
        1,
        25
      );
      if (validationError == undefined) {
        state.redditApiItemLimit = action.payload;
      }
      state.redditApiItemLimitValidationError = validationError;
      saveConfig(state);
    },
    setPostsToShowInRow: (state, action) => {
      const validationError = ValidationUtil.validateNumberRequire(
        "Posts to Show In Row",
        action.payload,
        1,
        6
      );
      if (validationError == undefined) {
        state.postsToShowInRow = action.payload;
      }
      state.postsToShowInRowValidationError = validationError;
      saveConfig(state);
    },
    setPostRowsToShowInView: (state, action) => {
      const validationError = ValidationUtil.validateNumberRequire(
        "Post Rows to Show In View",
        action.payload,
        1,
        6
      );
      if (validationError == undefined) {
        state.postRowsToShowInView = action.payload;
      }
      state.postRowsToShowInViewValidationError = validationError;
      saveConfig(state);
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      setCssVariables(state.darkMode);
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
      setCssVariables(state.darkMode);
      state.configLoaded = true;
    });
  },
});

const setCssVariables = (darkMode: boolean) => {
  let backgroundColor = "white";
  let textColor = "black";
  let accordionHoverColor = "#ccc";
  let accordionBackground = "#dadada";
  let toolbarBackground = "#ffffff";
  let toolbarColor = "#000000";
  let borderColor = "#c9c9c9";

  if (darkMode) {
    backgroundColor = "black";
    textColor = "white";
    accordionHoverColor = "#494949";
    accordionBackground = "#464646";

    toolbarBackground = "#000000";
    toolbarColor = "white";
    borderColor = "white";
  }
  document.body.style.setProperty("--background-color", backgroundColor);
  document.body.style.setProperty("--text-color", textColor);
  document.body.style.setProperty(
    "--accordion-hover-color",
    accordionHoverColor
  );
  document.body.style.setProperty(
    "--accordion-background",
    accordionBackground
  );
  document.body.style.setProperty("--toolbar-background", toolbarBackground);
  document.body.style.setProperty("--toolbar-color", toolbarColor);
  document.body.style.setProperty("--app-border-color", borderColor);
};

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
  setConcatRedditUrlMaxLength,
  setContentFiltering,
  setRedditApiItemLimit,
  setPostsToShowInRow,
  setPostRowsToShowInView,
  toggleDarkMode,
  resetConfigLoaded,
} = appConfigSlice.actions;
export default appConfigSlice.reducer;
