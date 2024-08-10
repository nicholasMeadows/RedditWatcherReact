import { createContext } from "react";
import { ContextMenuState } from "../model/state/ContextMenuState.ts";
import contextMenuDispatch from "../model/state/dispatch/ContextMenuDispatch.ts";

export const ContextMenuStateContext = createContext<ContextMenuState>(
  {} as ContextMenuState
);

export const ContextMenuDispatchContext = createContext<contextMenuDispatch>(
  {} as contextMenuDispatch
);
