import { AppNotification } from "../../model/AppNotification.ts";
import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidV4 } from "uuid";
import store from "../store.ts";

export type AppNotificationItem = {
  appNotification: AppNotification;
  appNotificationUuid: string;
  showNotification: boolean;
  hideTimeout: NodeJS.Timeout;
  removeTimeout: NodeJS.Timeout;
};

type AppNotificationState = {
  appNotifications: AppNotificationItem[];
};
const hideNotification = (
  state: AppNotificationState,
  notificationUuid: string
) => {
  const foundNotification = state.appNotifications.find(
    (notification) => notification.appNotificationUuid == notificationUuid
  );
  if (foundNotification != undefined) {
    foundNotification.showNotification = false;
  }
};
const removeNotification = (
  state: AppNotificationState,
  notificationUuid: string
) => {
  state.appNotifications = state.appNotifications.filter(
    (notification) => notification.appNotificationUuid != notificationUuid
  );
};
export const appNotificationSlice = createSlice({
  name: "appNotificationSlice",
  initialState: {
    appNotifications: new Array<AppNotificationItem>(),
  },
  reducers: {
    submitAppNotification: (
      state,
      action: { type: string; payload: AppNotification }
    ) => {
      const appNotification = action.payload;
      if (appNotification.displayTimeMS == undefined) {
        appNotification.displayTimeMS = 10000;
      }

      const notificationUuuid = uuidV4();
      const hideTimeout = setTimeout(() => {
        store.dispatch(hideAppNotification(notificationUuuid));
      }, appNotification.displayTimeMS - 600);

      const removeTimeout = setTimeout(() => {
        store.dispatch(removeAppNotification(notificationUuuid));
      }, appNotification.displayTimeMS);

      const appNotificationItem: AppNotificationItem = {
        appNotification: appNotification,
        appNotificationUuid: notificationUuuid,
        showNotification: true,
        hideTimeout: hideTimeout,
        removeTimeout: removeTimeout,
      };
      state.appNotifications.push(appNotificationItem);
    },
    dismissAppNotification: (
      state,
      action: { type: string; payload: AppNotificationItem }
    ) => {
      const appNotification = action.payload;
      clearTimeout(appNotification.hideTimeout);
      clearTimeout(appNotification.removeTimeout);
      hideNotification(state, appNotification.appNotificationUuid);
      setTimeout(() => {
        store.dispatch(
          removeAppNotification(appNotification.appNotificationUuid)
        );
      }, 600);
    },
    hideAppNotification: (state, action: { type: string; payload: string }) => {
      const notificationUuuid = action.payload;
      hideNotification(state, notificationUuuid);
    },
    removeAppNotification: (
      state,
      action: { type: string; payload: string }
    ) => {
      const notificationUuuid = action.payload;
      removeNotification(state, notificationUuuid);
    },
  },
});

export const {
  submitAppNotification,
  dismissAppNotification,
  hideAppNotification,
  removeAppNotification,
} = appNotificationSlice.actions;
export default appNotificationSlice.reducer;
