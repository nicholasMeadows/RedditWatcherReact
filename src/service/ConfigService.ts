import { Directory, Filesystem } from "@capacitor/filesystem";
import {
  CONFIG_DIR,
  CONFIG_FILE,
  SUBREDDIT_LISTS_FILE,
} from "../RedditWatcherConstants";
import { Platform } from "../model/Platform";
import { SubredditLists } from "../model/SubredditList/SubredditLists";
import { AppConfig } from "../model/config/AppConfig";
import ContentFilteringOptionEnum from "../model/config/enums/ContentFilteringOptionEnum";
import PostSortOrderOptionsEnum from "../model/config/enums/PostSortOrderOptionsEnum";
import RandomIterationSelectWeightOptionsEnum from "../model/config/enums/RandomIterationSelectWeightOptionsEnum";
import SelectSubredditIterationMethodOptionsEnum from "../model/config/enums/SelectSubredditIterationMethodOptionsEnum";
import SelectSubredditListMenuSortOptionEnum from "../model/config/enums/SelectSubredditListMenuSortOptionEnum";
import SortOrderDirectionOptionsEnum from "../model/config/enums/SortOrderDirectionOptionsEnum";
import TopTimeFrameOptionsEnum from "../model/config/enums/TopTimeFrameOptionsEnum";
import getPlatform from "../util/PlatformUtil";
import { AutoScrollPostRowDirectionOptionEnum } from "../model/config/enums/AutoScrollPostRowDirectionOptionEnum.ts";
import { WindowElectronAPI } from "../model/WindowElectronAPI.ts";
import SubredditSourceOptionsEnum from "../model/config/enums/SubredditSourceOptionsEnum.ts";
import SubredditSortOrderOptionsEnum from "../model/config/enums/SubredditSortOrderOptionsEnum.ts";

const REDDIT_CREDENTIALS_KEY = "redditCredentials";
const REDDIT_USERNAME_KEY = "username";
const REDDIT_PASSWORD_KEY = "password";
const REDDIT_CLIENT_ID_KEY = "clientId";
const REDDIT_CLIENT_SECRET_KEY = "clientSecret";
const SUBREDDIT_SOURCE_OPTION_KEY = "subredditSourceOption";
const SUBREDDIT_SORT_ORDER_OPTION_KEY = "subredditSortOrderOption";
const GET_ALL_SUBREDDITS_AT_ONCE = "getAllSubredditsAtOnce";
const AUTO_SCROLL_POST_ROW = "autoScrollPostRow";
const AUTO_SCROLL_POST_ROW_DIRECTION = "autoScrollPostRowDirectionOption";
const AUTO_SCROLL_POST_ROW_RATE_SECONDS_FOR_SINGLE_POST_CARD =
  "autoScrollPostRowRateSecondsForSinglePostCard";
const RANDOM_ITERATION_SELECT_WEIGHT_OPTION =
  "randomIterationSelectWeightOption";
const SELECT_SUBREDDIT_LIST_MENU_SORT_OPTION =
  "selectSubredditListMenuSortOption";
const SORT_ORDER_DIRECTION_OPTION = "sortOrderDirectionOption";
const POST_SORT_ORDER_OPTION = "postSortOrderOption";
const TOP_TIME_FRAME_OPTION = "topTimeFrameOption";
const SELECT_SUBREDDIT_ITERATION_METHOD_OPTION =
  "selectSubredditIterationMethodOption";
const CONCAT_REDDIT_URL_MAX_LENGTH = "concatRedditUrlMaxLength";
const CONTENT_FILTERING = "contentFiltering";
const REDDIT_API_ITEM_LIMIT = "redditApiItemLimit";
const POSTS_TO_SHOW_IN_ROW = "postsToShowInRow";
const POST_ROWS_TO_SHOW_IN_VIEW = "postRowsToShowInView";
const DARK_MODE = "darkMode";
const USE_IN_MEMORY_IMAGES_AND_GIFS = "useInMemoryImagesAndGifs";

const POST_CONVERTER_FILTERING_OPTIONS = "postConverterFilteringOptions";
const URLS_IN_REDGIFS_DOMAIN = "urlsInRedGifsDomain";
const URLS_IN_IMGUR_DOMAIN = "urlsInImgurDomain";
const URLS_IN_GIPHY_DOMAIN = "urlsInGiphyDomain";
const URLS_THAT_END_WITH_DOT_GIF = "urlsThatEndWithDotGif";
const URLS_THAT_END_WITH_DOT_PNG = "urlsThatEndWithDotPng";
const URLS_THAT_END_WITH_DOT_JPEG = "urlsThatEndWithDotJpeg";
const URLS_THAT_END_WITH_DOT_JPG = "urlsThatEndWithDotJpg";
const REDDIT_GALLERIES = "redditGalleries";
const GET_POST_ROW_ITERATION_TIME = "getPostRowIterationTime";
const NODE_RED_URL = "nodeRedUrl";

