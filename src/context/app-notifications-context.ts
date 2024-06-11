import { createContext, Dispatch } from "react";
import {
  AppNotificationsAction,
  AppNotificationsState,
} from "../reducer/app-notifications-reducer.ts";

export const AppNotificationsStateContext =
  createContext<AppNotificationsState>({} as AppNotificationsState);
export const AppNotificationsDispatchContext = createContext<
  Dispatch<AppNotificationsAction>
>({} as Dispatch<AppNotificationsAction>);
