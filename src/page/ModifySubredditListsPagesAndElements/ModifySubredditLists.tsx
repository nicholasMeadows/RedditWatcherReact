import { useEffect, useState } from "react";
import { NAVIGATION_HAMBURGER_TOOLBAR_HEIGHT } from "../../RedditWatcherConstants";
import { ModifySubredditListMode } from "../../model/ModifySubredditListMode";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import ModifySubredditListAccordion from "./ModifySubredditListAccordion";
import SearchRedditBar from "./SearchRedditBar";
import SelectSubredditListMenuSortOptionEnum from "../../model/config/enums/SelectSubredditListMenuSortOptionEnum.ts";
import { SubredditLists } from "../../model/SubredditList/SubredditLists.ts";
import SortOrderDirectionOptionsEnum from "../../model/config/enums/SortOrderDirectionOptionsEnum.ts";
import {
  createOrModifyList,
  deleteList,
  deselectAllLists,
  resetModifyListBox,
  selectAllLists,
  selectRandomLists,
  setCreateUpdateInputValue,
  showCreateListBox,
} from "../../redux/slice/RedditListSlice.ts";

const ModifySubredditLists: React.FC = () => {
  const dispatch = useAppDispatch();
  const redditListsState = useAppSelector((state) => state.redditLists);
  const selectSubredditListMenuSortOption = useAppSelector(
    (state) => state.appConfig.selectSubredditListMenuSortOption
  );
  const sortOrderDirection = useAppSelector(
    (state) => state.appConfig.sortOrderDirectionOption
  );
  const [sortedSubredditLists, setSortedSubredditLists] = useState<
    Array<SubredditLists>
  >([]);
  useEffect(() => {
    dispatch(resetModifyListBox());
  }, []);

  useEffect(() => {
    if (
      selectSubredditListMenuSortOption ===
      SelectSubredditListMenuSortOptionEnum.Alphabetically
    ) {
      const sorted = [...redditListsState.subredditLists].sort(
        (list1, list2) => {
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
        }
      );
      setSortedSubredditLists(sorted);
    } else if (
      selectSubredditListMenuSortOption ==
      SelectSubredditListMenuSortOptionEnum.ListSize
    ) {
      const sorted = [...redditListsState.subredditLists].sort(
        (list1, list2) => {
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
        }
      );
      setSortedSubredditLists(sorted);
    }
  }, [
    redditListsState.subredditLists,
    selectSubredditListMenuSortOption,
    sortOrderDirection,
  ]);

  const [subredditListUuidClicked, setSubredditListUuidClicked] = useState<
    string | undefined
  >(undefined);
  return (
    <>
      {redditListsState.showModifyListBox && (
        <>
          <div className="create-update-list-grayed-out-background"></div>
          <div className="modify-list-box">
            <h4 className="modify-list-header">
              {redditListsState.modifyListBoxTitle}
            </h4>

            {(redditListsState.modifyListMode ==
              ModifySubredditListMode.CREATE ||
              redditListsState.modifyListMode ==
                ModifySubredditListMode.UPDATE) && (
              <>
                <input
                  type="text"
                  className="search-input"
                  onChange={(event) =>
                    dispatch(
                      setCreateUpdateInputValue(
                        (event.target as HTMLInputElement).value
                      )
                    )
                  }
                  value={redditListsState.createUpdateInputValue}
                />
                <p className="create-update-list-input-error">
                  {redditListsState.createUpdateInputValidationError}
                </p>
                <div className="flex flex-row create-update-button-box">
                  <button
                    disabled={
                      redditListsState.createUpdateInputValue.length == 0 ||
                      redditListsState.createUpdateInputValidationError != ""
                    }
                    onClick={() => dispatch(createOrModifyList())}
                  >
                    {redditListsState.createUpdateButtonText}
                  </button>
                  <button onClick={() => dispatch(resetModifyListBox())}>
                    Cancel
                  </button>
                </div>
              </>
            )}
            {redditListsState.modifyListMode ==
              ModifySubredditListMode.DELETE && (
              <>
                <div className="flex flex-row create-update-button-box">
                  <button onClick={() => dispatch(deleteList())}>Yes</button>
                  <button onClick={() => dispatch(resetModifyListBox())}>
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
        <SearchRedditBar />
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
              onClick={() => dispatch(showCreateListBox())}
            >
              Create new List
            </button>
            <button
              className="flex-grow"
              onClick={() => dispatch(selectAllLists())}
            >
              Select All Lists
            </button>
          </div>
          <div className="modify-subreddit-list-button-box flex flex-column flex-grow">
            <button
              className="flex-grow"
              onClick={() => dispatch(deselectAllLists())}
            >
              Deselect All Lists
            </button>
            <button
              className="flex-grow"
              onClick={() => dispatch(selectRandomLists())}
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
