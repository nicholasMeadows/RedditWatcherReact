import { useAppSelector } from "../redux/store";

const AppNotification: React.FC = () => {
  const appNotifications = useAppSelector(
    (state) => state.appNotification.notifications
  );
  return (
    <div className="app-notification-root">
      {appNotifications.map((appNotificationItem) => {
        return (
          <div
            key={appNotificationItem.appNotificationUuid}
            className={`notification-box ${
              appNotificationItem.showNotification
                ? "show-notification"
                : "hide-notification"
            }`}
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
