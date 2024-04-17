import { useContext } from "react";
import { AppNotificationContext } from "../context/app-notification-context.ts";
import useAppNotifiction from "../hook/use-app-notification.ts";

const AppNotification: React.FC = () => {
  const { appNotifications } = useContext(AppNotificationContext);
  const appNotification = useAppNotifiction();
  return (
    <div className="app-notification-root">
      {appNotifications.map((appNotificationItem) => {
        return (
          <div
            key={appNotificationItem.appNotificationUuid}
            className={`notification-box ${
              appNotificationItem.showNotification ? "show-notification" : ""
            }`}
            onClick={() => {
              appNotification.dismissAppNotification(appNotificationItem);
            }}
          >
            <p className="notification-text">
              {appNotificationItem.appNotification.message}
            </p>
          </div>
        );
      })}
    </div>
  );
};
export default AppNotification;
