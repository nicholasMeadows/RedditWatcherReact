import { createContext, Dispatch } from "react";
import { AppConfigState } from "../model/config/AppConfigState.ts";
import {
  AppConfigActionAppConfigPayload,
  AppConfigActionAutoScrollPostRowDirectionOptionEnumPayload,
  AppConfigActionAutoScrollPostRowOptionEnumPayload,
  AppConfigActionContentFilteringEnumPayload,
  AppConfigActionNoPayload,
  AppConfigActionNumberPayload,
  AppConfigActionPostSortOrderOptionEnumPayload,
  AppConfigActionRandomIterationSelectWeightOptionEnumPayload,
  AppConfigActionSelectedSubredditListSortOptionEnumPayload,
  AppConfigActionSelectSubredditIterationMethodOptionEnumPayload,
  AppConfigActionSelectSubredditListMenuSortOptionEnumPayload,
  AppConfigActionSortOrderDirectionOptionEnumPayload,
  AppConfigActionStringPayload,
  AppConfigActionSubredditSortOrderOptionsEnumPayload,
  AppConfigActionTopTimeFrameOptionEnumPayload,
  AppConfigActionUserFrontPagePostSortOrderOptionEnumPayload,
} from "../reducer/app-config-reducer.ts";

export const AppConfigStateContext = createContext<AppConfigState>(
  {} as AppConfigState
);

type dispatchType = Dispatch<
  | AppConfigActionStringPayload
  | AppConfigActionSubredditSortOrderOptionsEnumPayload
  | AppConfigActionAutoScrollPostRowOptionEnumPayload
  | AppConfigActionAutoScrollPostRowDirectionOptionEnumPayload
  | AppConfigActionSelectedSubredditListSortOptionEnumPayload
  | AppConfigActionRandomIterationSelectWeightOptionEnumPayload
  | AppConfigActionSelectSubredditListMenuSortOptionEnumPayload
  | AppConfigActionSortOrderDirectionOptionEnumPayload
  | AppConfigActionPostSortOrderOptionEnumPayload
  | AppConfigActionUserFrontPagePostSortOrderOptionEnumPayload
  | AppConfigActionTopTimeFrameOptionEnumPayload
  | AppConfigActionSelectSubredditIterationMethodOptionEnumPayload
  | AppConfigActionContentFilteringEnumPayload
  | AppConfigActionNumberPayload
  | AppConfigActionNoPayload
  | AppConfigActionAppConfigPayload
>;
export const AppConfigDispatchContext = createContext<dispatchType>(
  {} as dispatchType
);
