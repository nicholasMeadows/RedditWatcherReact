import { createContext } from "react";
import { AppNotificationsState } from "../model/state/AppNotificationState.ts";
import AppNotificationDispatch from "../model/state/dispatch/AppNotificationDispatch.ts";

export const AppNotificationsStateContext =
  createContext<AppNotificationsState>({} as AppNotificationsState);
export const AppNotificationsDispatchContext =
  createContext<AppNotificationDispatch>({} as AppNotificationDispatch);
