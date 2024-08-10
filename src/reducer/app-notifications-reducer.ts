import { AppNotification } from "../model/AppNotification.ts";
import { AppNotificationsState } from "../model/state/AppNotificationState.ts";

export enum AppNotificationsActionType {
  SUBMIT_APP_NOTIFICATION = "SUBMIT_APP_NOTIFICATION",
  HIDE_APP_NOTIFICATION = "HIDE_APP_NOTIFICATION",
  DELETE_APP_NOTIFICATION = "DELETE_APP_NOTIFICATION",
}

export type AppNotificationsAction = {
  type: AppNotificationsActionType;
  payload: AppNotification;
};

export default function AppNotificationsReducer(
  state: AppNotificationsState,
  action: AppNotificationsAction
) {
  switch (action.type) {
    case AppNotificationsActionType.SUBMIT_APP_NOTIFICATION:
      return handleSubmitAppNotification(state, action);
    case AppNotificationsActionType.HIDE_APP_NOTIFICATION:
      return handleHideNotification(state, action);
    case AppNotificationsActionType.DELETE_APP_NOTIFICATION:
      return handleDeleteNotification(state, action);
    default:
      return state;
  }
}

const handleSubmitAppNotification = (
  state: AppNotificationsState,
  action: AppNotificationsAction
): AppNotificationsState => {
  const appNotification = action.payload;
  appNotification.showNotification = true;
  if (appNotification.displayTimeMS == undefined) {
    appNotification.displayTimeMS = 10000;
  }
  const updatedState = { ...state };
  const existingAppNotificationIndex = updatedState.appNotifications.findIndex(
    (notification) =>
      notification.notificationUuid === appNotification.notificationUuid
  );
  if (existingAppNotificationIndex === -1) {
    updatedState.appNotifications.push(appNotification);
  } else {
    updatedState.appNotifications[existingAppNotificationIndex] =
      appNotification;
  }
  return updatedState;
};

const handleHideNotification = (
  state: AppNotificationsState,
  action: AppNotificationsAction
) => {
  const appNotification = action.payload;
  const updatedState = { ...state };
  const foundAppNotification = updatedState.appNotifications.find(
    (notification) =>
      notification.notificationUuid === appNotification.notificationUuid
  );
  if (foundAppNotification === undefined) {
    return state;
  }
  foundAppNotification.showNotification = false;
  return updatedState;
};

const handleDeleteNotification = (
  state: AppNotificationsState,
  action: AppNotificationsAction
) => {
  const appNotification = action.payload;
  const notificationIndex = state.appNotifications.findIndex(
    (notification) =>
      notification.notificationUuid === appNotification.notificationUuid
  );
  if (notificationIndex === -1) {
    return state;
  }
  const updatedState = { ...state };
  updatedState.appNotifications.splice(notificationIndex, 1);
  return updatedState;
};
