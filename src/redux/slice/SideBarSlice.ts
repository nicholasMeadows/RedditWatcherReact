import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { SIDE_BAR_SUBREDDIT_LIST_FILTER_NOT_SELECTED } from "../../RedditWatcherConstants";
import { Subreddit } from "../../model/Subreddit/Subreddit";
import { SubredditLists } from "../../model/SubredditList/SubredditLists";
import store from "../store";

type SideBarUpdateFieldsObj = {
  subredditsToShowInSideBar: Array<Subreddit>;
  listsToShowInDropDown: Array<SubredditLists>;
  listToFilterByUuid: string;
  subredditsToShow: Array<Subreddit>;
  searchInput: string;
};
export const setSubredditsToShowInSideBar = createAsyncThunk(
  "sideBar/setSubredditsToShowInSideBar",
  async (subreddits: Array<Subreddit>) => {
    const state = store.getState();
    const subredditLists = state.subredditLists.subredditLists;
    const listToFilterByUuid = state.sideBar.listToFilterByUuid;
    const searchInput = state.sideBar.searchInput;
    return filterSubredditsToShow(
      subredditLists,
      subreddits,
      listToFilterByUuid,
      searchInput
    );
  }
);
export const setListToFilterByUuid = createAsyncThunk(
  "sideBar/setListToFilterByUuid",
  async (listUuid: string) => {
    const state = store.getState();
    const subredditLists = state.subredditLists.subredditLists;
    const subredditsToShowInSideBar = state.sideBar.subredditsToShowInSideBar;
    const searchInput = state.sideBar.searchInput;
    return filterSubredditsToShow(
      subredditLists,
      subredditsToShowInSideBar,
      listUuid,
      searchInput
    );
  }
);
export const setSearchInput = createAsyncThunk(
  "sideBar/setSearchInput",
  async (searchInput: string) => {
    const state = store.getState();
    const subredditLists = state.subredditLists.subredditLists;
    const subredditsToShowInSideBar = state.sideBar.subredditsToShowInSideBar;
    const listToFilterByUuid = state.sideBar.listToFilterByUuid;
    return filterSubredditsToShow(
      subredditLists,
      subredditsToShowInSideBar,
      listToFilterByUuid,
      searchInput
    );
  }
);
export const subredditListsUpdated = createAsyncThunk(
  "sideBar/subredditListsUpdated",
  async () => {
    const state = store.getState();
    const subredditLists = state.subredditLists.subredditLists;
    const subredditsToShowInSideBar = state.sideBar.subredditsToShowInSideBar;
    const listToFilterByUuid = state.sideBar.listToFilterByUuid;
    const searchInput = state.sideBar.searchInput;
    return filterSubredditsToShow(
      subredditLists,
      subredditsToShowInSideBar,
      listToFilterByUuid,
      searchInput
    );
  }
);

const filterSubredditsToShow = (
  allSubredditLists: Array<SubredditLists>,
  subredditsToShowInSideBar: Array<Subreddit>,
  listToFilterByUuid: string,
  searchInput: string
): SideBarUpdateFieldsObj => {
  let subredditsToShow = subredditsToShowInSideBar;
  if (searchInput != "") {
    subredditsToShow = subredditsToShow.filter((subreddit) =>
      subreddit.displayName.toLowerCase().includes(searchInput.toLowerCase())
    );
  }

  const subredditListsToShowInDropDown = new Array<SubredditLists>();
  for (const list of allSubredditLists) {
    for (const subreddit of subredditsToShow) {
      const found = list.subreddits.find(
        (subredditFromList) =>
          subredditFromList.subredditUuid == subreddit.subredditUuid
      );
      if (found != undefined) {
        subredditListsToShowInDropDown.push(list);
        break;
      }
    }
  }

  const foundList = subredditListsToShowInDropDown.find(
    (list) => list.subredditListUuid == listToFilterByUuid
  );
  let listToFilterByUuidToSet: string;
  if (foundList == undefined) {
    listToFilterByUuidToSet = SIDE_BAR_SUBREDDIT_LIST_FILTER_NOT_SELECTED;
  } else {
    listToFilterByUuidToSet = listToFilterByUuid;
    subredditsToShow = subredditsToShow.filter((subreddit) => {
      const index = foundList.subreddits.findIndex(
        (subredditFromList) =>
          subredditFromList.subredditUuid == subreddit.subredditUuid
      );
      return index >= 0;
    });
  }

  return {
    subredditsToShowInSideBar: subredditsToShowInSideBar,
    listsToShowInDropDown: subredditListsToShowInDropDown,
    listToFilterByUuid: listToFilterByUuidToSet,
    subredditsToShow: subredditsToShow,
    searchInput: searchInput,
  };
};

