import { FC, useCallback, useContext, useEffect, useRef } from "react";
import { AppNotification } from "../model/AppNotification.ts";
import { AppNotificationsDispatchContext } from "../context/app-notifications-context.ts";
import { AppNotificationsActionType } from "../reducer/app-notifications-reducer.ts";

const NOTIFICATION_FADE_TIME_SECONDS = 1;
type Props = {
  appNotification: AppNotification;
};
const AppNotification: FC<Props> = ({ appNotification }) => {
  const appNotificationsDispatch = useContext(AppNotificationsDispatchContext);
  const hideNotificationTimeoutRef = useRef<NodeJS.Timeout>();
  const deleteNotificationTimeoutRef = useRef<NodeJS.Timeout>();

  const clearHideNotificationTimeout = useCallback(() => {
    if (hideNotificationTimeoutRef.current !== undefined) {
      clearTimeout(hideNotificationTimeoutRef.current);
      hideNotificationTimeoutRef.current = undefined;
    }
  }, []);

  const clearDeleteNotificationTimeout = useCallback(() => {
    if (deleteNotificationTimeoutRef.current !== undefined) {
      clearTimeout(deleteNotificationTimeoutRef.current);
      deleteNotificationTimeoutRef.current = undefined;
    }
  }, []);

  const hideNotification = useCallback(() => {
    appNotificationsDispatch({
      type: AppNotificationsActionType.HIDE_APP_NOTIFICATION,
      notificationUuid: appNotification.notificationUuid,
    });
  }, [appNotification, appNotificationsDispatch]);

  const deleteNotification = useCallback(() => {
    appNotificationsDispatch({
      type: AppNotificationsActionType.DELETE_APP_NOTIFICATION,
      notificationUuid: appNotification.notificationUuid,
    });
  }, [appNotification, appNotificationsDispatch]);

  useEffect(() => {
    clearHideNotificationTimeout();
    clearDeleteNotificationTimeout();
    if (appNotification.displayTimeMS === undefined) {
      deleteNotification();
      return;
    }

    hideNotificationTimeoutRef.current = setTimeout(() => {
      hideNotification();
    }, appNotification.displayTimeMS);

    deleteNotificationTimeoutRef.current = setTimeout(() => {
      deleteNotification();
    }, appNotification.displayTimeMS + NOTIFICATION_FADE_TIME_SECONDS * 1000);
    return () => {
      clearHideNotificationTimeout();
      clearDeleteNotificationTimeout();
    };
  }, [
    appNotification,
    appNotification.displayTimeMS,
    appNotificationsDispatch,
    clearDeleteNotificationTimeout,
    clearHideNotificationTimeout,
    deleteNotification,
    hideNotification,
  ]);

  return (
    <div
      className={`notification-box ${
        appNotification.showNotification ? "show-notification" : ""
      }`}
      style={{
        transition: `opacity ${NOTIFICATION_FADE_TIME_SECONDS}s ease-out`,
      }}
      onClick={() => {
        clearHideNotificationTimeout();
        clearDeleteNotificationTimeout();
        hideNotification();
        setTimeout(() => {
          deleteNotification();
        }, NOTIFICATION_FADE_TIME_SECONDS * 1000);
      }}
    >
      <p className="notification-text">{appNotification.message}</p>
    </div>
  );
};
export default AppNotification;
