import { createContext } from "react";
import { AppConfigState } from "../model/state/AppConfigState.ts";
import AppConfigDispatch from "../model/state/dispatch/AppConfigDispatch.ts";

export const AppConfigStateContext = createContext<AppConfigState>(
  {} as AppConfigState
);

export const AppConfigDispatchContext = createContext<AppConfigDispatch>(
  {} as AppConfigDispatch
);
