import { FC, ReactNode, useReducer } from "react";
import AppConfigReducer from "../../reducer/app-config-reducer.ts";
import { AppConfigState } from "../../model/config/AppConfigState.ts";
import { AutoScrollPostRowOptionEnum } from "../../model/config/enums/AutoScrollPostRowOptionEnum.ts";
import SubredditSortOrderOptionsEnum from "../../model/config/enums/SubredditSortOrderOptionsEnum.ts";
import { AutoScrollPostRowDirectionOptionEnum } from "../../model/config/enums/AutoScrollPostRowDirectionOptionEnum.ts";
import SelectedSubredditListSortOptionEnum from "../../model/config/enums/SelectedSubredditListSortOptionEnum.ts";
import RandomIterationSelectWeightOptionsEnum from "../../model/config/enums/RandomIterationSelectWeightOptionsEnum.ts";
import SelectSubredditListMenuSortOptionEnum from "../../model/config/enums/SelectSubredditListMenuSortOptionEnum.ts";
import SortOrderDirectionOptionsEnum from "../../model/config/enums/SortOrderDirectionOptionsEnum.ts";
import PostSortOrderOptionsEnum from "../../model/config/enums/PostSortOrderOptionsEnum.ts";
import UserFrontPagePostSortOrderOptionsEnum from "../../model/config/enums/UserFrontPagePostSortOrderOptionsEnum.ts";
import TopTimeFrameOptionsEnum from "../../model/config/enums/TopTimeFrameOptionsEnum.ts";
import SelectSubredditIterationMethodOptionsEnum from "../../model/config/enums/SelectSubredditIterationMethodOptionsEnum.ts";
import ContentFilteringOptionEnum from "../../model/config/enums/ContentFilteringOptionEnum.ts";
import {
  AppConfigDispatchContext,
  AppConfigStateContext,
} from "../app-config-context.ts";

const defaultSubredditSortOrderOption = SubredditSortOrderOptionsEnum.Random;
const defaultAutoScrollPostRowOption =
  AutoScrollPostRowOptionEnum.SmoothContinuousScroll;
const defaultAutoScrollPostRowDirectionOption =
  AutoScrollPostRowDirectionOptionEnum.Left;
const defaultAutoScrollPostRowRateSecondsForSinglePostCard = 5;
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
  autoScrollPostRowOption: defaultAutoScrollPostRowOption,
  autoScrollPostRowDirectionOption: defaultAutoScrollPostRowDirectionOption,
  autoScrollPostRowRateSecondsForSinglePostCard:
    defaultAutoScrollPostRowRateSecondsForSinglePostCard,
  autoScrollPostRowRateSecondsForSinglePostCardValidationError: undefined,
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
