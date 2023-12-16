import { useEffect, useState } from "react";
import { NAVIGATION_HAMBURGER_TOOLBAR_HEIGHT } from "../../RedditWatcherConstants";
import { ModifySubredditListMode } from "../../model/ModifySubredditListMode";
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
import { useAppDispatch, useAppSelector } from "../../redux/store";
import ModifySubredditListAccordion from "./ModifySubredditListAccordion";
import SearchRedditBar from "./SearchRedditBar";

const ModifySubredditLists: React.FC = () => {
  const dispatch = useAppDispatch();
  const subredditLists = useAppSelector(
    (state) => state.subredditLists.subredditLists
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
  }, [dispatch]);

  const [subredditListUuidClicked, setSubredditListUuidClicked] = useState<
    string | undefined
  >(undefined);
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
                <div className="flex flex-row create-update-button-box">
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
          {subredditLists.map((subredditList) => (
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
              onClick={() => dispatch(selectAllLists(undefined))}
            >
              Select All Lists
            </button>
          </div>
          <div className="modify-subreddit-list-button-box flex flex-column flex-grow">
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
    </>
  );
};

export default ModifySubredditLists;
