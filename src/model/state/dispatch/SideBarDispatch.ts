import { Dispatch } from "react";
import {
  SetListToFilterByUuidAction,
  SetMostRecentSubredditGottenAction,
  SetOpenNumberPayloadAction,
  SetSearchInputAction,
  SetSubredditsToShowInSideBarAction,
  SubredditListsUpdatedAction,
} from "../../../reducer/side-bar-reducer.ts";

type SideBarDispatch = Dispatch<
  | SetSubredditsToShowInSideBarAction
  | SetListToFilterByUuidAction
  | SetSearchInputAction
  | SubredditListsUpdatedAction
  | SetOpenNumberPayloadAction
  | SetMostRecentSubredditGottenAction
>;

export default SideBarDispatch;
