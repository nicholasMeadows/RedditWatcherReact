import { createContext } from "react";
import { SideBarDispatch, SideBarState } from "../reducer/side-bar-reducer.ts";

export const SideBarStateContext = createContext({} as SideBarState);
export const SideBarDispatchContext = createContext({} as SideBarDispatch);
