import { useAppDispatch, useAppSelector } from "../redux/store";
import { dismissAppNotification } from "../redux/slice/AppNotificationSlice.ts";

const AppNotification: React.FC = () => {
  const dispatch = useAppDispatch();
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
              appNotificationItem.showNotification ? "show-notification" : ""
            }`}
            onClick={() => {
              dispatch(dismissAppNotification(appNotificationItem));
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
