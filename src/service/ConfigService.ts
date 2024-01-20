import { Directory, Filesystem } from "@capacitor/filesystem";
import { Buffer } from "buffer";
import {
  CONFIG_DIR,
  CONFIG_FILE,
  SUBREDDIT_LISTS_FILE,
} from "../RedditWatcherConstants";
import { Platform } from "../model/Platform";
import { SubredditLists } from "../model/SubredditList/SubredditLists";
import { AppConfig } from "../model/config/AppConfig";
import ContentFilteringOptionEnum from "../model/config/enums/ContentFilteringOptionEnum";
import PostRowScrollOptionsEnum from "../model/config/enums/PostRowScrollOptionsEnum";
import PostSortOrderOptionsEnum from "../model/config/enums/PostSortOrderOptionsEnum";
import RandomIterationSelectWeightOptionsEnum from "../model/config/enums/RandomIterationSelectWeightOptionsEnum";
import SelectSubredditIterationMethodOptionsEnum from "../model/config/enums/SelectSubredditIterationMethodOptionsEnum";
import SelectSubredditListMenuSortOptionEnum from "../model/config/enums/SelectSubredditListMenuSortOptionEnum";
import SelectedSubredditListSortOptionEnum from "../model/config/enums/SelectedSubredditListSortOptionEnum";
import SortOrderDirectionOptionsEnum from "../model/config/enums/SortOrderDirectionOptionsEnum";
import SubredditSortOrderOptionsEnum from "../model/config/enums/SubredditSortOrderOptionsEnum";
import TopTimeFrameOptionsEnum from "../model/config/enums/TopTimeFrameOptionsEnum";
import UserFrontPagePostSortOrderOptionsEnum from "../model/config/enums/UserFrontPagePostSortOrderOptionsEnum";
import getPlatform from "../util/PlatformUtil";

const REDDIT_CREDENTIALS_KEY = "redditCredentials";
const REDDIT_USERNAME_KEY = "username";
const REDDIT_PASSWORD_KEY = "password";
const REDDIT_CLIENT_ID_KEY = "clientId";
const REDDIT_CLIENT_SECRET_KEY = "clientSecret";
const SUBREDDIT_SORT_ORDER_OPTION_KEY = "subredditSortOrderOption";
const POST_ROW_SCROLL_OPTION = "postRowScrollOption";
const SELECTED_SUBREDDIT_LIST_SORT_OPTION = "selectedSubredditListSortOption";
const RANDOM_ITERATION_SELECT_WEIGHT_OPTION =
  "randomIterationSelectWeightOption";
const SELECT_SUBREDDIT_LIST_MENU_SORT_OPTION =
  "selectSubredditListMenuSortOption";
const SORT_ORDER_DIRECTION_OPTION = "sortOrderDirectionOption";
const POST_SORT_ORDER_OPTION = "postSortOrderOption";
const USER_FRONT_PAGE_POST_POST_SORT_ORDER_OPTION =
  "userFrontPagePostSortOrderOption";
const TOP_TIME_FRAME_OPTION = "topTimeFrameOption";
const SELECT_SUBREDDIT_ITERATION_METHOD_OPTION =
  "selectSubredditIterationMethodOption";
const CONCAT_REDDIT_URL_MAX_LENGTH = "concatRedditUrlMaxLength";
const CONTENT_FILTERING = "contentFiltering";
const REDDIT_API_ITEM_LIMIT = "redditApiItemLimit";
const POSTS_TO_SHOW_IN_ROW = "postsToShowInRow";
const POST_ROWS_TO_SHOW_IN_VIEW = "postRowsToShowInView";
const DARK_MODE = "darkMode";

export async function loadSubredditListsFromFile() {
  await checkForOrCreateConfigFolder();
  await checkForOrCreateSubredditListsFile();

  const fileContent = await Filesystem.readFile({
    path: CONFIG_DIR + "/" + SUBREDDIT_LISTS_FILE,
    directory: Directory.Data,
  });
  const subredditLists = JSON.parse(
    decode(fileContent.data as string)
  ) as Array<SubredditLists>;

  subredditLists.forEach((list) => {
    const listName = list.listName;
    list.subreddits.forEach((subreddit) => (subreddit.fromList = listName));
  });

  return subredditLists;
}

export async function loadConfig() {
  await checkForOrCreateConfigFolder();
  await checkForOrCreateConfigFile();

  const fileContent = await Filesystem.readFile({
    path: CONFIG_DIR + "/" + CONFIG_FILE,
    directory: Directory.Data,
  });

  const loadedConfig = fillInMissingFieldsInConfigObj(
    JSON.parse(decode(fileContent.data as string))
  );
  await saveConfig(loadedConfig);
  return loadedConfig;
}

