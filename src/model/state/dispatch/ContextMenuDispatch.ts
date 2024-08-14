import { Dispatch } from "react";
import {
  ContextMenuBooleanPayloadAction,
  SetContextMenuAction,
} from "../../../reducer/context-menu-reducer.ts";

type ContextMenuDispatch = Dispatch<
  SetContextMenuAction | ContextMenuBooleanPayloadAction
>;

export default ContextMenuDispatch;
