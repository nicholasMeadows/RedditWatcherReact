import { createContext } from "react";
import { SideBarState } from "../model/state/SideBarState.ts";
import SideBarDispatch from "../model/state/dispatch/SideBarDispatch.ts";

export const SideBarStateContext = createContext({} as SideBarState);
export const SideBarDispatchContext = createContext({} as SideBarDispatch);
