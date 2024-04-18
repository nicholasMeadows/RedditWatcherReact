import { useContext, useEffect, useState } from "react";
import { NAVIGATION_HAMBURGER_TOOLBAR_HEIGHT } from "../../RedditWatcherConstants";
import { ModifySubredditListMode } from "../../model/ModifySubredditListMode";
import { useAppSelector } from "../../redux/store";
import ModifySubredditListAccordion from "./ModifySubredditListAccordion";
import SearchRedditBar from "./SearchRedditBar";
import SelectSubredditListMenuSortOptionEnum from "../../model/config/enums/SelectSubredditListMenuSortOptionEnum.ts";
import { SubredditLists } from "../../model/SubredditList/SubredditLists.ts";
import SortOrderDirectionOptionsEnum from "../../model/config/enums/SortOrderDirectionOptionsEnum.ts";
import { RedditListContext } from "../../context/reddit-list-context.ts";
import useRedditList from "../../hook/use-reddit-list.ts";

const ModifySubredditLists: React.FC = () => {
  const redditListsHook = useRedditList();
  const { redditListContextData } = useContext(RedditListContext);

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
    redditListsHook.resetModifyListBox();
  }, []);

  useEffect(() => {
    if (
      selectSubredditListMenuSortOption ===
      SelectSubredditListMenuSortOptionEnum.Alphabetically
    ) {
      const sorted = [...redditListContextData.subredditLists].sort(
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
      const sorted = [...redditListContextData.subredditLists].sort(
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
    redditListContextData.subredditLists,
    selectSubredditListMenuSortOption,
    sortOrderDirection,
  ]);

  const [subredditListUuidClicked, setSubredditListUuidClicked] = useState<
    string | undefined
  >(undefined);
  return (
    <>
      {redditListContextData.showModifyListBox && (
        <>
          <div className="create-update-list-grayed-out-background"></div>
          <div className="modify-list-box">
            <h4 className="modify-list-header">
              {redditListContextData.modifyListBoxTitle}
            </h4>

            {(redditListContextData.modifyListMode ==
              ModifySubredditListMode.CREATE ||
              redditListContextData.modifyListMode ==
                ModifySubredditListMode.UPDATE) && (
              <>
                <input
                  type="text"
                  className="search-input"
                  onChange={(event) =>
                    redditListsHook.setCreateUpdateInputValue(
                      (event.target as HTMLInputElement).value
                    )
                  }
                  value={redditListContextData.createUpdateInputValue}
                />
                <p className="create-update-list-input-error">
                  {redditListContextData.createUpdateInputValidationError}
                </p>
                <div className="flex flex-row create-update-button-box">
                  <button
                    disabled={
                      redditListContextData.createUpdateInputValue.length ==
                        0 ||
                      redditListContextData.createUpdateInputValidationError !=
                        ""
                    }
                    onClick={() => redditListsHook.createOrModifyList()}
                  >
                    {redditListContextData.createUpdateButtonText}
                  </button>
                  <button onClick={() => redditListsHook.resetModifyListBox()}>
                    Cancel
                  </button>
                </div>
              </>
            )}
            {redditListContextData.modifyListMode ==
              ModifySubredditListMode.DELETE && (
              <>
                <div className="flex flex-row create-update-button-box">
                  <button onClick={() => redditListsHook.deleteList()}>
                    Yes
                  </button>
                  <button onClick={() => redditListsHook.resetModifyListBox()}>
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
              onClick={() => redditListsHook.showCreateListBox()}
            >
              Create new List
            </button>
            <button
              className="flex-grow"
              onClick={() => redditListsHook.selectAllLists()}
            >
              Select All Lists
            </button>
          </div>
          <div className="modify-subreddit-list-button-box flex flex-column flex-grow">
            <button
              className="flex-grow"
              onClick={() => redditListsHook.deselectAllLists()}
            >
              Deselect All Lists
            </button>
            <button
              className="flex-grow"
              onClick={() => redditListsHook.selectRandomLists()}
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
