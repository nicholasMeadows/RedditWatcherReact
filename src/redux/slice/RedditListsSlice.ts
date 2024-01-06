import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { SubredditLists } from "../../model/SubredditList/SubredditLists";
import {
  loadSubredditListsFromFile,
  saveSubredditLists,
} from "../../service/ConfigService";
import { v4 as uuidV4 } from "uuid";
import store from "../store";
import { ModifySubredditListMode } from "../../model/ModifySubredditListMode";
import { Subreddit } from "../../model/Subreddit/Subreddit";
import RedditListsState from "../../model/RedditListsState.ts";

export const loadSubredditLists = createAsyncThunk(
  "redditLists/loadSubredditLists",
  async () => {
    const subredditLists = await loadSubredditListsFromFile();
    subredditLists.forEach((list) => {
      list.subredditListUuid = uuidV4();
      list.subreddits.map((subreddit) => (subreddit.subredditUuid = uuidV4()));
    });
    return subredditLists;
  }
);

export const selectRandomLists = createAsyncThunk(
  "redditLists/selectRandomLists",
  async () => {
    const subredditLists = store.getState().subredditLists.subredditLists;
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

    return subredditUuidsToSelect;
  }
);

const resetModifyListBoxFields = (state: RedditListsState) => {
  state.modifyListMode = undefined;
  state.showModifyListBox = false;
  state.modifyListBoxTitle = "";
  state.createUpdateInputValue = "";
  state.createUpdateInputValidationError = "";
  state.createUpdateButtonText = "";
  state.updatingListUuid = undefined;
};

const findListWithSameName = (state: RedditListsState, name: string) => {
  return state.subredditLists.find((subredditList) => {
    return subredditList.listName.toLowerCase() == name.toLowerCase();
  });
};

const initialState: RedditListsState = {
  subredditLists: [],
  subredditListsLoaded: false,
  modifyListMode: undefined,
  showModifyListBox: false,
  modifyListBoxTitle: "",
  createUpdateInputValue: "",
  createUpdateInputValidationError: "",
  createUpdateButtonText: "",
  updatingListUuid: undefined,
};
export const redditListsSlice = createSlice({
  name: "redditLists",
  initialState: initialState,
  reducers: {
    toggleSubredditListSelected: (state, action) => {
      const foundSubredditList = state.subredditLists.find(
        (subredditList) =>
          subredditList.subredditListUuid ===
          (action.payload as SubredditLists).subredditListUuid
      );
      if (foundSubredditList != undefined) {
        foundSubredditList.selected = !foundSubredditList.selected;
      }
      saveSubredditLists(state.subredditLists);
    },
    selectAllLists: (state) => {
      state.subredditLists.forEach((subredditList) => {
        subredditList.selected = true;
      });
      saveSubredditLists(state.subredditLists);
    },
    deselectAllLists: (state) => {
      state.subredditLists.forEach((subredditList) => {
        subredditList.selected = false;
      });
      saveSubredditLists(state.subredditLists);
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
      state.modifyListMode = ModifySubredditListMode.UPDATE;
      state.showModifyListBox = true;
      state.modifyListBoxTitle = "Update List";
      state.createUpdateInputValue = action.payload.listName;
      state.createUpdateInputValidationError =
        action.payload.listName == state.createUpdateInputValue
          ? "List name already Exists"
          : "";
      state.createUpdateButtonText = "Update";
      state.updatingListUuid = action.payload.subredditListUuid;
    },
    resetModifyListBox: (state) => {
      resetModifyListBoxFields(state);
    },
    setCreateUpdateInputValue: (
      state,
      action: { type: string; payload: string }
    ) => {
      state.createUpdateInputValue = action.payload;
      const foundListWithSameName = findListWithSameName(state, action.payload);
      if (foundListWithSameName == undefined) {
        state.createUpdateInputValidationError = "";
      } else {
        state.createUpdateInputValidationError = "List name already exists";
      }
    },
    createOrModifyList: (state) => {
      if (state.modifyListMode == ModifySubredditListMode.CREATE) {
        state.subredditLists.push({
          subredditListUuid: uuidV4(),
          listName: state.createUpdateInputValue,
          subreddits: [],
          selected: true,
        });
      } else if (state.modifyListMode == ModifySubredditListMode.UPDATE) {
        const foundList = state.subredditLists.find(
          (list) => list.subredditListUuid == state.updatingListUuid
        );
        if (foundList != undefined) {
          foundList.listName = state.createUpdateInputValue;
        }
      }
      saveSubredditLists(state.subredditLists);
      resetModifyListBoxFields(state);
    },
    addSubredditToList: (
      state,
      action: {
        type: string;
        payload: {
          subredditListItem: Subreddit;
          subredditList: SubredditLists;
        };
      }
    ) => {
      const subredditLists = state.subredditLists;
      const foundList = subredditLists.find(
        (list) =>
          list.subredditListUuid ==
          action.payload.subredditList.subredditListUuid
      );
      if (foundList != undefined) {
        foundList.subreddits.push(action.payload.subredditListItem);
      }
      saveSubredditLists(subredditLists);
    },
    removeSubredditFromList: (
      state,
      action: {
        type: string;
        payload: {
          subredditListItem: Subreddit;
          subredditList: SubredditLists;
        };
      }
    ) => {
      const subredditLists = state.subredditLists;
      const foundList = subredditLists.find(
        (list) =>
          list.subredditListUuid ==
          action.payload.subredditList.subredditListUuid
      );
      if (foundList != undefined) {
        foundList.subreddits = foundList.subreddits.filter(
          (subreddit) =>
            subreddit.displayName.toLowerCase() !=
            action.payload.subredditListItem.displayName.toLowerCase()
        );
      }
      saveSubredditLists(subredditLists);
    },
    showDeleteListConfirmationBox: (
      state,
      action: { type: string; payload: SubredditLists }
    ) => {
      state.modifyListMode = ModifySubredditListMode.DELETE;
      state.showModifyListBox = true;
      state.modifyListBoxTitle = `Are you sure you want to delete list with name "${action.payload.listName}"?`;
      state.updatingListUuid = action.payload.subredditListUuid;
    },
    deleteList: (state) => {
      state.subredditLists = state.subredditLists.filter(
        (list) => list.subredditListUuid != state.updatingListUuid
      );
      saveSubredditLists(state.subredditLists);
      resetModifyListBoxFields(state);
    },
    resetSubredditListsLoaded: (state) => {
      state.subredditListsLoaded = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSubredditLists.fulfilled, (state, action) => {
        state.subredditLists = action.payload;
        state.subredditListsLoaded = true;
      })
      .addCase(loadSubredditLists.rejected, (state) => {
        state.subredditLists = [];
        state.subredditListsLoaded = true;
      })
      .addCase(selectRandomLists.fulfilled, (state, action) => {
        const subredditUuidsToSelect = action.payload as string[];
        state.subredditLists.forEach((list) => {
          list.selected = subredditUuidsToSelect.includes(
            list.subredditListUuid
          );
        });
        saveSubredditLists(state.subredditLists);
      });
  },
});

export const {
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
  resetSubredditListsLoaded,
} = redditListsSlice.actions;
export default redditListsSlice.reducer;