export function fillInMissingFieldsInConfigObj(configJsonObj: AppConfig) {
  let redditUsername = "";
  let redditPassword = "";
  let redditClientId = "";
  let redditClientSecret = "";

  const redditCredentialsObj = configJsonObj[REDDIT_CREDENTIALS_KEY];
  if (redditCredentialsObj != undefined) {
    redditUsername = redditCredentialsObj[REDDIT_USERNAME_KEY] || "";
    redditPassword = redditCredentialsObj[REDDIT_PASSWORD_KEY] || "";
    redditClientId = redditCredentialsObj[REDDIT_CLIENT_ID_KEY] || "";
    redditClientSecret = redditCredentialsObj[REDDIT_CLIENT_SECRET_KEY] || "";
  }

  let subredditSortOrderOption =
    configJsonObj[SUBREDDIT_SORT_ORDER_OPTION_KEY] ||
    SubredditSortOrderOptionsEnum.Random;

  if (
    (subredditSortOrderOption ==
      SubredditSortOrderOptionsEnum.RedditListDotCom24HourGrowth ||
      subredditSortOrderOption ==
        SubredditSortOrderOptionsEnum.RedditListDotComRecentActivity ||
      subredditSortOrderOption ==
        SubredditSortOrderOptionsEnum.RedditListDotComSubscribers) &&
    getPlatform() == Platform.Web
  ) {
    subredditSortOrderOption = SubredditSortOrderOptionsEnum.Random;
  }
  const postRowScrollOption =
    configJsonObj[POST_ROW_SCROLL_OPTION] ||
    PostRowScrollOptionsEnum.AutoScroll;
  const selectedSubredditListSortOption =
    configJsonObj[SELECTED_SUBREDDIT_LIST_SORT_OPTION] ||
    SelectedSubredditListSortOptionEnum.Alphabetically;
  const randomIterationSelectWeightOption =
    configJsonObj[RANDOM_ITERATION_SELECT_WEIGHT_OPTION] ||
    RandomIterationSelectWeightOptionsEnum.PureRandom;
  const selectSubredditListMenuSortOption: SelectSubredditListMenuSortOptionEnum =
    configJsonObj[SELECT_SUBREDDIT_LIST_MENU_SORT_OPTION] ||
    SelectSubredditListMenuSortOptionEnum.Alphabetically;
  const sortOrderDirectionOption: SortOrderDirectionOptionsEnum =
    configJsonObj[SORT_ORDER_DIRECTION_OPTION] ||
    SortOrderDirectionOptionsEnum.Normal;
  const postSortOrderOption: PostSortOrderOptionsEnum =
    configJsonObj[POST_SORT_ORDER_OPTION] || PostSortOrderOptionsEnum.Random;
  const userFrontPagePostSortOrderOption: UserFrontPagePostSortOrderOptionsEnum =
    configJsonObj[USER_FRONT_PAGE_POST_POST_SORT_ORDER_OPTION] ||
    UserFrontPagePostSortOrderOptionsEnum.NotSelected;
  const topTimeFrameOption: TopTimeFrameOptionsEnum =
    configJsonObj[TOP_TIME_FRAME_OPTION] || TopTimeFrameOptionsEnum.All;
  const selectSubredditIterationMethodOption: SelectSubredditIterationMethodOptionsEnum =
    configJsonObj[SELECT_SUBREDDIT_ITERATION_METHOD_OPTION] ||
    SelectSubredditIterationMethodOptionsEnum.Random;
  const concatRedditUrlMaxLength: number =
    configJsonObj[CONCAT_REDDIT_URL_MAX_LENGTH] || 1000;
  const contentFiltering: ContentFilteringOptionEnum =
    configJsonObj[CONTENT_FILTERING] || ContentFilteringOptionEnum.SFW;
  const redditApiItemLimit: number = configJsonObj[REDDIT_API_ITEM_LIMIT] || 25;
  const postsToShowInRow: number = configJsonObj[POSTS_TO_SHOW_IN_ROW] || 3;
  const postRowsToShowInView: number =
    configJsonObj[POST_ROWS_TO_SHOW_IN_VIEW] || 3;
  const darkMode: boolean = configJsonObj[DARK_MODE] || false;

  const loadedConfig: AppConfig = {
    redditCredentials: {
      username: redditUsername,
      password: redditPassword,
      clientId: redditClientId,
      clientSecret: redditClientSecret,
    },
    subredditSortOrderOption: subredditSortOrderOption,
    postRowScrollOption: postRowScrollOption,
    selectedSubredditListSortOption: selectedSubredditListSortOption,
    randomIterationSelectWeightOption: randomIterationSelectWeightOption,
    selectSubredditListMenuSortOption: selectSubredditListMenuSortOption,
    sortOrderDirectionOption: sortOrderDirectionOption,
    postSortOrderOption: postSortOrderOption,
    userFrontPagePostSortOrderOption: userFrontPagePostSortOrderOption,
    topTimeFrameOption: topTimeFrameOption,
    selectSubredditIterationMethodOption: selectSubredditIterationMethodOption,
    concatRedditUrlMaxLength: concatRedditUrlMaxLength,
    contentFiltering: contentFiltering,
    redditApiItemLimit: redditApiItemLimit,
    postsToShowInRow: postsToShowInRow,
    postRowsToShowInView: postRowsToShowInView,
    darkMode: darkMode,
  };

  return loadedConfig;
}

