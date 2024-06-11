import { FC, ReactNode, useReducer } from "react";
import AppNotificationsReducer from "../../reducer/app-notifications-reducer.ts";
import {
  AppNotificationsDispatchContext,
  AppNotificationsStateContext,
} from "../app-notifications-context.ts";

type Props = {
  children: ReactNode;
};
const AppNotificationsContextProvider: FC<Props> = ({ children }) => {
  const [appNotifications, dispatch] = useReducer(AppNotificationsReducer, {
    appNotifications: [],
  });
  return (
    <AppNotificationsStateContext.Provider value={appNotifications}>
      <AppNotificationsDispatchContext.Provider value={dispatch}>
        {children}
      </AppNotificationsDispatchContext.Provider>
    </AppNotificationsStateContext.Provider>
  );
};
export default AppNotificationsContextProvider;
