import { AppNotificationsState } from "../model/state/AppNotificationState.ts";
import { AppNotificationModel } from "../model/AppNotificationModel.ts";
import { v4 as uuidV4 } from "uuid";

export enum AppNotificationsActionType {
  SUBMIT_APP_NOTIFICATION = "SUBMIT_APP_NOTIFICATION",
  HIDE_APP_NOTIFICATION = "HIDE_APP_NOTIFICATION",
  DELETE_APP_NOTIFICATION = "DELETE_APP_NOTIFICATION",
}

export type AppNotificationSubmitAction = {
  type: AppNotificationsActionType.SUBMIT_APP_NOTIFICATION;
  payload: {
    displayTimeMS?: number;
    message: string;
  };
};

export type AppNotificationUuidPayloadAction = {
  type:
    | AppNotificationsActionType.HIDE_APP_NOTIFICATION
    | AppNotificationsActionType.DELETE_APP_NOTIFICATION;
  notificationUuid: string;
};

export default function AppNotificationsReducer(
  state: AppNotificationsState,
  action: AppNotificationSubmitAction | AppNotificationUuidPayloadAction
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
  action: AppNotificationSubmitAction
): AppNotificationsState => {
  const appNotification: AppNotificationModel = {
    displayTimeMS:
      action.payload.displayTimeMS === undefined
        ? 10000
        : action.payload.displayTimeMS,
    message: action.payload.message,
    showNotification: true,
    notificationUuid: uuidV4(),
  };
  return {
    ...state,
    appNotifications: [appNotification, ...state.appNotifications],
  };
};

const handleHideNotification = (
  state: AppNotificationsState,
  action: AppNotificationUuidPayloadAction
) => {
  const appNotificationUuid = action.notificationUuid;
  const notificationIndex = state.appNotifications.findIndex(
    (notification) => notification.notificationUuid === appNotificationUuid
  );
  if (notificationIndex === -1) {
    return state;
  }
  const updatedNotification: AppNotificationModel = {
    ...state.appNotifications[notificationIndex],
    showNotification: false,
  };

  const updatedNotificationArr = [...state.appNotifications];
  updatedNotificationArr[notificationIndex] = updatedNotification;
  return {
    ...state,
    appNotifications: updatedNotificationArr,
  };
};

const handleDeleteNotification = (
  state: AppNotificationsState,
  action: AppNotificationUuidPayloadAction
) => {
  const appNotificationUuid = action.notificationUuid;
  const notificationIndex = state.appNotifications.findIndex(
    (notification) => notification.notificationUuid === appNotificationUuid
  );
  if (notificationIndex === -1) {
    return state;
  }
  const updatedNotificationArr = [...state.appNotifications];
  updatedNotificationArr.splice(notificationIndex, 1);
  return {
    ...state,
    appNotifications: updatedNotificationArr,
  };
};
