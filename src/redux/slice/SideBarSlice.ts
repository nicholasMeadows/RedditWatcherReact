import { createSlice } from "@reduxjs/toolkit";
import { Subreddit } from "../../model/Subreddit/Subreddit.ts";
import { SubredditLists } from "../../model/SubredditList/SubredditLists.ts";
import { SIDE_BAR_SUBREDDIT_LIST_FILTER_NOT_SELECTED } from "../../RedditWatcherConstants.ts";

export type SideBarState = {
  subredditsToShowInSideBar: Array<Subreddit>;
  subredditsToShow: Array<Subreddit>;
  mostRecentSubredditGotten: Subreddit | undefined;
  availableSubredditListsForFilter: Array<SubredditLists>;
  listToFilterByUuid: string;
  searchInput: string;
  sideBarOpen: boolean;
  openSidebarButtonTopPercent: number;
  mouseOverSubredditList: boolean;
};

const initialState: SideBarState = {
  subredditsToShowInSideBar: new Array<Subreddit>(),
  subredditsToShow: new Array<Subreddit>(),
  mostRecentSubredditGotten: undefined,
  availableSubredditListsForFilter: new Array<SubredditLists>(),
  listToFilterByUuid: SIDE_BAR_SUBREDDIT_LIST_FILTER_NOT_SELECTED,
  searchInput: "",
  sideBarOpen: false,
  openSidebarButtonTopPercent: 50,
  mouseOverSubredditList: false,
};
type SideBarUpdateFieldsObj = {
  subredditsToShowInSideBar: Array<Subreddit>;
  listsToShowInDropDown: Array<SubredditLists>;
  listToFilterByUuid: string;
  subredditsToShow: Array<Subreddit>;
  searchInput: string;
};
const filterSubredditsToShow = (
  allSubredditLists: Array<SubredditLists>,
  subredditsToShowInSideBar: Array<Subreddit>,
  listToFilterByUuid: string,
  searchInput: string
): SideBarUpdateFieldsObj => {
  if (searchInput != "") {
    subredditsToShowInSideBar = subredditsToShowInSideBar.filter((subreddit) =>
      subreddit.displayName.toLowerCase().includes(searchInput.toLowerCase())
    );
  }

  const subredditListsToShowInDropDown = new Array<SubredditLists>();
  for (const list of allSubredditLists) {
    for (const subreddit of subredditsToShowInSideBar) {
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
    subredditsToShowInSideBar = subredditsToShowInSideBar.filter(
      (subreddit) => {
        const index = foundList.subreddits.findIndex(
          (subredditFromList) =>
            subredditFromList.subredditUuid == subreddit.subredditUuid
        );
        return index >= 0;
      }
    );
  }

  return {
    subredditsToShowInSideBar: subredditsToShowInSideBar,
    listsToShowInDropDown: subredditListsToShowInDropDown,
    listToFilterByUuid: listToFilterByUuidToSet,
    subredditsToShow: subredditsToShowInSideBar,
    searchInput: searchInput,
  };
};

const applySideBarFields = (
  state: SideBarState,
  updatedFields: SideBarUpdateFieldsObj
) => {
  state.listToFilterByUuid = updatedFields.listToFilterByUuid;
  state.availableSubredditListsForFilter = updatedFields.listsToShowInDropDown;
  state.searchInput = updatedFields.searchInput;
  state.subredditsToShow = updatedFields.subredditsToShow;
  state.subredditsToShowInSideBar = updatedFields.subredditsToShowInSideBar;
};
export const sideBarSlice = createSlice({
  name: "sideBarSlice",
  initialState: initialState,
  reducers: {
    setSubredditsToShowInSideBar: (
      state,
      action: {
        type: string;
        payload: {
          subreddits: Array<Subreddit>;
          subredditLists: Array<SubredditLists>;
        };
      }
    ) => {
      const subredditLists = action.payload.subredditLists;
      const subreddits = action.payload.subreddits;
      const listToFilterByUuid = state.listToFilterByUuid;
      const searchInput = state.searchInput;
      const filtered = filterSubredditsToShow(
        subredditLists,
        subreddits,
        listToFilterByUuid,
        searchInput
      );
      applySideBarFields(state, filtered);
    },
    setListToFilterByUuid: (
      state,
      action: {
        type: string;
        payload: {
          listUuid: string;
          subredditLists: Array<SubredditLists>;
        };
      }
    ) => {
      const subredditLists = action.payload.subredditLists;
      const listUuid = action.payload.listUuid;
      const subredditsToShowInSideBar = state.subredditsToShowInSideBar;
      const searchInput = state.searchInput;
      const filtered = filterSubredditsToShow(
        subredditLists,
        subredditsToShowInSideBar,
        listUuid,
        searchInput
      );
      applySideBarFields(state, filtered);
    },
    setSearchInput: (
      state,
      action: {
        type: string;
        payload: {
          searchInput: string;
          subredditLists: Array<SubredditLists>;
        };
      }
    ) => {
      const searchInput = action.payload.searchInput;
      const subredditLists = action.payload.subredditLists;
      const subredditsToShowInSideBar = state.subredditsToShowInSideBar;
      const listToFilterByUuid = state.listToFilterByUuid;
      const filtered = filterSubredditsToShow(
        subredditLists,
        subredditsToShowInSideBar,
        listToFilterByUuid,
        searchInput
      );
      applySideBarFields(state, filtered);
    },
    subredditListsUpdated: (
      state,
      action: { type: string; payload: Array<SubredditLists> }
    ) => {
      const subredditLists = action.payload;
      const subredditsToShowInSideBar = state.subredditsToShowInSideBar;
      const listToFilterByUuid = state.listToFilterByUuid;
      const searchInput = state.searchInput;
      const filtered = filterSubredditsToShow(
        subredditLists,
        subredditsToShowInSideBar,
        listToFilterByUuid,
        searchInput
      );
      applySideBarFields(state, filtered);
    },
    setMouseOverSubredditList: (
      state,
      action: { type: string; payload: boolean }
    ) => {
      state.mouseOverSubredditList = action.payload;
    },
    setOpenSidebarButtonTopPercent: (
      state,
      action: { type: string; payload: number }
    ) => {
      state.openSidebarButtonTopPercent = action.payload;
    },
    setMostRecentSubredditGotten: (
      state,
      action: { type: string; payload: Subreddit | undefined }
    ) => {
      state.mostRecentSubredditGotten = action.payload;
    },
  },
});

export const {
  setSubredditsToShowInSideBar,
  setListToFilterByUuid,
  setSearchInput,
  subredditListsUpdated,
  setMouseOverSubredditList,
  setOpenSidebarButtonTopPercent,
  setMostRecentSubredditGotten,
} = sideBarSlice.actions;
export default sideBarSlice.reducer;
