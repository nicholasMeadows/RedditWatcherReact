import { saveSubredditLists } from "../service/ConfigService.ts";
import { SubredditLists } from "../model/SubredditList/SubredditLists.ts";
import { ModifySubredditListMode } from "../model/ModifySubredditListMode.ts";
import { v4 as uuidV4 } from "uuid";
import { Subreddit } from "../model/Subreddit/Subreddit.ts";
import { RedditListState } from "../model/state/RedditListState.ts";

export enum RedditListActionType {
  SELECT_RANDOM_LISTS = "SELECT_RANDOM_LISTS",
  TOGGLE_SUBREDDIT_LIST_SELECTED = "TOGGLE_SUBREDDIT_LIST_SELECTED",
  SELECT_ALL_LISTS = "SELECT_ALL_LISTS",
  DESELECT_ALL_LISTS = "DESELECT_ALL_LISTS",
  SHOW_CREATE_LIST_BOX = "SHOW_CREATE_LIST_BOX",
  SHOW_UPDATE_LIST_BOX = "SHOW_UPDATE_LIST_BOX",
  RESET_MODIFY_LIST_BOX = "RESET_MODIFY_LIST_BOX",
  SET_CREATE_UPDATE_INPUT_VALUE = "SET_CREATE_UPDATE_INPUT_VALUE",
  CREATE_OR_MODIFY_LIST = "CREATE_OR_MODIFY_LIST",
  ADD_SUBREDDIT_TO_LIST = "ADD_SUBREDDIT_TO_LIST",
  REMOVE_SUBREDDIT_FROM_LIST = "REMOVE_SUBREDDIT_FROM_LIST",
  SHOW_DELETE_LIST_CONFIRMATION = "SHOW_DELETE_LIST_CONFIRMATION",
  DELETE_LIST = "DELETE_LIST",
  SET_SUBREDDIT_LISTS = "SET_SUBREDDIT_LISTS",
}

export type RedditListNoPayloadAction = {
  type:
    | RedditListActionType.SELECT_RANDOM_LISTS
    | RedditListActionType.SELECT_ALL_LISTS
    | RedditListActionType.DESELECT_ALL_LISTS
    | RedditListActionType.SHOW_CREATE_LIST_BOX
    | RedditListActionType.RESET_MODIFY_LIST_BOX
    | RedditListActionType.DELETE_LIST
    | RedditListActionType.CREATE_OR_MODIFY_LIST;
};

export type RedditListSubredditListsPayloadAction = {
  type:
    | RedditListActionType.TOGGLE_SUBREDDIT_LIST_SELECTED
    | RedditListActionType.SHOW_UPDATE_LIST_BOX
    | RedditListActionType.SHOW_DELETE_LIST_CONFIRMATION;
  payload: SubredditLists;
};
export type RedditListSetSubredditListsAction = {
  type: RedditListActionType.SET_SUBREDDIT_LISTS;
  payload: SubredditLists[];
};
export type RedditListSetCreateUpdateInputValueAction = {
  type: RedditListActionType.SET_CREATE_UPDATE_INPUT_VALUE;
  payload: string;
};

export type RedditListAddOrRemoveToListAction = {
  type:
    | RedditListActionType.ADD_SUBREDDIT_TO_LIST
    | RedditListActionType.REMOVE_SUBREDDIT_FROM_LIST;
  payload: {
    subreddit: Subreddit;
    subredditList: SubredditLists;
  };
};

