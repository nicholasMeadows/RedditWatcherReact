import { useContext } from "react";
import { SideBarContext } from "../context/side-bar-context.ts";
import { Subreddit } from "../model/Subreddit/Subreddit.ts";
import { SubredditLists } from "../model/SubredditList/SubredditLists.ts";
import { SIDE_BAR_SUBREDDIT_LIST_FILTER_NOT_SELECTED } from "../RedditWatcherConstants.ts";

export type UseSideBar = {
  setSubredditsToShowInSideBar: (
    subreddits: Array<Subreddit>,
    subredditLists: Array<SubredditLists>
  ) => void;
  setListToFilterByUuid: (
    listUuid: string,
    subredditLists: Array<SubredditLists>
  ) => void;
  setSearchInput: (
    searchInput: string,
    subredditLists: Array<SubredditLists>
  ) => void;
  subredditListsUpdated: (subredditLists: Array<SubredditLists>) => void;

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
    if (searchInput != "") {
      subredditsToShowInSideBar = subredditsToShowInSideBar.filter(
        (subreddit) =>
          subreddit.displayName
            .toLowerCase()
            .includes(searchInput.toLowerCase())
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
  return {
    setSubredditsToShowInSideBar: (
      subreddits: Array<Subreddit>,
      subredditLists: Array<SubredditLists>
    ) => {
      const listToFilterByUuid = sidebarContextData.listToFilterByUuid;
      const searchInput = sidebarContextData.searchInput;
      const filtered = filterSubredditsToShow(
        subredditLists,
        subreddits,
        listToFilterByUuid,
        searchInput
      );
      applySideBarFields(filtered);
    },

    setListToFilterByUuid: async (
      listUuid: string,
      subredditLists: Array<SubredditLists>
    ) => {
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
    },
    setSearchInput: (
      searchInput: string,
      subredditLists: Array<SubredditLists>
    ) => {
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
    },
    subredditListsUpdated: (subredditLists: Array<SubredditLists>) => {
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
    },

    decreaseTimeTillNextGetPostsSeconds: () => {
      if (sidebarContextData.timeTillNextGetPostsSeconds > 0) {
        setSidebarContextData((state) => {
          return {
            ...state,
            timeTillNextGetPostsSeconds: state.timeTillNextGetPostsSeconds - 1,
          };
        });
      }
    },
    setTimeTillNextGetPostsSeconds: (timeTillNextGetPostsSeconds: number) => {
      if (timeTillNextGetPostsSeconds >= 0) {
        setSidebarContextData((state) => {
          return {
            ...state,
            timeTillNextGetPostsSeconds: timeTillNextGetPostsSeconds,
          };
        });
      }
    },

    setMouseOverSubredditList: (mouseOverSubredditList: boolean) => {
      setSidebarContextData((state) => {
        return { ...state, mouseOverSubredditList: mouseOverSubredditList };
      });
    },
    setOpenSidebarButtonTopPercent: (openSidebarButtonTopPercent: number) => {
      setSidebarContextData((state) => {
        return {
          ...state,
          openSidebarButtonTopPercent: openSidebarButtonTopPercent,
        };
      });
    },

    setMostRecentSubredditGotten: (
      mostRecentSubredditGotten: Subreddit | undefined
    ) => {
      setSidebarContextData((state) => ({
        ...state,
        mostRecentSubredditGotten: mostRecentSubredditGotten,
      }));
    },
  };
}
