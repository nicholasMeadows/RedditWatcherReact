import { Dispatch } from "react";
import {
  ContextMenuBooleanPayloadAction,
  ContextMenuNoPayloadAction,
  OpenContextMenuForPostAction,
  OpenContextMenuForRedditSearchItemAction,
  OpenContextMenuForSideBarAction,
  OpenContextMenuForSubredditListAction,
  OpenContextMenuForSubredditListItemAction,
} from "../../../reducer/context-menu-reducer.ts";

type ContextMenuDispatch = Dispatch<
  | ContextMenuBooleanPayloadAction
  | ContextMenuNoPayloadAction
  | OpenContextMenuForPostAction
  | OpenContextMenuForSideBarAction
  | OpenContextMenuForSubredditListAction
  | OpenContextMenuForSubredditListItemAction
  | OpenContextMenuForRedditSearchItemAction
>;

export default ContextMenuDispatch;
