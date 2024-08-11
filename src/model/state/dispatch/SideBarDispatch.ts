import { Dispatch } from "react";
import {
  SetMostRecentSubredditGottenAction,
  SetSubredditsToShowInSideBarAction,
  SideBarActionBooleanPayload,
  SideBarActionNumberPayload,
} from "../../../reducer/side-bar-reducer.ts";

type SideBarDispatch = Dispatch<
  | SideBarActionBooleanPayload
  | SideBarActionNumberPayload
  | SetSubredditsToShowInSideBarAction
  | SetMostRecentSubredditGottenAction
>;
export default SideBarDispatch;
