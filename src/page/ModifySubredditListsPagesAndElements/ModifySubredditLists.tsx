import { useAppDispatch, useAppSelector } from "../../redux/store";
import {
  createOrModifyList,
  deleteList,
  deselectAllLists,
  resetModifyListBox,
  selectAllLists,
  selectRandomLists,
  setCreateUpdateInputValue,
  showCreateListBox,
} from "../../redux/slice/RedditListsSlice";
import SearchRedditBar from "./SearchRedditBar";
import { useEffect, useState } from "react";
import ModifySubredditListAccordian from "./ModifySubredditListAccordion";
import { ModifySubredditListMode } from "../../model/ModifySubredditListMode";

const ModifySubredditLists: React.FC = () => {
  const dispatch = useAppDispatch();
  const subredditLists = useAppSelector(
    (state) => state.subredditLists.subredditLists
  );
  const searchResults = useAppSelector(
    (state) => state.redditSearch.searchResults
  );

  const showModifyListBox = useAppSelector(
    (state) => state.subredditLists.showModifyListBox
  );
  const modifyListBoxTitle = useAppSelector(
    (state) => state.subredditLists.modifyListBoxTitle
  );
  const modifyListMode = useAppSelector(
    (state) => state.subredditLists.modifyListMode
  );
  const createUpdateInputValue = useAppSelector(
    (state) => state.subredditLists.createUpdateInputValue
  );
  const createUpdateInputValidationError = useAppSelector(
    (state) => state.subredditLists.createUpdateInputValidationError
  );
  const createUpdateButtonText = useAppSelector(
    (state) => state.subredditLists.createUpdateButtonText
  );

  useEffect(() => {
    dispatch(resetModifyListBox());
  });

  const [subredditListUuidClicked, setSubredditListUuidClicked] = useState<
    string | undefined
  >(undefined);
  return (
    <>
      {showModifyListBox && (
        <div className="create-update-list-grayed-out-background">
          <div className="modify-list-box">
            <h4 className="modify-list-header">{modifyListBoxTitle}</h4>

            {(modifyListMode == ModifySubredditListMode.CREATE ||
              modifyListMode == ModifySubredditListMode.UPDATE) && (
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
                  value={createUpdateInputValue}
                />
                <p className="create-update-list-input-error">
                  {createUpdateInputValidationError}
                </p>
                <div className="flex flex-row">
                  <button
                    disabled={
                      createUpdateInputValue.length == 0 ||
                      createUpdateInputValidationError != ""
                    }
                    onClick={() => dispatch(createOrModifyList())}
                  >
                    {createUpdateButtonText}
                  </button>
                  <button onClick={() => dispatch(resetModifyListBox())}>
                    Cancel
                  </button>
                </div>
              </>
            )}
            {modifyListMode == ModifySubredditListMode.DELETE && (
              <>
                <div className="flex flex-row">
                  <button onClick={() => dispatch(deleteList())}>Yes</button>
                  <button onClick={() => dispatch(resetModifyListBox())}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="modify-subreddit-list-root background">
        <div
          style={{ zIndex: "10" }}
          className={
            "reddit-search-bar-wrapper" +
            (searchResults.length > 0
              ? " reddit-search-bar-wrapper-expanded"
              : "")
          }
        >
          <SearchRedditBar />
        </div>

        <div className="max-width-height-percentage flex flex-column">
          <div className="subredditListsExpander">
            {subredditLists.map((subredditList) => (
              <ModifySubredditListAccordian
                key={subredditList.subredditListUuid}
                subredditList={subredditList}
                subredditListUuidClicked={subredditListUuidClicked}
                accordionOnClick={() => {
                  if (
                    subredditList.subredditListUuid == subredditListUuidClicked
                  ) {
                    setSubredditListUuidClicked(undefined);
                  } else {
                    setSubredditListUuidClicked(
                      subredditList.subredditListUuid
                    );
                  }
                }}
              />
            ))}
          </div>

          <div className="flex flex-wrap button-box">
            <div className="flex flex-column flex-grow">
              <button
                className="flex-grow"
                onClick={() => dispatch(showCreateListBox())}
              >
                Create new List
              </button>
              <button
                className="flex-grow"
                onClick={() => dispatch(selectAllLists(undefined))}
              >
                Select All Lists
              </button>
            </div>
            <div className="flex flex-column flex-grow">
              <button
                className="flex-grow"
                onClick={() => dispatch(deselectAllLists(undefined))}
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
      </div>
    </>
  );
};

export default ModifySubredditLists;
