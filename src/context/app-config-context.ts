import { createContext, Dispatch } from "react";
import { AppConfigState } from "../model/config/AppConfigState.ts";
import {
  AppConfigActionAppConfigPayload,
  AppConfigActionAutoScrollPostRowDirectionOptionEnumPayload,
  AppConfigActionAutoScrollPostRowOptionEnumPayload,
  AppConfigActionBooleanPayload,
  AppConfigActionContentFilteringEnumPayload,
  AppConfigActionNoPayload,
  AppConfigActionNumberPayload,
  AppConfigActionPostSortOrderOptionEnumPayload,
  AppConfigActionRandomIterationSelectWeightOptionEnumPayload,
  AppConfigActionSelectSubredditIterationMethodOptionEnumPayload,
  AppConfigActionSelectSubredditListMenuSortOptionEnumPayload,
  AppConfigActionSortOrderDirectionOptionEnumPayload,
  AppConfigActionStringPayload,
  AppConfigActionSubredditSortOrderOptionsEnumPayload,
  AppConfigActionSubredditSourceOptionEnumPayload,
  AppConfigActionTopTimeFrameOptionEnumPayload,
} from "../reducer/app-config-reducer.ts";

export const AppConfigStateContext = createContext<AppConfigState>(
  {} as AppConfigState
);

type dispatchType = Dispatch<
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
>;
export const AppConfigDispatchContext = createContext<dispatchType>(
  {} as dispatchType
);
