import { AppNotification } from "../model/AppNotification.ts";
import { v4 as uuidV4 } from "uuid";
import { useContext } from "react";
import {
  AppNotificationContext,
  AppNotificationItem,
} from "../context/app-notification-context.ts";

export type UseAppNotification = {
  submitAppNotification: (appNotification: AppNotification) => void;
  dismissAppNotification: (appNotification: AppNotificationItem) => void;
};
export default function useAppNotifiction(): UseAppNotification {
  const { appNotifications, setAppNotifications } = useContext(
    AppNotificationContext
  );
  const submitAppNotification = async (appNotification: AppNotification) => {
    if (appNotification.displayTimeMS == undefined) {
      appNotification.displayTimeMS = 10000;
    }

    const notificationUuuid = uuidV4();
    const hideTimeout = setTimeout(() => {
      hideNotification(notificationUuuid);
    }, appNotification.displayTimeMS - 600);

    const removeTimeout = setTimeout(() => {
      removeNotification(notificationUuuid);
    }, appNotification.displayTimeMS);

    const appNotificationItem: AppNotificationItem = {
      appNotification: appNotification,
      appNotificationUuid: notificationUuuid,
      showNotification: true,
      hideTimeout: hideTimeout,
      removeTimeout: removeTimeout,
    };
    appNotifications.push(appNotificationItem);
    setAppNotifications([...appNotifications]);
  };

  const dismissAppNotification = async (
    appNotification: AppNotificationItem
  ) => {
    clearTimeout(appNotification.hideTimeout);
    clearTimeout(appNotification.removeTimeout);
    hideNotification(appNotification.appNotificationUuid);
    setTimeout(() => {
      removeNotification(appNotification.appNotificationUuid);
    }, 600);
  };

  const hideNotification = (notificationUuid: string) => {
    const foundNotification = appNotifications.find(
      (notification) => notification.appNotificationUuid == notificationUuid
    );
    if (foundNotification != undefined) {
      foundNotification.showNotification = false;
      setAppNotifications([...appNotifications]);
    }
  };
  const removeNotification = (notificationUuid: string) => {
    const updatedAppNotifications = appNotifications.filter(
      (notification) => notification.appNotificationUuid != notificationUuid
    );
    setAppNotifications([...updatedAppNotifications]);
  };

  return {
    submitAppNotification: submitAppNotification,
    dismissAppNotification: dismissAppNotification,
  };
}
