import { ContextMenuState } from "../model/state/ContextMenuState.ts";

export enum ContextMenuActionType {
  SET_CONTEXT_MENU = "SET_CONTEXT_MENU",
  SET_EXPAND_ADD_TO_LIST = "SET_EXPAND_ADD_TO_LIST",
  SET_EXPAND_REMOVE_TO_LIST = "SET_EXPAND_REMOVE_TO_LIST",
}

export type SetContextMenuAction = {
  type: ContextMenuActionType.SET_CONTEXT_MENU;
  payload: ContextMenuState;
};

export type ContextMenuBooleanPayloadAction = {
  type:
    | ContextMenuActionType.SET_EXPAND_ADD_TO_LIST
    | ContextMenuActionType.SET_EXPAND_REMOVE_TO_LIST;
  payload: boolean;
};
export default function ContextMenuReducer(
  state: ContextMenuState,
  action: SetContextMenuAction | ContextMenuBooleanPayloadAction // | SetPostContextMenuAction
): ContextMenuState {
  switch (action.type) {
    case ContextMenuActionType.SET_CONTEXT_MENU:
      return action.payload;
    case ContextMenuActionType.SET_EXPAND_ADD_TO_LIST:
      return setExpandAddToList(state, action);
    case ContextMenuActionType.SET_EXPAND_REMOVE_TO_LIST:
      return setExpandRemoveFromList(state, action);
    default:
      return state;
  }
}

const setExpandAddToList = (
  state: ContextMenuState,
  action: ContextMenuBooleanPayloadAction
): ContextMenuState => {
  const updatedShowButtonControls = { ...state.showButtonControls };
  updatedShowButtonControls.expandAddToList = action.payload;
  return {
    ...state,
    showButtonControls: updatedShowButtonControls,
  };
};
const setExpandRemoveFromList = (
  state: ContextMenuState,
  action: ContextMenuBooleanPayloadAction
): ContextMenuState => {
  const updatedShowButtonControls = { ...state.showButtonControls };
  updatedShowButtonControls.expandRemoveFromList = action.payload;
  return {
    ...state,
    showButtonControls: updatedShowButtonControls,
  };
};
