import { Dispatch } from "react";
import {
  CloseContextMenuAction,
  SetExpandAddOrRemoveToListAction,
  SetPostContextMenuAction,
  SetRedditSearchItemContextMenuAction,
  SetSideBarSubredditMenuAction,
  SetSubredditListContextMenuAction,
  SetSubredditListItemContextMenuAction,
} from "../../../reducer/context-menu-reducer.ts";

type ContextMenuDispatch = Dispatch<
  | SetPostContextMenuAction
  | SetSubredditListItemContextMenuAction
  | SetSubredditListContextMenuAction
  | SetSideBarSubredditMenuAction
  | CloseContextMenuAction
  | SetRedditSearchItemContextMenuAction
  | SetExpandAddOrRemoveToListAction
>;

export default ContextMenuDispatch;
