import { Dispatch } from "react";
import {
  AppNotificationSubmitAction,
  AppNotificationUuidPayloadAction,
} from "../../../reducer/app-notifications-reducer.ts";

type AppNotificationDispatch = Dispatch<
  AppNotificationSubmitAction | AppNotificationUuidPayloadAction
>;
export default AppNotificationDispatch;
