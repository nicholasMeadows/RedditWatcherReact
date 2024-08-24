import { Dispatch } from "react";
import {
  AppConfigActionAppConfigPayload,
  AppConfigActionAutoScrollPostRowDirectionOptionEnumPayload,
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
} from "../../../reducer/app-config-reducer.ts";

type AppConfigDispatch = Dispatch<
  | AppConfigActionStringPayload
  | AppConfigActionSubredditSourceOptionEnumPayload
  | AppConfigActionSubredditSortOrderOptionsEnumPayload
  | AppConfigActionBooleanPayload
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
export default AppConfigDispatch;
