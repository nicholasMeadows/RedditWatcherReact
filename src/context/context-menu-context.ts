import { createContext, Dispatch } from "react";
import {
  CloseContextMenuAction,
  ContextMenuState,
  SetExpandAddOrRemoveToListAction,
  SetPostContextMenuAction,
  SetRedditSearchItemContextMenuAction,
  SetSideBarSubredditMenuAction,
  SetSubredditListContextMenuAction,
  SetSubredditListItemContextMenuAction,
} from "../reducer/context-menu-reducer.ts";

export const ContextMenuStateContext = createContext<ContextMenuState>(
  {} as ContextMenuState
);
type contextMenuDispatch = Dispatch<
  | SetPostContextMenuAction
  | SetSubredditListItemContextMenuAction
  | SetSubredditListContextMenuAction
  | SetSideBarSubredditMenuAction
  | CloseContextMenuAction
  | SetRedditSearchItemContextMenuAction
  | SetExpandAddOrRemoveToListAction
>;
export const ContextMenuDispatchContext = createContext<contextMenuDispatch>(
  {} as contextMenuDispatch
);
