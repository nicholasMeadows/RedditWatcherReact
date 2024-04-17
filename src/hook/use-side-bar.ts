import { useContext } from "react";
import { SideBarContext } from "../context/side-bar-context.ts";
import { Subreddit } from "../model/Subreddit/Subreddit.ts";
import store from "../redux/store.ts";
import { SubredditLists } from "../model/SubredditList/SubredditLists.ts";
import { SIDE_BAR_SUBREDDIT_LIST_FILTER_NOT_SELECTED } from "../RedditWatcherConstants.ts";

export type UseSideBar = {
  setSubredditsToShowInSideBar: (subreddits: Array<Subreddit>) => void;
  setListToFilterByUuid: (listUuid: string) => void;
  setSearchInput: (searchInput: string) => void;
  subredditListsUpdated: () => void;

  decreaseTimeTillNextGetPostsSeconds: () => void;
  setTimeTillNextGetPostsSeconds: (timeTillNextGetPostsSeconds: number) => void;
  setMouseOverSubredditList: (mouseOverSubredditList: boolean) => void;
  setOpenSidebarButtonTopPercent: (openSidebarButtonTopPercent: number) => void;
  setMostRecentSubredditGotten: (
    mostRecentSubredditGotten: Subreddit | undefined
  ) => void;
};

type SideBarUpdateFieldsObj = {
  subredditsToShowInSideBar: Array<Subreddit>;
  listsToShowInDropDown: Array<SubredditLists>;
  listToFilterByUuid: string;
  subredditsToShow: Array<Subreddit>;
  searchInput: string;
};

export default function useSideBar(): UseSideBar {
  const { sidebarContextData, setSidebarContextData } =
    useContext(SideBarContext);

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

  const applySideBarFields = (updatedFields: SideBarUpdateFieldsObj) => {
    setSidebarContextData((state) => ({
      ...state,
      listToFilterByUuid: updatedFields.listToFilterByUuid,
      availableSubredditListsForFilter: updatedFields.listsToShowInDropDown,
      searchInput: updatedFields.searchInput,
      subredditsToShow: updatedFields.subredditsToShow,
      subredditsToShowInSideBar: updatedFields.subredditsToShowInSideBar,
    }));
  };

  const setSubredditsToShowInSideBar = async (subreddits: Array<Subreddit>) => {
    const state = store.getState();
    const subredditLists = state.subredditLists.subredditLists;
    const listToFilterByUuid = sidebarContextData.listToFilterByUuid;
    const searchInput = sidebarContextData.searchInput;
    const filtered = filterSubredditsToShow(
      subredditLists,
      subreddits,
      listToFilterByUuid,
      searchInput
    );
    applySideBarFields(filtered);
  };

  const setListToFilterByUuid = async (listUuid: string) => {
    const state = store.getState();
    const subredditLists = state.subredditLists.subredditLists;
    const subredditsToShowInSideBar =
      sidebarContextData.subredditsToShowInSideBar;
    const searchInput = sidebarContextData.searchInput;
    const filtered = filterSubredditsToShow(
      subredditLists,
      subredditsToShowInSideBar,
      listUuid,
      searchInput
    );
    applySideBarFields(filtered);
  };
  const setSearchInput = async (searchInput: string) => {
    const state = store.getState();
    const subredditLists = state.subredditLists.subredditLists;
    const subredditsToShowInSideBar =
      sidebarContextData.subredditsToShowInSideBar;
    const listToFilterByUuid = sidebarContextData.listToFilterByUuid;
    const filtered = filterSubredditsToShow(
      subredditLists,
      subredditsToShowInSideBar,
      listToFilterByUuid,
      searchInput
    );
    applySideBarFields(filtered);
  };
  const subredditListsUpdated = async () => {
    const state = store.getState();
    const subredditLists = state.subredditLists.subredditLists;
    const subredditsToShowInSideBar =
      sidebarContextData.subredditsToShowInSideBar;
    const listToFilterByUuid = sidebarContextData.listToFilterByUuid;
    const searchInput = sidebarContextData.searchInput;
    const filtered = filterSubredditsToShow(
      subredditLists,
      subredditsToShowInSideBar,
      listToFilterByUuid,
      searchInput
    );
    applySideBarFields(filtered);
  };

  const decreaseTimeTillNextGetPostsSeconds = () => {
    if (sidebarContextData.timeTillNextGetPostsSeconds > 0) {
      setSidebarContextData((state) => {
        return {
          ...state,
          timeTillNextGetPostsSeconds: state.timeTillNextGetPostsSeconds - 1,
        };
      });
    }
  };
  const setTimeTillNextGetPostsSeconds = (
    timeTillNextGetPostsSeconds: number
  ) => {
    if (timeTillNextGetPostsSeconds >= 0) {
      setSidebarContextData((state) => {
        return {
          ...state,
          timeTillNextGetPostsSeconds: timeTillNextGetPostsSeconds,
        };
      });
    }
  };

  const setMouseOverSubredditList = (mouseOverSubredditList: boolean) => {
    setSidebarContextData((state) => {
      return { ...state, mouseOverSubredditList: mouseOverSubredditList };
    });
  };
  const setOpenSidebarButtonTopPercent = (
    openSidebarButtonTopPercent: number
  ) => {
    setSidebarContextData((state) => {
      return {
        ...state,
        openSidebarButtonTopPercent: openSidebarButtonTopPercent,
      };
    });
  };

  const setMostRecentSubredditGotten = (
    mostRecentSubredditGotten: Subreddit | undefined
  ) => {
    setSidebarContextData((state) => ({
      ...state,
      mostRecentSubredditGotten: mostRecentSubredditGotten,
    }));
  };
  return {
    setSubredditsToShowInSideBar: setSubredditsToShowInSideBar,
    setListToFilterByUuid: setListToFilterByUuid,
    setSearchInput: setSearchInput,
    subredditListsUpdated: subredditListsUpdated,
    decreaseTimeTillNextGetPostsSeconds: decreaseTimeTillNextGetPostsSeconds,
    setTimeTillNextGetPostsSeconds: setTimeTillNextGetPostsSeconds,
    setMouseOverSubredditList: setMouseOverSubredditList,
    setOpenSidebarButtonTopPercent: setOpenSidebarButtonTopPercent,
    setMostRecentSubredditGotten: setMostRecentSubredditGotten,
  };
}