export default function RedditListReducer(
  state: RedditListState,
  action:
    | RedditListNoPayloadAction
    | RedditListSubredditListsPayloadAction
    | RedditListSetSubredditListsAction
    | RedditListSetCreateUpdateInputValueAction
    | RedditListAddOrRemoveToListAction
) {
  switch (action.type) {
    case RedditListActionType.SELECT_RANDOM_LISTS:
      return selectRandomLists(state);
    case RedditListActionType.SELECT_ALL_LISTS:
      return selectAllLists(state);
    case RedditListActionType.DESELECT_ALL_LISTS:
      return deselectAllLists(state);
    case RedditListActionType.SHOW_CREATE_LIST_BOX:
      return showCreateListBox(state);
    case RedditListActionType.RESET_MODIFY_LIST_BOX:
      return resetModifyListBox(state);
    case RedditListActionType.DELETE_LIST:
      return deleteList(state);
    case RedditListActionType.CREATE_OR_MODIFY_LIST:
      return createOrModifyList(state);
    case RedditListActionType.TOGGLE_SUBREDDIT_LIST_SELECTED:
      return toggleSubredditListSelected(state, action);
    case RedditListActionType.SET_CREATE_UPDATE_INPUT_VALUE:
      return setCreateUpdateInputValue(state, action);
    case RedditListActionType.ADD_SUBREDDIT_TO_LIST:
      return addSubredditToList(state, action);
    case RedditListActionType.REMOVE_SUBREDDIT_FROM_LIST:
      return removeSubredditFromList(state, action);
    case RedditListActionType.SHOW_DELETE_LIST_CONFIRMATION:
      return showDeleteListConfirmationBox(state, action);
    case RedditListActionType.SET_SUBREDDIT_LISTS:
      return setSubredditLists(state, action);
    case RedditListActionType.SHOW_UPDATE_LIST_BOX:
      return showUpdateListBox(state, action);
    default:
      return state;
  }
}
const selectRandomLists = (state: RedditListState): RedditListState => {
  const subredditLists = state.subredditLists;
  const numberOfListsToSelect: number = Math.floor(
    Math.random() * subredditLists.length
  );
  const subredditUuidsToSelect: string[] = [];

  for (let i = 0; i < numberOfListsToSelect; ++i) {
    const indexToSelect = Math.floor(Math.random() * subredditLists.length);
    subredditUuidsToSelect.push(
      subredditLists[indexToSelect].subredditListUuid
    );
  }
  const updatedSubredditLists = [...state.subredditLists];
  updatedSubredditLists.forEach((list) => {
    list.selected = subredditUuidsToSelect.includes(list.subredditListUuid);
  });
  saveSubredditLists(updatedSubredditLists);
  return {
    ...state,
    subredditLists: updatedSubredditLists,
  };
};
const toggleSubredditListSelected = (
  state: RedditListState,
  action: { type: string; payload: SubredditLists }
): RedditListState => {
  const updatedSubredditLists = [...state.subredditLists];
  const subredditListUuid = action.payload.subredditListUuid;
  const foundSubredditListIndex = updatedSubredditLists.findIndex(
    (subredditList) => subredditList.subredditListUuid === subredditListUuid
  );
  if (foundSubredditListIndex === -1) {
    return state;
  }
  const foundSubreddit = updatedSubredditLists[foundSubredditListIndex];
  updatedSubredditLists[foundSubredditListIndex] = {
    ...foundSubreddit,
    selected: !foundSubreddit.selected,
  };
  saveSubredditLists(updatedSubredditLists);
  return {
    ...state,
    subredditLists: updatedSubredditLists,
  };
};
const selectAllLists = (state: RedditListState): RedditListState => {
  const subredditLists = [...state.subredditLists];
  subredditLists.forEach((subredditList) => {
    subredditList.selected = true;
  });
  saveSubredditLists(subredditLists);
  return {
    ...state,
    subredditLists: subredditLists,
  };
};
const deselectAllLists = (state: RedditListState): RedditListState => {
  const subredditLists = [...state.subredditLists];
  subredditLists.forEach((subredditList) => {
    subredditList.selected = false;
  });
  saveSubredditLists(subredditLists);
  return {
    ...state,
    subredditLists: subredditLists,
  };
};
const showCreateListBox = (state: RedditListState): RedditListState => {
  return {
    ...state,
    modifyListMode: ModifySubredditListMode.CREATE,
    showModifyListBox: true,
    modifyListBoxTitle: "Create New List",
    createUpdateInputValidationError: "",
    createUpdateButtonText: "Create",
  };
};
const showUpdateListBox = (
  state: RedditListState,
  action: RedditListSubredditListsPayloadAction
): RedditListState => {
  const subredditList = action.payload;
  return {
    ...state,
    modifyListMode: ModifySubredditListMode.UPDATE,
    showModifyListBox: true,
    modifyListBoxTitle: "Update List",
    createUpdateInputValue: subredditList.listName,
    createUpdateInputValidationError:
      subredditList.listName == state.createUpdateInputValue
        ? "List name already Exists"
        : "",
    createUpdateButtonText: "Update",
    updatingListUuid: subredditList.subredditListUuid,
  };
};
const resetModifyListBox = (state: RedditListState): RedditListState => {
  return resetModifyListBoxFields(state);
};
const setCreateUpdateInputValue = (
  state: RedditListState,
  action: RedditListSetCreateUpdateInputValueAction
): RedditListState => {
  const createUpdateInputValue = action.payload;
  const foundListWithSameName = state.subredditLists.find((subredditList) => {
    return (
      subredditList.listName.toLowerCase() ==
      createUpdateInputValue.toLowerCase()
    );
  });

  return {
    ...state,
    createUpdateInputValidationError:
      foundListWithSameName === undefined ? "" : "List name already exists",
  };
};
const createOrModifyList = (state: RedditListState): RedditListState => {
  const updatedSubredditLists = [...state.subredditLists];
  if (state.modifyListMode == ModifySubredditListMode.CREATE) {
    updatedSubredditLists.push({
      subredditListUuid: uuidV4(),
      listName: state.createUpdateInputValue,
      subreddits: [],
      selected: true,
    });
  } else if (state.modifyListMode == ModifySubredditListMode.UPDATE) {
    const foundList = updatedSubredditLists.find(
      (list) => list.subredditListUuid == state.updatingListUuid
    );
    if (foundList != undefined) {
      foundList.listName = state.createUpdateInputValue;
    }
  }
  saveSubredditLists(updatedSubredditLists);
  resetModifyListBoxFields(state);
  return {
    ...state,
    subredditLists: updatedSubredditLists,
  };
};
const addSubredditToList = (
  state: RedditListState,
  action: RedditListAddOrRemoveToListAction
): RedditListState => {
  const updatedSsubredditLists = [...state.subredditLists];
  const foundList = updatedSsubredditLists.find(
    (list) =>
      list.subredditListUuid == action.payload.subredditList.subredditListUuid
  );
  if (foundList === undefined) {
    return state;
  }
  foundList.subreddits = [...foundList.subreddits, action.payload.subreddit];
  saveSubredditLists(updatedSsubredditLists);
  return {
    ...state,
    subredditLists: updatedSsubredditLists,
  };
};
const removeSubredditFromList = (
  state: RedditListState,
  action: RedditListAddOrRemoveToListAction
): RedditListState => {
  const updatedSubredditLists = [...state.subredditLists];
  const foundList = updatedSubredditLists.find(
    (list) =>
      list.subredditListUuid == action.payload.subredditList.subredditListUuid
  );
  if (foundList === undefined) {
    return state;
  }
  const updatedSubreddits = foundList.subreddits.filter(
    (subreddit) =>
      subreddit.displayName.toLowerCase() !=
      action.payload.subreddit.displayName.toLowerCase()
  );
  foundList.subreddits = updatedSubreddits;
  saveSubredditLists(updatedSubredditLists);
  return {
    ...state,
    subredditLists: updatedSubredditLists,
  };
};
const showDeleteListConfirmationBox = (
  state: RedditListState,
  action: RedditListSubredditListsPayloadAction
): RedditListState => {
  return {
    ...state,
    modifyListMode: ModifySubredditListMode.DELETE,
    showModifyListBox: true,
    modifyListBoxTitle: `Are you sure you want to delete list with name "${action.payload.listName}"?`,
    updatingListUuid: action.payload.subredditListUuid,
  };
};
const deleteList = (state: RedditListState): RedditListState => {
  const updatedLists = state.subredditLists.filter(
    (list) => list.subredditListUuid != state.updatingListUuid
  );
  saveSubredditLists(updatedLists);
  const updatedState = resetModifyListBoxFields(state);
  return {
    ...updatedState,
    subredditLists: updatedLists,
  };
};
const setSubredditLists = (
  state: RedditListState,
  action: RedditListSetSubredditListsAction
): RedditListState => {
  return {
    ...state,
    subredditLists: action.payload,
    subredditListsLoaded: true,
  };
};

const resetModifyListBoxFields = (state: RedditListState) => {
  return {
    ...state,
    modifyListMode: undefined,
    showModifyListBox: false,
    modifyListBoxTitle: "",
    createUpdateInputValue: "",
    createUpdateInputValidationError: "",
    createUpdateButtonText: "",
    updatingListUuid: undefined,
  };
};
