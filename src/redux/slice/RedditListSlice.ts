import { SubredditLists } from "../../model/SubredditList/SubredditLists.ts";
import { ModifySubredditListMode } from "../../model/ModifySubredditListMode.ts";
import { createSlice } from "@reduxjs/toolkit";
import { saveSubredditLists } from "../../service/ConfigService.ts";
import { v4 as uuidV4 } from "uuid";
import { Subreddit } from "../../model/Subreddit/Subreddit.ts";

type RedditListState = {
  subredditLists: Array<SubredditLists>;
  modifyListMode: ModifySubredditListMode | undefined;
  showModifyListBox: boolean;
  modifyListBoxTitle: string;
  createUpdateInputValue: string;
  createUpdateInputValidationError: string;
  createUpdateButtonText: string;
  updatingListUuid: string | undefined;
};
const initialState: RedditListState = {
  subredditLists: [],
  modifyListMode: undefined,
  showModifyListBox: false,
  modifyListBoxTitle: "",
  createUpdateInputValue: "",
  createUpdateInputValidationError: "",
  createUpdateButtonText: "",
  updatingListUuid: undefined,
};
const resetModifyListBoxFields = (state: RedditListState) => {
  state.modifyListMode = undefined;
  state.showModifyListBox = false;
  state.modifyListBoxTitle = "";
  state.createUpdateInputValue = "";
  state.createUpdateInputValidationError = "";
  state.createUpdateButtonText = "";
  state.updatingListUuid = undefined;
};
export const redditListSlice = createSlice({
  name: "redditListSlice",
  initialState: initialState,
  reducers: {
    selectRandomLists: (state) => {
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

      subredditLists.forEach((list) => {
        list.selected = subredditUuidsToSelect.includes(list.subredditListUuid);
      });
      saveSubredditLists(subredditLists);
    },
    toggleSubredditListSelected: (
      state,
      action: { type: string; payload: SubredditLists }
    ) => {
      const subredditLists = state.subredditLists;
      const subredditListUuid = action.payload.subredditListUuid;
      const foundSubredditList = subredditLists.find(
        (subredditList) => subredditList.subredditListUuid === subredditListUuid
      );
      if (foundSubredditList != undefined) {
        foundSubredditList.selected = !foundSubredditList.selected;
        saveSubredditLists(subredditLists);
      }
    },
    selectAllLists: (state) => {
      const subredditLists = state.subredditLists;
      subredditLists.forEach((subredditList) => {
        subredditList.selected = true;
      });
      saveSubredditLists(subredditLists);
    },
    deselectAllLists: (state) => {
      const subredditLists = state.subredditLists;
      subredditLists.forEach((subredditList) => {
        subredditList.selected = false;
      });
      saveSubredditLists(subredditLists);
    },
    showCreateListBox: (state) => {
      state.modifyListMode = ModifySubredditListMode.CREATE;
      state.showModifyListBox = true;
      state.modifyListBoxTitle = "Create New List";
      state.createUpdateInputValidationError = "";
      state.createUpdateButtonText = "Create";
    },
    showUpdateListBox: (
      state,
      action: { type: string; payload: SubredditLists }
    ) => {
      const subredditList = action.payload;
      state.modifyListMode = ModifySubredditListMode.UPDATE;
      state.showModifyListBox = true;
      state.modifyListBoxTitle = "Update List";
      state.createUpdateInputValue = subredditList.listName;
      state.createUpdateInputValidationError =
        subredditList.listName == state.createUpdateInputValue
          ? "List name already Exists"
          : "";
      state.createUpdateButtonText = "Update";
      state.updatingListUuid = subredditList.subredditListUuid;
    },
    resetModifyListBox: (state) => {
      resetModifyListBoxFields(state);
    },
    setCreateUpdateInputValue: (
      state,
      action: { type: string; payload: string }
    ) => {
      const createUpdateInputValue = action.payload;
      const foundListWithSameName = state.subredditLists.find(
        (subredditList) => {
          return (
            subredditList.listName.toLowerCase() ==
            createUpdateInputValue.toLowerCase()
          );
        }
      );

      state.createUpdateInputValidationError =
        foundListWithSameName === undefined ? "" : "List name already exists";
    },
    createOrModifyList: (state) => {
      const subredditLists = state.subredditLists;
      if (state.modifyListMode == ModifySubredditListMode.CREATE) {
        subredditLists.push({
          subredditListUuid: uuidV4(),
          listName: state.createUpdateInputValue,
          subreddits: [],
          selected: true,
        });
      } else if (state.modifyListMode == ModifySubredditListMode.UPDATE) {
        const foundList = subredditLists.find(
          (list) => list.subredditListUuid == state.updatingListUuid
        );
        if (foundList != undefined) {
          foundList.listName = state.createUpdateInputValue;
        }
      }
      saveSubredditLists(subredditLists);
      resetModifyListBoxFields(state);
    },
    addSubredditToList: (
      state,
      action: {
        type: string;
        payload: {
          subredditListItemToAdd: Subreddit;
          subredditListToAddTo: SubredditLists;
        };
      }
    ) => {
      const subredditLists = state.subredditLists;
      const foundList = subredditLists.find(
        (list) =>
          list.subredditListUuid ==
          action.payload.subredditListToAddTo.subredditListUuid
      );
      if (foundList != undefined) {
        foundList.subreddits.push(action.payload.subredditListItemToAdd);
        saveSubredditLists(subredditLists);
      }
    },
    removeSubredditFromList: (
      state,
      action: {
        type: string;
        payload: {
          subredditListItemToRemove: Subreddit;
          removeFromList: SubredditLists;
        };
      }
    ) => {
      const subredditLists = state.subredditLists;
      const foundList = subredditLists.find(
        (list) =>
          list.subredditListUuid ==
          action.payload.removeFromList.subredditListUuid
      );
      if (foundList != undefined) {
        foundList.subreddits = foundList.subreddits.filter(
          (subreddit) =>
            subreddit.displayName.toLowerCase() !=
            action.payload.subredditListItemToRemove.displayName.toLowerCase()
        );
        saveSubredditLists(subredditLists);
      }
    },
    showDeleteListConfirmationBox: (
      state,
      action: { type: string; payload: SubredditLists }
    ) => {
      const subredditList = action.payload;
      state.modifyListMode = ModifySubredditListMode.DELETE;
      state.showModifyListBox = true;
      state.modifyListBoxTitle = `Are you sure you want to delete list with name "${subredditList.listName}"?`;
      state.updatingListUuid = subredditList.subredditListUuid;
    },
    deleteList: (state) => {
      const updatedLists = state.subredditLists.filter(
        (list) => list.subredditListUuid != state.updatingListUuid
      );
      state.subredditLists = updatedLists;
      saveSubredditLists(updatedLists);
      resetModifyListBoxFields(state);
    },
    setSubredditLists: (
      state,
      action: { type: string; payload: SubredditLists[] }
    ) => {
      state.subredditLists = action.payload;
    },
  },
});
export const {
  selectRandomLists,
  toggleSubredditListSelected,
  selectAllLists,
  deselectAllLists,
  showCreateListBox,
  showUpdateListBox,
  resetModifyListBox,
  setCreateUpdateInputValue,
  createOrModifyList,
  addSubredditToList,
  removeSubredditFromList,
  showDeleteListConfirmationBox,
  deleteList,
  setSubredditLists,
} = redditListSlice.actions;
export default redditListSlice.reducer;
