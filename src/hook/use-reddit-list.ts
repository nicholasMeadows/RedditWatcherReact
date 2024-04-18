import { useContext } from "react";
import RedditListContextData, {
  RedditListContext,
} from "../context/reddit-list-context.ts";
import { saveSubredditLists } from "../service/ConfigService.ts";
import { SubredditLists } from "../model/SubredditList/SubredditLists.ts";
import { ModifySubredditListMode } from "../model/ModifySubredditListMode.ts";
import { v4 as uuidV4 } from "uuid";
import { Subreddit } from "../model/Subreddit/Subreddit.ts";

export type UseRedditList = {
  selectRandomLists: () => void;
  toggleSubredditListSelected: (subredditListToToggle: SubredditLists) => void;
  selectAllLists: () => void;
  deselectAllLists: () => void;
  showCreateListBox: () => void;
  showUpdateListBox: (subredditList: SubredditLists) => void;
  resetModifyListBox: () => void;
  setCreateUpdateInputValue: (createUpdateInputValue: string) => void;
  createOrModifyList: () => void;
  addSubredditToList: (
    subredditListItemToAdd: Subreddit,
    subredditListToAddTo: SubredditLists
  ) => void;
  removeSubredditFromList: (
    subredditListItemToRemove: Subreddit,
    removeFromList: SubredditLists
  ) => void;
  showDeleteListConfirmationBox: (subredditList: SubredditLists) => void;
  deleteList: () => void;
  setSubredditLists: (subredditLists: SubredditLists[]) => void;
  getSubredditListsContextData: () => RedditListContextData;
};
export default function useRedditList(): UseRedditList {
  const { redditListContextData, setRedditListContextData } =
    useContext(RedditListContext);

  const resetModifyListBoxFields = () => {
    setRedditListContextData((state) => ({
      ...state,
      modifyListMode: undefined,
      showModifyListBox: false,
      modifyListBoxTitle: "",
      createUpdateInputValue: "",
      createUpdateInputValidationError: "",
      createUpdateButtonText: "",
      updatingListUuid: undefined,
    }));
  };
  const findListWithSameName = (name: string) => {
    return redditListContextData.subredditLists.find((subredditList) => {
      return subredditList.listName.toLowerCase() == name.toLowerCase();
    });
  };
  return {
    selectRandomLists: async () => {
      const subredditLists = redditListContextData.subredditLists;
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

      setRedditListContextData((state) => ({
        ...state,
        subredditLists: subredditLists,
      }));
    },
    toggleSubredditListSelected: (subredditListToToggle: SubredditLists) => {
      const subredditLists = redditListContextData.subredditLists;
      const foundSubredditList = subredditLists.find(
        (subredditList) =>
          subredditList.subredditListUuid ===
          subredditListToToggle.subredditListUuid
      );
      if (foundSubredditList != undefined) {
        foundSubredditList.selected = !foundSubredditList.selected;
        saveSubredditLists(subredditLists);
        setRedditListContextData((state) => ({
          ...state,
          subredditLists: subredditLists,
        }));
      }
    },
    selectAllLists: () => {
      const subredditLists = redditListContextData.subredditLists;
      subredditLists.forEach((subredditList) => {
        subredditList.selected = true;
      });
      saveSubredditLists(subredditLists);
      setRedditListContextData((state) => ({
        ...state,
        subredditLists: subredditLists,
      }));
    },
    deselectAllLists: () => {
      const subredditLists = redditListContextData.subredditLists;
      subredditLists.forEach((subredditList) => {
        subredditList.selected = false;
      });
      saveSubredditLists(subredditLists);
      setRedditListContextData((state) => ({
        ...state,
        subredditLists: subredditLists,
      }));
    },
    showCreateListBox: () => {
      setRedditListContextData((state) => ({
        ...state,
        modifyListMode: ModifySubredditListMode.CREATE,
        showModifyListBox: true,
        modifyListBoxTitle: "Create New List",
        createUpdateInputValidationError: "",
        createUpdateButtonText: "Create",
      }));
    },
    showUpdateListBox: (subredditList: SubredditLists) => {
      setRedditListContextData((state) => ({
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
      }));
    },
    resetModifyListBox: () => {
      resetModifyListBoxFields();
    },
    setCreateUpdateInputValue: (createUpdateInputValue: string) => {
      const foundListWithSameName = findListWithSameName(
        createUpdateInputValue
      );
      setRedditListContextData((state) => ({
        ...state,
        createUpdateInputValidationError:
          foundListWithSameName === undefined ? "" : "List name already exists",
      }));
    },
    createOrModifyList: () => {
      const subredditLists = redditListContextData.subredditLists;
      if (
        redditListContextData.modifyListMode == ModifySubredditListMode.CREATE
      ) {
        subredditLists.push({
          subredditListUuid: uuidV4(),
          listName: redditListContextData.createUpdateInputValue,
          subreddits: [],
          selected: true,
        });
      } else if (
        redditListContextData.modifyListMode == ModifySubredditListMode.UPDATE
      ) {
        const foundList = subredditLists.find(
          (list) =>
            list.subredditListUuid == redditListContextData.updatingListUuid
        );
        if (foundList != undefined) {
          foundList.listName = redditListContextData.createUpdateInputValue;
        }
      }
      saveSubredditLists(subredditLists);
      resetModifyListBoxFields();
      setRedditListContextData((state) => ({
        ...state,
        subredditLists: subredditLists,
      }));
    },
    addSubredditToList: (
      subredditListItemToAdd: Subreddit,
      subredditListToAddTo: SubredditLists
    ) => {
      const subredditLists = redditListContextData.subredditLists;
      const foundList = subredditLists.find(
        (list) =>
          list.subredditListUuid == subredditListToAddTo.subredditListUuid
      );
      if (foundList != undefined) {
        foundList.subreddits.push(subredditListItemToAdd);
        saveSubredditLists(subredditLists);
        setRedditListContextData((state) => ({
          ...state,
          subredditLists: subredditLists,
        }));
      }
    },
    removeSubredditFromList: (
      subredditListItemToRemove: Subreddit,
      removeFromList: SubredditLists
    ) => {
      const subredditLists = redditListContextData.subredditLists;
      const foundList = subredditLists.find(
        (list) => list.subredditListUuid == removeFromList.subredditListUuid
      );
      if (foundList != undefined) {
        foundList.subreddits = foundList.subreddits.filter(
          (subreddit) =>
            subreddit.displayName.toLowerCase() !=
            subredditListItemToRemove.displayName.toLowerCase()
        );
        saveSubredditLists(subredditLists);
        setRedditListContextData((state) => ({
          ...state,
          subredditLists: subredditLists,
        }));
      }
    },
    showDeleteListConfirmationBox: (subredditList: SubredditLists) => {
      setRedditListContextData((state) => ({
        ...state,
        modifyListMode: ModifySubredditListMode.DELETE,
        showModifyListBox: true,
        modifyListBoxTitle: `Are you sure you want to delete list with name "${subredditList.listName}"?`,
        updatingListUuid: subredditList.subredditListUuid,
      }));
    },
    deleteList: () => {
      const updatedLists = redditListContextData.subredditLists.filter(
        (list) =>
          list.subredditListUuid != redditListContextData.updatingListUuid
      );
      saveSubredditLists(updatedLists);
      resetModifyListBoxFields();
      setRedditListContextData((state) => ({
        ...state,
        subredditLists: updatedLists,
      }));
    },
    setSubredditLists: (subredditLists: SubredditLists[]) => {
      setRedditListContextData((state) => ({
        ...state,
        subredditLists: subredditLists,
      }));
    },
    getSubredditListsContextData: () => {
      return redditListContextData;
    },
  };
}
