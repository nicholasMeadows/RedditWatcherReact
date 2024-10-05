import { FC, ReactNode, useReducer } from "react";
import AppConfigReducer from "../../reducer/app-config-reducer.ts";
import SubredditSortOrderOptionsEnum from "../../model/config/enums/SubredditSortOrderOptionsEnum.ts";
import { AutoScrollPostRowDirectionOptionEnum } from "../../model/config/enums/AutoScrollPostRowDirectionOptionEnum.ts";
import RandomIterationSelectWeightOptionsEnum from "../../model/config/enums/RandomIterationSelectWeightOptionsEnum.ts";
import SelectSubredditListMenuSortOptionEnum from "../../model/config/enums/SelectSubredditListMenuSortOptionEnum.ts";
import SortOrderDirectionOptionsEnum from "../../model/config/enums/SortOrderDirectionOptionsEnum.ts";
import PostSortOrderOptionsEnum from "../../model/config/enums/PostSortOrderOptionsEnum.ts";
import TopTimeFrameOptionsEnum from "../../model/config/enums/TopTimeFrameOptionsEnum.ts";
import SelectSubredditIterationMethodOptionsEnum from "../../model/config/enums/SelectSubredditIterationMethodOptionsEnum.ts";
import ContentFilteringOptionEnum from "../../model/config/enums/ContentFilteringOptionEnum.ts";
import {
  AppConfigDispatchContext,
  AppConfigStateContext,
} from "../app-config-context.ts";
import SubredditSourceOptionsEnum from "../../model/config/enums/SubredditSourceOptionsEnum.ts";
import { AppConfigState } from "../../model/state/AppConfigState.ts";

const defaultSubredditSourceOption = SubredditSourceOptionsEnum.FrontPage;
const defaultSubredditSortOrderOption =
  SubredditSortOrderOptionsEnum.Alphabetically;
const defaultGetAllSubredditsAtOnce = false;
const defaultAutoScrollPostRow = true;
const defaultAutoScrollPostRowDirectionOption =
  AutoScrollPostRowDirectionOptionEnum.Left;
const defaultAutoScrollPostRowRateSecondsForSinglePostCard = 5;
const defaultRandomIterationSelectWeightOption =
  RandomIterationSelectWeightOptionsEnum.PureRandom;
const defaultSelectSubredditListMenuSortOption =
  SelectSubredditListMenuSortOptionEnum.Alphabetically;
const defaultSortOrderDirectionOption = SortOrderDirectionOptionsEnum.Normal;
const defaultPostSortOrderOption = PostSortOrderOptionsEnum.Random;
const defaultTopTimeFrameOption = TopTimeFrameOptionsEnum.All;
const defaultSelectSubredditIterationMethodOption =
  SelectSubredditIterationMethodOptionsEnum.Sequential;
const defaultConcatRedditUrlMaxLength = 1000;
const defaultContentFiltering = ContentFilteringOptionEnum.SFW;
const defaultRedditApiItemLimit = 25;
const defaultPostsToShowInRow = 4;
const defaultPostRowsToShowInView = 3;
const defaultDarkMode = false;
const defaultUseInMemoryImagesAndGifs = false;

const defaultPostConvertFilteringOptionUrlsThatEndWithDotGif = true;
const defaultPostConvertFilteringOptionUrlsThatEndWithDotJpg = true;
const defaultPostConvertFilteringOptionUrlsThatEndWithDotJpeg = true;
const defaultPostConvertFilteringOptionUrlsThatEndWithDotPng = true;
const defaultPostConvertFilteringOptionUrlsInGiphyDomain = true;
const defaultPostConvertFilteringOptionUrlsInImgurDomain = true;
const defaultPostConvertFilteringOptionUrlsInRedgifsDomain = true;
const defaultPostConvertFilteringOptionRedditGalleries = true;

const defaultPostRowIterationTime = 10;

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
  subredditSourceOption: defaultSubredditSourceOption,
  subredditSortOrderOption: defaultSubredditSortOrderOption,
  getAllSubredditsAtOnce: defaultGetAllSubredditsAtOnce,
  autoScrollPostRow: defaultAutoScrollPostRow,
  autoScrollPostRowDirectionOption: defaultAutoScrollPostRowDirectionOption,
  autoScrollPostRowRateSecondsForSinglePostCard:
    defaultAutoScrollPostRowRateSecondsForSinglePostCard,
  autoScrollPostRowRateSecondsForSinglePostCardValidationError: undefined,
  randomIterationSelectWeightOption: defaultRandomIterationSelectWeightOption,
  selectSubredditListMenuSortOption: defaultSelectSubredditListMenuSortOption,
  sortOrderDirectionOption: defaultSortOrderDirectionOption,
  postSortOrderOption: defaultPostSortOrderOption,
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
  useInMemoryImagesAndGifs: defaultUseInMemoryImagesAndGifs,
  postConverterFilteringOptions: {
    urlsInGiphyDomain: defaultPostConvertFilteringOptionUrlsInGiphyDomain,
    urlsInImgurDomain: defaultPostConvertFilteringOptionUrlsInImgurDomain,
    urlsInRedGifsDomain: defaultPostConvertFilteringOptionUrlsInRedgifsDomain,
    urlsThatEndWithDotGif:
      defaultPostConvertFilteringOptionUrlsThatEndWithDotGif,
    urlsThatEndWithDotJpeg:
      defaultPostConvertFilteringOptionUrlsThatEndWithDotJpeg,
    urlsThatEndWithDotJpg:
      defaultPostConvertFilteringOptionUrlsThatEndWithDotJpg,
    urlsThatEndWithDotPng:
      defaultPostConvertFilteringOptionUrlsThatEndWithDotPng,
    redditGalleries: defaultPostConvertFilteringOptionRedditGalleries,
  },
  getPostRowIterationTime: defaultPostRowIterationTime,
  getPostRowIterationTimeValidationError: undefined,
};

type Props = {
  children: ReactNode;
};

const AppConfigContextProvider: FC<Props> = ({ children }) => {
  const [appConfigState, dispatch] = useReducer(AppConfigReducer, initialState);
  return (
    <AppConfigStateContext.Provider value={appConfigState}>
      <AppConfigDispatchContext.Provider value={dispatch}>
        {children}
      </AppConfigDispatchContext.Provider>
    </AppConfigStateContext.Provider>
  );
};
export default AppConfigContextProvider;
