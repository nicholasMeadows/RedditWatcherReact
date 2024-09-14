import {
  FC,
  TransitionEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { AppNotification } from "../model/AppNotification.ts";
import { AppNotificationsDispatchContext } from "../context/app-notifications-context.ts";
import { AppNotificationsActionType } from "../reducer/app-notifications-reducer.ts";

const NOTIFICATION_FADE_TIME_SECONDS = 1;
type Props = {
  appNotification: AppNotification;
};
const AppNotification: FC<Props> = ({ appNotification }) => {
  const appNotificationsDispatch = useContext(AppNotificationsDispatchContext);
  const notificationDivRef = useRef<HTMLDivElement>(null);
  const hideNotificationTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (hideNotificationTimeoutRef.current !== undefined) {
      return;
    }
    hideNotificationTimeoutRef.current = setTimeout(() => {
      appNotificationsDispatch({
        type: AppNotificationsActionType.HIDE_APP_NOTIFICATION,
        notificationUuid: appNotification.notificationUuid,
      });
    }, appNotification.displayTimeMS);
  }, []);

  const handleOpacityTransitionEnd = useCallback((event: TransitionEvent) => {
    if (
      notificationDivRef.current === undefined ||
      notificationDivRef.current !== event.target ||
      event.propertyName !== "opacity"
    ) {
      return;
    }
    appNotificationsDispatch({
      type: AppNotificationsActionType.DELETE_APP_NOTIFICATION,
      notificationUuid: appNotification.notificationUuid,
    });
  }, []);

  return (
    <div
      ref={notificationDivRef}
      onTransitionEnd={handleOpacityTransitionEnd}
      className={`notification-box ${
        appNotification.showNotification ? "show-notification" : ""
      }`}
      style={{
        transition: `opacity ${NOTIFICATION_FADE_TIME_SECONDS}s ease-out`,
      }}
      onClick={() => {
        if (hideNotificationTimeoutRef.current !== undefined) {
          clearTimeout(hideNotificationTimeoutRef.current);
        }
        appNotificationsDispatch({
          type: AppNotificationsActionType.HIDE_APP_NOTIFICATION,
          notificationUuid: appNotification.notificationUuid,
        });
      }}
    >
      <p className="notification-text">{appNotification.message}</p>
    </div>
  );
};
export default AppNotification;
