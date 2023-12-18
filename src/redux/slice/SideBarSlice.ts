import { createSlice } from "@reduxjs/toolkit";
import { SIDE_BAR_SUBREDDIT_LIST_FILTER_NOT_SELECTED } from "../../RedditWatcherConstants";
import { Subreddit } from "../../model/Subreddit/Subreddit";
import { SubredditLists } from "../../model/SubredditList/SubredditLists";

type InitialState = {
  subredditsToShowInSideBar: Array<Subreddit>;
  subredditsToShow: Array<Subreddit>;
  mostRecentSubredditGotten: Subreddit | undefined;
  availableSubredditListsForFilter: Array<SubredditLists>;
  listToFilterByUuid: string;
  sideBarOpen: boolean;
  sideBarButtonMoved: boolean;
  mouseDownOnOpenSidebarButton: boolean;
  openSidebarButtonTopPercent: number;
};

const state: InitialState = {
  subredditsToShowInSideBar: new Array<Subreddit>(),
  subredditsToShow: new Array<Subreddit>(),
  mostRecentSubredditGotten: undefined,
  availableSubredditListsForFilter: new Array<SubredditLists>(),
  listToFilterByUuid: SIDE_BAR_SUBREDDIT_LIST_FILTER_NOT_SELECTED,
  sideBarOpen: false,
  sideBarButtonMoved: false,
  mouseDownOnOpenSidebarButton: false,
  openSidebarButtonTopPercent: 50,
};

const getAvailableSubredditListsForFilter = (
  availableLists: Array<SubredditLists>,
  subredditsToShowInSideBar: Array<Subreddit>
) => {
  const subredditLists = new Array<SubredditLists>();
  for (const list of availableLists) {
    for (const subreddit of subredditsToShowInSideBar) {
      const found = list.subreddits.find(
        (subredditFromList) =>
          subredditFromList.subredditUuid == subreddit.subredditUuid
      );
      if (found != undefined) {
        subredditLists.push(list);
        break;
      }
    }
  }
  return subredditLists;
};
const updateSideBarValues = (
  state: InitialState,
  masterSubreddits: Array<Subreddit>,
  subredditLists: Array<SubredditLists>,
  listToFilterByUuid: string
) => {
  state.availableSubredditListsForFilter = getAvailableSubredditListsForFilter(
    subredditLists,
    masterSubreddits
  );

  const foundList = subredditLists.find(
    (list) => list.subredditListUuid == listToFilterByUuid
  );
  if (foundList == undefined) {
    state.listToFilterByUuid = SIDE_BAR_SUBREDDIT_LIST_FILTER_NOT_SELECTED;
    state.subredditsToShow = masterSubreddits;
  } else {
    state.subredditsToShow = masterSubreddits.filter((subreddit) => {
      const index = foundList.subreddits.findIndex(
        (subredditFromList) =>
          subredditFromList.subredditUuid == subreddit.subredditUuid
      );
      return index >= 0;
    });
  }
};

export const sideBarSlice = createSlice({
  name: "sideBar",
  initialState: state,
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
      state.subredditsToShowInSideBar = action.payload.subreddits;
      updateSideBarValues(
        state,
        action.payload.subreddits,
        action.payload.subredditLists,
        state.listToFilterByUuid
      );
    },
    setMostRecentSubredditGotten: (state, action) => {
      state.mostRecentSubredditGotten = action.payload;
    },
    setListToFilterByUuid: (
      state: InitialState,
      action: {
        type: string;
        payload: { listUuid: string; subredditLists: Array<SubredditLists> };
      }
    ) => {
      state.listToFilterByUuid = action.payload.listUuid;
      updateSideBarValues(
        state,
        state.subredditsToShowInSideBar,
        action.payload.subredditLists,
        action.payload.listUuid
      );
    },
    subredditListsUpdated: (
      state: InitialState,
      action: { type: string; payload: Array<SubredditLists> }
    ) => {
      updateSideBarValues(
        state,
        state.subredditsToShowInSideBar,
        action.payload,
        state.listToFilterByUuid
      );
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
  },
});

export const {
  setSubredditsToShowInSideBar,
  setMostRecentSubredditGotten,
  subredditListsUpdated,
  setSideBarOpen,
  setSideBarButtonMoved,
  setMouseDownOnOpenSidebarButton,
  setOpenSidebarButtonTopPercent,
  setListToFilterByUuid,
} = sideBarSlice.actions;
export default sideBarSlice.reducer;
