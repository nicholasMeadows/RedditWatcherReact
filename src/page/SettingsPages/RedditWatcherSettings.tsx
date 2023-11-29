// import { useAppDispatch, useAppSelector } from "../../redux/store";
// import {
//   setConcatRedditUrlMaxLength,
//   setContentFiltering,
//   setPostRowScrollOption,
//   setPostRowsToShowInView,
//   setPostsToShowInRow,
//   setRandomIterationSelectWeightOption,
//   setRowIncrementOption,
//   setSelectSubredditIterationMethodOption,
//   setSelectSubredditListMenuSortOption,
//   setSelectedSubredditListSortOption,
//   setSortOrderDirectionOption,
//   setSubredditSortOrderOption,
// } from "../../redux/slice/AppConfigSlice";
// import SubredditSortOrderOptionsEnum from "../../model/config/enums/SubredditSortOrderOptionsEnum";
// import RowIncrementOptionsEnum from "../../model/config/enums/RowIncrementOptionsEnum";
// import PostRowScrollOptionsEnum from "../../model/config/enums/PostRowScrollOptionsEnum";
// import SelectedSubredditListSortOptionEnum from "../../model/config/enums/SelectedSubredditListSortOptionEnum";
// import RandomIterationSelectWeightOptionsEnum from "../../model/config/enums/RandomIterationSelectWeightOptionsEnum";
// import SelectSubredditListMenuSortOptionEnum from "../../model/config/enums/SelectSubredditListMenuSortOptionEnum";
// import SortOrderDirectionOptionsEnum from "../../model/config/enums/SortOrderDirectionOptionsEnum";
// import SelectSubredditIterationMethodOptionsEnum from "../../model/config/enums/SelectSubredditIterationMethodOptionsEnum";
// import ContentFilteringOptionEnum from "../../model/config/enums/ContentFilteringOptionEnum";

import ContentFilteringOptionEnum from "../../model/config/enums/ContentFilteringOptionEnum";
import PostRowScrollOptionsEnum from "../../model/config/enums/PostRowScrollOptionsEnum";
import RandomIterationSelectWeightOptionsEnum from "../../model/config/enums/RandomIterationSelectWeightOptionsEnum";
import RowIncrementOptionsEnum from "../../model/config/enums/RowIncrementOptionsEnum";
import SelectSubredditIterationMethodOptionsEnum from "../../model/config/enums/SelectSubredditIterationMethodOptionsEnum";
import SelectSubredditListMenuSortOptionEnum from "../../model/config/enums/SelectSubredditListMenuSortOptionEnum";
import SelectedSubredditListSortOptionEnum from "../../model/config/enums/SelectedSubredditListSortOptionEnum";
import SortOrderDirectionOptionsEnum from "../../model/config/enums/SortOrderDirectionOptionsEnum";
import SubredditSortOrderOptionsEnum from "../../model/config/enums/SubredditSortOrderOptionsEnum";
import {
  setConcatRedditUrlMaxLength,
  setContentFiltering,
  setPostRowScrollOption,
  setPostRowsToShowInView,
  setPostsToShowInRow,
  setRandomIterationSelectWeightOption,
  setRowIncrementOption,
  setSelectSubredditIterationMethodOption,
  setSelectSubredditListMenuSortOption,
  setSelectedSubredditListSortOption,
  setSortOrderDirectionOption,
  setSubredditSortOrderOption,
} from "../../redux/slice/AppConfigSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";

