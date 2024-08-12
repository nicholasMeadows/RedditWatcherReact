import { useContext, useEffect, useState } from "react";
import { NAVIGATION_HAMBURGER_TOOLBAR_HEIGHT } from "../RedditWatcherConstants";
import { ModifySubredditListMode } from "../model/ModifySubredditListMode";
import ModifySubredditListAccordion from "../components/ModifySubredditListAccordion";
import SearchRedditBar from "../components/SearchRedditBar";
import SelectSubredditListMenuSortOptionEnum from "../model/config/enums/SelectSubredditListMenuSortOptionEnum.ts";
import { SubredditLists } from "../model/SubredditList/SubredditLists.ts";
import SortOrderDirectionOptionsEnum from "../model/config/enums/SortOrderDirectionOptionsEnum.ts";
import SearchRedditBarContext from "../context/search-reddit-bar-context.ts";
import useSearchRedditBar from "../hook/use-search-reddit-bar.ts";
import { AppConfigStateContext } from "../context/app-config-context.ts";
import {
  RedditListDispatchContext,
  RedditListStateContext,
} from "../context/reddit-list-context.ts";
import { RedditListActionType } from "../reducer/reddit-list-reducer.ts";

const ModifySubredditLists: React.FC = () => {
  const {
    subredditLists,
    showModifyListBox,
    modifyListMode,
    createUpdateInputValue,
    createUpdateInputValidationError,
    updatingListUuid,
  } = useContext(RedditListStateContext);
  const redditListDispatch = useContext(RedditListDispatchContext);
  const selectSubredditListMenuSortOption = useContext(
    AppConfigStateContext
  ).selectSubredditListMenuSortOption;
  const sortOrderDirection = useContext(
    AppConfigStateContext
  ).sortOrderDirectionOption;
  const [sortedSubredditLists, setSortedSubredditLists] = useState<
    Array<SubredditLists>
  >([]);
  useEffect(() => {
    redditListDispatch({
      type: RedditListActionType.RESET_MODIFY_LIST_BOX,
    });
  }, []);

  useEffect(() => {
    if (
      selectSubredditListMenuSortOption ===
      SelectSubredditListMenuSortOptionEnum.Alphabetically
    ) {
      const sorted = [...subredditLists].sort((list1, list2) => {
        const name1 = list1.listName;
        const name2 = list2.listName;
        let normalSortValue = 0;
        if (name1.toLowerCase() > name2.toLowerCase()) {
          normalSortValue = 1;
        } else if (name1.toLowerCase() < name2.toLowerCase()) {
          normalSortValue = -1;
        }
        if (sortOrderDirection == SortOrderDirectionOptionsEnum.Normal) {
          return normalSortValue;
        } else if (
          sortOrderDirection == SortOrderDirectionOptionsEnum.Reversed
        ) {
          return normalSortValue * -1;
        }
        return 0;
      });
      setSortedSubredditLists(sorted);
    } else if (
      selectSubredditListMenuSortOption ==
      SelectSubredditListMenuSortOptionEnum.ListSize
    ) {
      const sorted = [...subredditLists].sort((list1, list2) => {
        const size1 = list1.subreddits.length;
        const size2 = list2.subreddits.length;
        let normalSortValue = 0;
        if (size1 < size2) {
          normalSortValue = 1;
        } else if (size1 > size2) {
          normalSortValue = -1;
        }
        if (sortOrderDirection == SortOrderDirectionOptionsEnum.Normal) {
          return normalSortValue;
        } else if (
          sortOrderDirection == SortOrderDirectionOptionsEnum.Reversed
        ) {
          return normalSortValue * -1;
        }
        return 0;
      });
      setSortedSubredditLists(sorted);
    }
  }, [subredditLists, selectSubredditListMenuSortOption, sortOrderDirection]);

  const [subredditListUuidClicked, setSubredditListUuidClicked] = useState<
    string | undefined
  >(undefined);

  const searchRedditBarState = useSearchRedditBar();

  let modifyListBoxTitle: string = "";
  let createUpdateButtonText = "";
  switch (modifyListMode) {
    case ModifySubredditListMode.CREATE:
      {
        modifyListBoxTitle = "Create New List";
        createUpdateButtonText = "Create";
      }
      break;
    case ModifySubredditListMode.UPDATE:
      {
        modifyListBoxTitle = "Update List";
        createUpdateButtonText = "Update";
      }
      break;
    case ModifySubredditListMode.DELETE:
      {
        const list = subredditLists.find(
          (list) => list.subredditListUuid === updatingListUuid
        );
        if (list !== undefined) {
          modifyListBoxTitle = `Are you sure you want to delete list with name "${list.listName}"?`;
        }
      }
      break;
  }
  return (
    <>
      {showModifyListBox && (
        <>
          <div className="create-update-list-grayed-out-background"></div>
          <div className="modify-list-box">
            <h4 className="modify-list-header">{modifyListBoxTitle}</h4>

            {(modifyListMode == ModifySubredditListMode.CREATE ||
              modifyListMode == ModifySubredditListMode.UPDATE) && (
              <>
                <input
                  type="text"
                  className="search-input"
                  onChange={(event) =>
                    redditListDispatch({
                      type: RedditListActionType.SET_CREATE_UPDATE_INPUT_VALUE,
                      payload: (event.target as HTMLInputElement).value,
                    })
                  }
                  value={createUpdateInputValue}
                />
                <p className="create-update-list-input-error">
                  {createUpdateInputValidationError}
                </p>
                <div className="flex flex-row create-update-button-box">
                  <button
                    disabled={
                      createUpdateInputValue.length == 0 ||
                      createUpdateInputValidationError != ""
                    }
                    onClick={() =>
                      redditListDispatch({
                        type: RedditListActionType.CREATE_OR_MODIFY_LIST,
                      })
                    }
                  >
                    {createUpdateButtonText}
                  </button>
                  <button
                    onClick={() =>
                      redditListDispatch({
                        type: RedditListActionType.RESET_MODIFY_LIST_BOX,
                      })
                    }
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
            {modifyListMode == ModifySubredditListMode.DELETE && (
              <>
                <div className="flex flex-row create-update-button-box">
                  <button
                    onClick={() =>
                      redditListDispatch({
                        type: RedditListActionType.DELETE_LIST,
                      })
                    }
                  >
                    Yes
                  </button>
                  <button
                    onClick={() =>
                      redditListDispatch({
                        type: RedditListActionType.RESET_MODIFY_LIST_BOX,
                      })
                    }
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}

      <div
        className="max-width-height-percentage flex flex-column"
        style={{
          maxHeight: `calc( 100vh - ${NAVIGATION_HAMBURGER_TOOLBAR_HEIGHT})`,
          position: "relative",
        }}
      >
        <SearchRedditBarContext.Provider value={searchRedditBarState}>
          <SearchRedditBar />
        </SearchRedditBarContext.Provider>
        <div className="subredditListsExpander">
          {sortedSubredditLists.map((subredditList) => (
            <ModifySubredditListAccordion
              key={subredditList.subredditListUuid}
              subredditList={subredditList}
              subredditListUuidClicked={subredditListUuidClicked}
              accordionOnClick={() => {
                if (
                  subredditList.subredditListUuid == subredditListUuidClicked
                ) {
                  setSubredditListUuidClicked(undefined);
                } else {
                  setSubredditListUuidClicked(subredditList.subredditListUuid);
                }
              }}
            />
          ))}
        </div>

        <div className="modify-subreddit-list-button-box flex flex-wrap button-box">
          <div className="modify-subreddit-list-button-box flex flex-column flex-grow">
            <button
              className="flex-grow"
              onClick={() =>
                redditListDispatch({
                  type: RedditListActionType.SHOW_CREATE_LIST_BOX,
                })
              }
            >
              Create new List
            </button>
            <button
              className="flex-grow"
              onClick={() =>
                redditListDispatch({
                  type: RedditListActionType.SELECT_ALL_LISTS,
                })
              }
            >
              Select All Lists
            </button>
          </div>
          <div className="modify-subreddit-list-button-box flex flex-column flex-grow">
            <button
              className="flex-grow"
              onClick={() =>
                redditListDispatch({
                  type: RedditListActionType.DESELECT_ALL_LISTS,
                })
              }
            >
              Deselect All Lists
            </button>
            <button
              className="flex-grow"
              onClick={() =>
                redditListDispatch({
                  type: RedditListActionType.SELECT_RANDOM_LISTS,
                })
              }
            >
              Select Random Lists
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModifySubredditLists;
