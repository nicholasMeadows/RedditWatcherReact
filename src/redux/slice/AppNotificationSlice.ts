import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AppNotification } from "../../model/AppNotification";
import { v4 as uuidV4 } from "uuid";
import store from "../store";

export const submitAppNotification = createAsyncThunk(
  "appNotification/submitAppNotification",
  async (appNotification: AppNotification) => {
    if (appNotification.displayTimeMS == undefined) {
      appNotification.displayTimeMS = 10000;
    }

    const notificationUuuid = uuidV4();
    const hideTimeout = setTimeout(() => {
      store.dispatch(hideNotification(notificationUuuid));
    }, appNotification.displayTimeMS - 600);

    const removeTimeout = setTimeout(() => {
      store.dispatch(removeNotification(notificationUuuid));
    }, appNotification.displayTimeMS);

    const appNotificationItem: AppNotificationItem = {
      appNotification: appNotification,
      appNotificationUuid: notificationUuuid,
      showNotification: true,
      hideTimeout: hideTimeout,
      removeTimeout: removeTimeout,
    };
    return appNotificationItem;
  }
);

export const dismissAppNotification = createAsyncThunk(
  "appNotification/dismissAppNotification",
  async (appNotification: AppNotificationItem) => {
    clearTimeout(appNotification.hideTimeout);
    clearTimeout(appNotification.removeTimeout);
    store.dispatch(hideNotification(appNotification.appNotificationUuid));
    setTimeout(() => {
      store.dispatch(removeNotification(appNotification.appNotificationUuid));
    }, 600);
  }
);

type AppNotificationItem = {
  appNotification: AppNotification;
  appNotificationUuid: string;
  showNotification: boolean;
  hideTimeout: NodeJS.Timeout;
  removeTimeout: NodeJS.Timeout;
};

const initialState = {
  notifications: new Array<AppNotificationItem>(),
};

export const appNotificationSlice = createSlice({
  name: "appNotification",
  initialState: initialState,
  reducers: {
    hideNotification: (state, action: { type: string; payload: string }) => {
      const notificationUuid = action.payload;
      const foundNotification = state.notifications.find(
        (notification) => notification.appNotificationUuid == notificationUuid
      );
      if (foundNotification != undefined) {
        foundNotification.showNotification = false;
      }
    },
    removeNotification: (state, action: { type: string; payload: string }) => {
      const notificationUuid = action.payload;
      state.notifications = state.notifications.filter(
        (notification) => notification.appNotificationUuid != notificationUuid
      );
    },
  },
  extraReducers(builder) {
    builder.addCase(submitAppNotification.fulfilled, (state, action) => {
      state.notifications.push(action.payload);
    });
  },
});

export const { hideNotification, removeNotification } =
  appNotificationSlice.actions;
export default appNotificationSlice.reducer;