const RedditWatcherSettings: React.FC = () => {
  const dispatch = useAppDispatch();

  const subredditSortOrderOption = useAppSelector(
    (state) => state.appConfig.subredditSortOrderOption
  );
  const rowIncrementOption = useAppSelector(
    (state) => state.appConfig.rowIncrementOption
  );
  const postRowScrollOption = useAppSelector(
    (state) => state.appConfig.postRowScrollOption
  );
  const selectedSubredditListSortOption = useAppSelector(
    (state) => state.appConfig.selectedSubredditListSortOption
  );
  const randomIterationSelectWeightOption = useAppSelector(
    (state) => state.appConfig.randomIterationSelectWeightOption
  );
  const selectSubredditListMenuSortOption = useAppSelector(
    (state) => state.appConfig.selectSubredditListMenuSortOption
  );
  const sortOrderDirectionOption = useAppSelector(
    (state) => state.appConfig.sortOrderDirectionOption
  );
  const selectSubredditIterationMethodOption = useAppSelector(
    (state) => state.appConfig.selectSubredditIterationMethodOption
  );
  const concatRedditUrlMaxLength = useAppSelector(
    (state) => state.appConfig.concatRedditUrlMaxLength
  );
  const concatRedditUrlMaxLengthValidationError = useAppSelector(
    (state) => state.appConfig.concatRedditUrlMaxLengthValidationError
  );
  const contentFiltering = useAppSelector(
    (state) => state.appConfig.contentFiltering
  );
  const postsToShowInRow = useAppSelector(
    (state) => state.appConfig.postsToShowInRow
  );
  const postsToShowInRowValidationError = useAppSelector(
    (state) => state.appConfig.postsToShowInRowValidationError
  );
  const postRowsToShowInView = useAppSelector(
    (state) => state.appConfig.postRowsToShowInView
  );
  const postRowsToShowInViewValidationError = useAppSelector(
    (state) => state.appConfig.postRowsToShowInViewValidationError
  );

  return (
    <>
      <div className="reddit-watcher-settings-ion-content">
        <div className="settings-item">
          <label className="select-label">Subreddit Sort</label>
          <select
            value={subredditSortOrderOption}
            onChange={(event) =>
              dispatch(setSubredditSortOrderOption(event.target.value))
            }
            className="select"
          >
            {Object.entries(SubredditSortOrderOptionsEnum).map((key) => {
              return (
                <option key={key[0]} value={key[1]}>
                  {key[1]}
                </option>
              );
            })}
          </select>
        </div>
        <div className="settings-item">
          <label className="select-label">Row Increment</label>
          <select
            value={rowIncrementOption}
            onChange={(event) =>
              dispatch(setRowIncrementOption(event.target.value))
            }
            className="select"
          >
            {Object.entries(RowIncrementOptionsEnum).map((key) => {
              return (
                <option key={key[0]} value={key[1]}>
                  {key[1]}
                </option>
              );
            })}
          </select>
        </div>
        <div className="settings-item">
          <label className="select-label">Post Row Scroll</label>
          <select
            value={postRowScrollOption}
            onChange={(event) =>
              dispatch(setPostRowScrollOption(event.target.value))
            }
            className="select"
          >
            {Object.entries(PostRowScrollOptionsEnum).map((key) => {
              return (
                <option key={key[0]} value={key[1]}>
                  {key[1]}
                </option>
              );
            })}
          </select>
        </div>
        <div className="settings-item">
          <label className="select-label">Subreddit list Sort</label>
          <select
            value={selectedSubredditListSortOption}
            onChange={(event) =>
              dispatch(setSelectedSubredditListSortOption(event.target.value))
            }
            className="select"
          >
            {Object.entries(SelectedSubredditListSortOptionEnum).map((key) => {
              return (
                <option key={key[0]} value={key[1]}>
                  {key[1]}
                </option>
              );
            })}
          </select>
        </div>
        <div className="settings-item">
          <label className="select-label">Random Iteration Weight</label>
          <select
            value={randomIterationSelectWeightOption}
            onChange={(event) =>
              dispatch(setRandomIterationSelectWeightOption(event.target.value))
            }
            className="select"
          >
            {Object.entries(RandomIterationSelectWeightOptionsEnum).map(
              (key) => {
                return (
                  <option key={key[0]} value={key[1]}>
                    {key[1]}
                  </option>
                );
              }
            )}
          </select>
        </div>
        <div className="settings-item">
          <label className="select-label">
            Select Subreddit List Menu Sort
          </label>
          <select
            value={selectSubredditListMenuSortOption}
            onChange={(event) =>
              dispatch(setSelectSubredditListMenuSortOption(event.target.value))
            }
            className="select"
          >
            {Object.entries(SelectSubredditListMenuSortOptionEnum).map(
              (key) => {
                return (
                  <option key={key[0]} value={key[1]}>
                    {key[1]}
                  </option>
                );
              }
            )}
          </select>
        </div>
        <div className="settings-item">
          <label className="select-label">Sort order Direction</label>
          <select
            value={sortOrderDirectionOption}
            onChange={(event) =>
              dispatch(setSortOrderDirectionOption(event.target.value))
            }
            className="select"
          >
            {Object.entries(SortOrderDirectionOptionsEnum).map((key) => {
              return (
                <option key={key[0]} value={key[1]}>
                  {key[1]}
                </option>
              );
            })}
          </select>
        </div>
        <div className="settings-item">
          <label className="select-label">
            Select Subreddit Iteration method
          </label>
          <select
            value={selectSubredditIterationMethodOption}
            onChange={(event) =>
              dispatch(
                setSelectSubredditIterationMethodOption(event.target.value)
              )
            }
            className="select"
          >
            {Object.entries(SelectSubredditIterationMethodOptionsEnum).map(
              (key) => {
                return (
                  <option key={key[0]} value={key[1]}>
                    {key[1]}
                  </option>
                );
              }
            )}
          </select>
        </div>
        <div className="settings-item">
          <label className="select-label">Reddit URL Max Length</label>
          <input
            value={concatRedditUrlMaxLength}
            className="input"
            type="number"
            onChange={(event) =>
              dispatch(setConcatRedditUrlMaxLength(event.target.value))
            }
          />
          <p className="settings-item-error">
            {concatRedditUrlMaxLengthValidationError}
          </p>
        </div>

        <div className="settings-item">
          <label className="select-label">Content Filtering</label>
          <select
            value={contentFiltering}
            onChange={(event) =>
              dispatch(setContentFiltering(event.target.value))
            }
            className="select"
          >
            {Object.entries(ContentFilteringOptionEnum).map((key) => {
              return (
                <option key={key[0]} value={key[1]}>
                  {key[1]}
                </option>
              );
            })}
          </select>
        </div>
        <div className="settings-item">
          <label className="select-label">Posts to Show In Row</label>
          <input
            value={postsToShowInRow}
            className="input"
            type="number"
            onChange={(event) =>
              dispatch(setPostsToShowInRow(event.target.value))
            }
          />
          <p className="settings-item-error">
            {postsToShowInRowValidationError}
          </p>
        </div>
        <div className="settings-item">
          <label className="select-label">Post Rows to Show In View</label>
          <input
            value={postRowsToShowInView}
            className="input"
            type="number"
            onChange={(event) =>
              dispatch(setPostRowsToShowInView(event.target.value))
            }
          />
          <p className="settings-item-error">
            {postRowsToShowInViewValidationError}
          </p>
        </div>
      </div>
    </>
  );
};

export default RedditWatcherSettings;