export async function loadSubredditListsFromFile() {
  await checkForOrCreateConfigFolder();
  await checkForOrCreateSubredditListsFile(encode("[]"));

  const encodedFileContent = await readSubredditListsFromFile();
  const subredditLists = JSON.parse(
    decode(encodedFileContent)
  ) as Array<SubredditLists>;

  subredditLists.forEach((list) => {
    const listName = list.listName;
    list.subreddits.forEach((subreddit) => (subreddit.fromList = listName));
  });

  return subredditLists;
}

export async function loadConfig() {
  await checkForOrCreateConfigFolder();
  await checkForOrCreateConfigFile(encode("{}"));

  const encodedFileContent = await readConfigFromFile();
  const loadedConfig = fillInMissingFieldsInConfigObj(
    JSON.parse(decode(encodedFileContent))
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

  let subredditSourceOptionsEnum =
    configJsonObj[SUBREDDIT_SOURCE_OPTION_KEY] ||
    SubredditSourceOptionsEnum.FrontPage;

  if (
    (subredditSourceOptionsEnum ==
      SubredditSourceOptionsEnum.RedditListDotCom24HourGrowth ||
      subredditSourceOptionsEnum ==
        SubredditSourceOptionsEnum.RedditListDotComRecentActivity ||
      subredditSourceOptionsEnum ==
        SubredditSourceOptionsEnum.RedditListDotComSubscribers) &&
    getPlatform() == Platform.Web
  ) {
    subredditSourceOptionsEnum = SubredditSourceOptionsEnum.FrontPage;
  }
  const subredditSortOrderOption =
    configJsonObj[SUBREDDIT_SORT_ORDER_OPTION_KEY] ||
    SubredditSortOrderOptionsEnum.Alphabetically;
  const getAllSubredditsAtOnce =
    configJsonObj[GET_ALL_SUBREDDITS_AT_ONCE] || false;
  const autoScrollPostRow = configJsonObj[AUTO_SCROLL_POST_ROW] || true;
  const autoScrollPostRowDirectionOption =
    configJsonObj[AUTO_SCROLL_POST_ROW_DIRECTION] ||
    AutoScrollPostRowDirectionOptionEnum.Left;
  const autoScrollPostRowRateSecondsForSinglePostCard =
    configJsonObj[AUTO_SCROLL_POST_ROW_RATE_SECONDS_FOR_SINGLE_POST_CARD] || 5;
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
  let useInMemoryImagesAndGifs =
    configJsonObj[USE_IN_MEMORY_IMAGES_AND_GIFS] || false;
  if (useInMemoryImagesAndGifs && getPlatform() == Platform.Web) {
    useInMemoryImagesAndGifs = false;
  }

  let urlsInRedGifsDomain = true;
  let urlsInImgurDomain = true;
  let urlsInGiphyDomain = true;
  let urlsThatEndWithDotGif = true;
  let urlsThatEndWithDotPng = true;
  let urlsThatEndWithDotJpeg = true;
  let urlsThatEndWithDotJpg = true;
  let redditGalleries = true;

  const postConverterFilteringOptions =
    configJsonObj[POST_CONVERTER_FILTERING_OPTIONS];
  if (postConverterFilteringOptions !== undefined) {
    urlsInRedGifsDomain = postConverterFilteringOptions[URLS_IN_REDGIFS_DOMAIN];
    urlsInImgurDomain = postConverterFilteringOptions[URLS_IN_IMGUR_DOMAIN];
    urlsInGiphyDomain = postConverterFilteringOptions[URLS_IN_GIPHY_DOMAIN];
    urlsThatEndWithDotGif =
      postConverterFilteringOptions[URLS_THAT_END_WITH_DOT_GIF];
    urlsThatEndWithDotPng =
      postConverterFilteringOptions[URLS_THAT_END_WITH_DOT_PNG];
    urlsThatEndWithDotJpeg =
      postConverterFilteringOptions[URLS_THAT_END_WITH_DOT_JPEG];
    urlsThatEndWithDotJpg =
      postConverterFilteringOptions[URLS_THAT_END_WITH_DOT_JPG];
    redditGalleries = postConverterFilteringOptions[REDDIT_GALLERIES];
  }
  const getPostRowIterationTime =
    configJsonObj[GET_POST_ROW_ITERATION_TIME] || 10;

  const nodeRedUrl = configJsonObj[NODE_RED_URL] || undefined;
  const loadedConfig: AppConfig = {
    redditCredentials: {
      username: redditUsername,
      password: redditPassword,
      clientId: redditClientId,
      clientSecret: redditClientSecret,
    },
    subredditSourceOption: subredditSourceOptionsEnum,
    subredditSortOrderOption: subredditSortOrderOption,
    getAllSubredditsAtOnce: getAllSubredditsAtOnce,
    autoScrollPostRow: autoScrollPostRow,
    autoScrollPostRowDirectionOption: autoScrollPostRowDirectionOption,
    autoScrollPostRowRateSecondsForSinglePostCard:
      autoScrollPostRowRateSecondsForSinglePostCard,
    randomIterationSelectWeightOption: randomIterationSelectWeightOption,
    selectSubredditListMenuSortOption: selectSubredditListMenuSortOption,
    sortOrderDirectionOption: sortOrderDirectionOption,
    postSortOrderOption: postSortOrderOption,
    topTimeFrameOption: topTimeFrameOption,
    selectSubredditIterationMethodOption: selectSubredditIterationMethodOption,
    concatRedditUrlMaxLength: concatRedditUrlMaxLength,
    contentFiltering: contentFiltering,
    redditApiItemLimit: redditApiItemLimit,
    postsToShowInRow: postsToShowInRow,
    postRowsToShowInView: postRowsToShowInView,
    darkMode: darkMode,
    useInMemoryImagesAndGifs: useInMemoryImagesAndGifs,
    postConverterFilteringOptions: {
      urlsInRedGifsDomain: urlsInRedGifsDomain,
      urlsInImgurDomain: urlsInImgurDomain,
      urlsInGiphyDomain: urlsInGiphyDomain,
      urlsThatEndWithDotGif: urlsThatEndWithDotGif,
      urlsThatEndWithDotPng: urlsThatEndWithDotPng,
      urlsThatEndWithDotJpeg: urlsThatEndWithDotJpeg,
      urlsThatEndWithDotJpg: urlsThatEndWithDotJpg,
      redditGalleries: redditGalleries,
    },
    getPostRowIterationTime: getPostRowIterationTime,
    nodeRedUrl: nodeRedUrl,
  };

  return loadedConfig;
}

async function readConfigFromFile() {
  let fileContentEncodedString: string;
  if (getPlatform() === Platform.Electron) {
    const windowElectronAPI = window as unknown as WindowElectronAPI;
    fileContentEncodedString =
      await windowElectronAPI.electronAPI.readConfigFromFile();
  } else {
    const fileContent = await Filesystem.readFile({
      path: CONFIG_DIR + "/" + CONFIG_FILE,
      directory: Directory.Data,
    });
    fileContentEncodedString = fileContent.data as string;
  }
  return fileContentEncodedString;
}

async function readSubredditListsFromFile() {
  let fileContentEncodedString: string;
  if (getPlatform() === Platform.Electron) {
    const windowElectronAPI = window as unknown as WindowElectronAPI;
    fileContentEncodedString =
      await windowElectronAPI.electronAPI.readSubredditListsFromFile();
  } else {
    const fileContent = await Filesystem.readFile({
      path: CONFIG_DIR + "/" + SUBREDDIT_LISTS_FILE,
      directory: Directory.Data,
    });
    fileContentEncodedString = fileContent.data as string;
  }
  return fileContentEncodedString;
}

export async function saveConfig(config: AppConfig) {
  const encodedFileContent = encode(JSON.stringify(config));
  if (getPlatform() === Platform.Electron) {
    const windowElectronAPI = window as unknown as WindowElectronAPI;
    await windowElectronAPI.electronAPI.saveConfig(encodedFileContent);
  } else {
    await Filesystem.writeFile({
      path: CONFIG_DIR + "/" + CONFIG_FILE,
      directory: Directory.Data,
      data: encodedFileContent,
    });
  }
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
  const data = encode(JSON.stringify(subredditLists));
  if (getPlatform() === Platform.Electron) {
    const windowElectronAPI = window as unknown as WindowElectronAPI;
    await windowElectronAPI.electronAPI.saveSubredditLists(data);
  } else {
    await Filesystem.writeFile({
      path: CONFIG_DIR + "/" + SUBREDDIT_LISTS_FILE,
      directory: Directory.Data,
      data: data,
    });
  }
}

function encode(config: string) {
  return btoa(config);
}

function decode(json: string) {
  return atob(json);
}

async function checkForOrCreateConfigFolder() {
  console.log("About to check for config folder");
  if (getPlatform() === Platform.Electron) {
    const windowElectronAPI = window as unknown as WindowElectronAPI;
    await windowElectronAPI.electronAPI.checkForOrCreateConfigFolder();
  } else {
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
}

async function checkForOrCreateConfigFile(defaultFileValue: string) {
  console.log("About to check for config file");
  if (getPlatform() === Platform.Electron) {
    const windowElectronAPI = window as unknown as WindowElectronAPI;
    await windowElectronAPI.electronAPI.checkForOrCreateConfigFile(
      defaultFileValue
    );
  } else {
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
        data: defaultFileValue,
      });
    }
  }
}

async function checkForOrCreateSubredditListsFile(defaultFileValue: string) {
  console.log("About to check for subreddit lists file");
  if (getPlatform() === Platform.Electron) {
    const windowElectronAPI = window as unknown as WindowElectronAPI;
    await windowElectronAPI.electronAPI.checkForOrCreateSubredditListsFile(
      defaultFileValue
    );
  } else {
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
        data: defaultFileValue,
      });
    }
  }
}
