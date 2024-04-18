import { AppNotification } from "../model/AppNotification.ts";
import { createContext } from "react";

export type AppNotificationItem = {
  appNotification: AppNotification;
  appNotificationUuid: string;
  showNotification: boolean;
  hideTimeout: NodeJS.Timeout;
  removeTimeout: NodeJS.Timeout;
};

export type AppNotificationItemContextData = {
  appNotifications: AppNotificationItem[];
  setAppNotifications: React.Dispatch<
    React.SetStateAction<AppNotificationItem[]>
  >;
};
export const AppNotificationContext = createContext(
  {} as AppNotificationItemContextData
);
