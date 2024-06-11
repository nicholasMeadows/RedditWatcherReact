import { FC, useContext } from "react";
import { AppNotificationsStateContext } from "../context/app-notifications-context.ts";
import AppNotification from "./AppNotification.tsx";

const AppNotifications: FC = () => {
  const appNotifications = useContext(
    AppNotificationsStateContext
  ).appNotifications;
  return (
    <div className="app-notification-root">
      {appNotifications.map((appNotification) => {
        return (
          <AppNotification
            key={appNotification.notificationUuid}
            appNotification={appNotification}
          />
        );
      })}
    </div>
  );
};
export default AppNotifications;