export async function saveConfig(config: AppConfig) {
  await Filesystem.writeFile({
    path: CONFIG_DIR + "/" + CONFIG_FILE,
    directory: Directory.Data,
    data: encode(JSON.stringify(config)),
  });
}

export function exportConfigDownload(file: File) {
  // Create a link and set the URL using `createObjectURL`
  const link = document.createElement("a");
  link.style.display = "none";
  link.href = URL.createObjectURL(file);
  link.download = file.name;

  // It needs to be added to the DOM so, it can be clicked
  document.body.appendChild(link);
  link.click();

  // To make this work on Firefox we need to wait
  // a little while before removing it.
  setTimeout(() => {
    URL.revokeObjectURL(link.href);
    link.parentNode?.removeChild(link);
  }, 0);
}

export async function saveSubredditLists(
  subredditLists: Array<SubredditLists>
) {
  await Filesystem.writeFile({
    path: CONFIG_DIR + "/" + SUBREDDIT_LISTS_FILE,
    directory: Directory.Data,
    data: encode(JSON.stringify(subredditLists)),
  });
}

function encode(config: string) {
  return Buffer.from(config).toString("base64");
}

function decode(json: string) {
  return Buffer.from(json, "base64").toString("ascii");
}

async function checkForOrCreateConfigFolder() {
  console.log("About to check for config folder");
  const dataDirectorFiles = await Filesystem.readdir({
    path: "",
    directory: Directory.Data,
  });
  const foundConfigDir =
    dataDirectorFiles.files.filter(
      (file) =>
        file.name == CONFIG_DIR.replace("/", "") && file.type == "directory"
    ).length != 0;
  console.log("Found config Directory: ", foundConfigDir);
  if (!foundConfigDir) {
    console.log("Did not find config directory. Creating config folder");
    await Filesystem.mkdir({
      path: CONFIG_DIR,
      directory: Directory.Data,
    });
  }
}

async function checkForOrCreateConfigFile() {
  console.log("About to check for config file");
  const configDirFiles = await Filesystem.readdir({
    path: CONFIG_DIR,
    directory: Directory.Data,
  });

  const foundConfigJson =
    configDirFiles.files.filter(
      (file) => file.name == CONFIG_FILE && file.type == "file"
    ).length != 0;
  console.log("Found config json ", foundConfigJson);
  if (!foundConfigJson) {
    console.log("Did not find config json. Creating config.json");

    await Filesystem.writeFile({
      path: CONFIG_DIR + "/" + CONFIG_FILE,
      directory: Directory.Data,
      data: encode("{}"),
    });
  }
}

async function checkForOrCreateSubredditListsFile() {
  console.log("About to check for subreddit lists file");
  const configDirFiles = await Filesystem.readdir({
    path: CONFIG_DIR,
    directory: Directory.Data,
  });

  const foundConfigJson =
    configDirFiles.files.filter(
      (file) => file.name == SUBREDDIT_LISTS_FILE && file.type == "file"
    ).length != 0;
  console.log("Found subreddit lists json ", foundConfigJson);
  if (!foundConfigJson) {
    console.log(
      "Did not find subreddit lists json. Creating subreddit lists.json"
    );

    await Filesystem.writeFile({
      path: CONFIG_DIR + "/" + SUBREDDIT_LISTS_FILE,
      directory: Directory.Data,
      data: encode("[]"),
    });
  }
}