type InitialState = {
  subredditsToShowInSideBar: Array<Subreddit>;
  subredditsToShow: Array<Subreddit>;
  mostRecentSubredditGotten: Subreddit | undefined;
  availableSubredditListsForFilter: Array<SubredditLists>;
  listToFilterByUuid: string;
  searchInput: string;
  sideBarOpen: boolean;
  sideBarButtonMoved: boolean;
  mouseDownOnOpenSidebarButton: boolean;
  openSidebarButtonTopPercent: number;
  mouseOverSubredditList: boolean;
};

const state: InitialState = {
  subredditsToShowInSideBar: new Array<Subreddit>(),
  subredditsToShow: new Array<Subreddit>(),
  mostRecentSubredditGotten: undefined,
  availableSubredditListsForFilter: new Array<SubredditLists>(),
  listToFilterByUuid: SIDE_BAR_SUBREDDIT_LIST_FILTER_NOT_SELECTED,
  searchInput: "",
  sideBarOpen: false,
  sideBarButtonMoved: false,
  mouseDownOnOpenSidebarButton: false,
  openSidebarButtonTopPercent: 50,
  mouseOverSubredditList: false,
};

const applySideBarFieldsToState = (
  state: InitialState,
  updatedFields: SideBarUpdateFieldsObj
) => {
  state.listToFilterByUuid = updatedFields.listToFilterByUuid;
  state.availableSubredditListsForFilter = updatedFields.listsToShowInDropDown;
  state.searchInput = updatedFields.searchInput;
  state.subredditsToShow = updatedFields.subredditsToShow;
  state.subredditsToShowInSideBar = updatedFields.subredditsToShowInSideBar;
};

export const sideBarSlice = createSlice({
  name: "sideBar",
  initialState: state,
  reducers: {
    setMostRecentSubredditGotten: (state, action) => {
      state.mostRecentSubredditGotten = action.payload;
    },
    setSideBarOpen: (
      state: InitialState,
      action: { type: string; payload: boolean }
    ) => {
      state.sideBarOpen = action.payload;
    },
    setSideBarButtonMoved: (
      state: InitialState,
      action: { type: string; payload: boolean }
    ) => {
      state.sideBarButtonMoved = action.payload;
    },
    setMouseDownOnOpenSidebarButton: (
      state: InitialState,
      action: { type: string; payload: boolean }
    ) => {
      state.mouseDownOnOpenSidebarButton = action.payload;
    },
    setOpenSidebarButtonTopPercent: (
      state: InitialState,
      action: { type: string; payload: number }
    ) => {
      state.openSidebarButtonTopPercent = action.payload;
    },
    setMouseOverSubredditList: (
      state: InitialState,
      action: { type: string; payload: boolean }
    ) => {
      state.mouseOverSubredditList = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(
        setSubredditsToShowInSideBar.fulfilled,
        (state, action: { type: string; payload: SideBarUpdateFieldsObj }) => {
          applySideBarFieldsToState(state, action.payload);
        }
      )
      .addCase(
        setListToFilterByUuid.fulfilled,
        (state, action: { type: string; payload: SideBarUpdateFieldsObj }) => {
          applySideBarFieldsToState(state, action.payload);
        }
      )
      .addCase(
        setSearchInput.fulfilled,
        (state, action: { type: string; payload: SideBarUpdateFieldsObj }) => {
          applySideBarFieldsToState(state, action.payload);
        }
      )
      .addCase(
        subredditListsUpdated.fulfilled,
        (state, action: { type: string; payload: SideBarUpdateFieldsObj }) => {
          applySideBarFieldsToState(state, action.payload);
        }
      );
  },
});

export const {
  setMostRecentSubredditGotten,
  setSideBarOpen,
  setSideBarButtonMoved,
  setMouseDownOnOpenSidebarButton,
  setOpenSidebarButtonTopPercent,
  setMouseOverSubredditList,
} = sideBarSlice.actions;
export default sideBarSlice.reducer;
