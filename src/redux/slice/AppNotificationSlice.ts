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

    const notificatoinUuid = uuidV4();
    setTimeout(() => {
      store.dispatch(hideNotification(notificatoinUuid));
    }, appNotification.displayTimeMS - 600);

    setTimeout(() => {
      store.dispatch(removeNotification(notificatoinUuid));
    }, appNotification.displayTimeMS);

    const appNotificationItem: AppNotificationItem = {
      appNotification: appNotification,
      appNotificationUuid: notificatoinUuid,
      showNotification: true,
    };
    return appNotificationItem;
  }
);

type AppNotificationItem = {
  appNotification: AppNotification;
  appNotificationUuid: string;
  showNotification: boolean;
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
