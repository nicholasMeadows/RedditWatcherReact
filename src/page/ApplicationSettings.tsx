import { AutoScrollPostRowOptionEnum } from "../model/config/enums/AutoScrollPostRowOptionEnum.ts";
import { AutoScrollPostRowDirectionOptionEnum } from "../model/config/enums/AutoScrollPostRowDirectionOptionEnum.ts";
import RandomIterationSelectWeightOptionsEnum from "../model/config/enums/RandomIterationSelectWeightOptionsEnum.ts";
import SelectSubredditListMenuSortOptionEnum from "../model/config/enums/SelectSubredditListMenuSortOptionEnum.ts";
import SortOrderDirectionOptionsEnum from "../model/config/enums/SortOrderDirectionOptionsEnum.ts";
import SelectSubredditIterationMethodOptionsEnum from "../model/config/enums/SelectSubredditIterationMethodOptionsEnum.ts";
import { useContext } from "react";
import {
  AppConfigDispatchContext,
  AppConfigStateContext,
} from "../context/app-config-context.ts";
import { AppConfigActionType } from "../reducer/app-config-reducer.ts";

const ApplicationSettings: React.FC = () => {
  const appConfigDispatch = useContext(AppConfigDispatchContext);
  const autoScrollPostRowOption = useContext(
    AppConfigStateContext
  ).autoScrollPostRowOption;
  const autoScrollPostRowOptionDirection = useContext(
    AppConfigStateContext
  ).autoScrollPostRowDirectionOption;
  const autoScrollPostRowRateSecondsForSinglePostCard = useContext(
    AppConfigStateContext
  ).autoScrollPostRowRateSecondsForSinglePostCard;
  const autoScrollPostRowRateSecondsForSinglePostCardValidationError =
    useContext(
      AppConfigStateContext
    ).autoScrollPostRowRateSecondsForSinglePostCardValidationError;
  const randomIterationSelectWeightOption = useContext(
    AppConfigStateContext
  ).randomIterationSelectWeightOption;
  const selectSubredditListMenuSortOption = useContext(
    AppConfigStateContext
  ).selectSubredditListMenuSortOption;
  const sortOrderDirectionOption = useContext(
    AppConfigStateContext
  ).sortOrderDirectionOption;
  const selectSubredditIterationMethodOption = useContext(
    AppConfigStateContext
  ).selectSubredditIterationMethodOption;
  const concatRedditUrlMaxLength = useContext(
    AppConfigStateContext
  ).concatRedditUrlMaxLength;
  const concatRedditUrlMaxLengthValidationError = useContext(
    AppConfigStateContext
  ).concatRedditUrlMaxLengthValidationError;
  const postsToShowInRow = useContext(AppConfigStateContext).postsToShowInRow;
  const postsToShowInRowValidationError = useContext(
    AppConfigStateContext
  ).postsToShowInRowValidationError;
  const postRowsToShowInView = useContext(
    AppConfigStateContext
  ).postRowsToShowInView;
  const postRowsToShowInViewValidationError = useContext(
    AppConfigStateContext
  ).postRowsToShowInViewValidationError;

  return (
    <div className="reddit-watcher-settings">
      <hr />
      <div className="settings-item flex-column">
        <label className="select-label">
          Random SubReddit Selection Iteration Weight
        </label>
        <select
          value={randomIterationSelectWeightOption}
          onChange={(event) =>
            appConfigDispatch({
              type: AppConfigActionType.SET_RANDOM_ITERATION_SELECT_WEIGHT_OPTION,
              payload: event.target
                .value as RandomIterationSelectWeightOptionsEnum,
            })
          }
          className="select"
        >
          {Object.entries(RandomIterationSelectWeightOptionsEnum).map((key) => {
            return (
              <option key={key[0]} value={key[1]}>
                {key[1]}
              </option>
            );
          })}
        </select>
      </div>
      <hr />
      <div className="settings-item flex-column">
        <label className="select-label">
          Side Bar Select Subreddit List Menu Sort By
        </label>
        <select
          value={selectSubredditListMenuSortOption}
          onChange={(event) =>
            appConfigDispatch({
              type: AppConfigActionType.SET_SELECT_SUBREDDIT_LIST_MENU_SORT_OPTION,
              payload: event.target
                .value as SelectSubredditListMenuSortOptionEnum,
            })
          }
          className="select"
        >
          {Object.entries(SelectSubredditListMenuSortOptionEnum).map((key) => {
            return (
              <option key={key[0]} value={key[1]}>
                {key[1]}
              </option>
            );
          })}
        </select>
      </div>
      <hr />
      <div className="settings-item flex-column">
        <label className="select-label">Sort order</label>
        <select
          value={sortOrderDirectionOption}
          onChange={(event) =>
            appConfigDispatch({
              type: AppConfigActionType.SET_SORT_ORDER_DIRECTION_OPTION,
              payload: event.target.value as SortOrderDirectionOptionsEnum,
            })
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
      <hr />
      <div className="settings-item flex-column">
        <label className="select-label">Subreddit Iteration method</label>
        <select
          value={selectSubredditIterationMethodOption}
          onChange={(event) =>
            appConfigDispatch({
              type: AppConfigActionType.SET_SELECT_SUBREDDIT_ITERATION_METHOD_OPTION,
              payload: event.target
                .value as SelectSubredditIterationMethodOptionsEnum,
            })
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
      <hr />
      <div className="settings-item flex-column">
        <label className="select-label">Auto Scroll Post Row</label>
        <select
          value={autoScrollPostRowOption}
          onChange={(event) =>
            appConfigDispatch({
              type: AppConfigActionType.SET_AUTO_SCROLL_POST_ROW_OPTION,
              payload: event.target.value as AutoScrollPostRowOptionEnum,
            })
          }
          className="select"
        >
          {Object.entries(AutoScrollPostRowOptionEnum).map((key) => {
            return (
              <option key={key[0]} value={key[1]}>
                {key[1]}
              </option>
            );
          })}
        </select>
      </div>

      <hr />
      <div className="settings-item flex-column">
        <label className="select-label">Auto Scroll Post Row Direction</label>
        <select
          value={autoScrollPostRowOptionDirection}
          onChange={(event) =>
            appConfigDispatch({
              type: AppConfigActionType.SET_AUTO_SCROLL_POST_ROW_DIRECTION_OPTION,
              payload: event.target
                .value as AutoScrollPostRowDirectionOptionEnum,
            })
          }
          className="select"
        >
          {Object.entries(AutoScrollPostRowDirectionOptionEnum).map((key) => {
            return (
              <option key={key[0]} value={key[1]}>
                {key[1]}
              </option>
            );
          })}
        </select>
      </div>

      <hr />
      <div className="settings-item flex-column">
        <label className="select-label">
          Auto Scroll Post Rows Rate (Seconds to move single post card)
        </label>
        <input
          value={autoScrollPostRowRateSecondsForSinglePostCard}
          className="input"
          type="number"
          onChange={(event) => {
            const inputValue = parseFloat(event.target.value);
            appConfigDispatch({
              type: AppConfigActionType.SET_AUTO_SCROLL_POST_ROW_RATE_SECONDS_FOR_SINGLE_POST_CARD,
              payload: inputValue,
            });
          }}
          onBlur={() => {
            appConfigDispatch({
              type: AppConfigActionType.CLEAR_AUTO_SCROLL_POST_ROW_RATE_SECONDS_FOR_SINGLE_POST_CARD_VALIDATION_ERROR,
            });
          }}
        />
        <p className="settings-item-error">
          {autoScrollPostRowRateSecondsForSinglePostCardValidationError}
        </p>
      </div>

      <hr />
      <div className="settings-item flex-column">
        <label className="select-label">Reddit URL Max Length</label>
        <input
          value={concatRedditUrlMaxLength}
          className="input"
          type="number"
          onChange={(event) => {
            const inputValue = parseInt(event.target.value);
            appConfigDispatch({
              type: AppConfigActionType.SET_CONCAT_REDDIT_URL_MAX_LENGTH,
              payload: inputValue,
            });
          }}
          onBlur={() => {
            appConfigDispatch({
              type: AppConfigActionType.CLEAR_CONCAT_REDDIT_URL_MAX_LENGTH_VALIDATION_ERROR,
            });
          }}
        />
        <p className="settings-item-error">
          {concatRedditUrlMaxLengthValidationError}
        </p>
      </div>

      <hr />
      <div className="settings-item flex-column">
        <label className="select-label">Posts to Show In Row</label>
        <input
          value={postsToShowInRow}
          className="input"
          type="number"
          onChange={(event) => {
            const inputValue = parseFloat(event.target.value);
            appConfigDispatch({
              type: AppConfigActionType.SET_POSTS_TO_SHOW_IN_ROW,
              payload: inputValue,
            });
          }}
          onBlur={() => {
            appConfigDispatch({
              type: AppConfigActionType.CLEAR_POSTS_TO_SHOW_IN_ROW_VALIDATION_ERROR,
            });
          }}
        />
        <p className="settings-item-error">{postsToShowInRowValidationError}</p>
      </div>
      <hr />
      <div className="settings-item flex-column">
        <label className="select-label">Post Rows to Show In View</label>
        <input
          value={postRowsToShowInView}
          className="input"
          type="number"
          onChange={(event) => {
            const inputValue = parseFloat(event.target.value);
            appConfigDispatch({
              type: AppConfigActionType.SET_POST_ROWS_TO_SHOW_IN_VIEW,
              payload: inputValue,
            });
          }}
          onBlur={() => {
            appConfigDispatch({
              type: AppConfigActionType.CLEAR_POST_ROWS_TO_SHOW_IN_VIEW_VALIDATION_ERROR,
            });
          }}
        />
        <p className="settings-item-error">
          {postRowsToShowInViewValidationError}
        </p>
      </div>
      <hr />
    </div>
  );
};

export default ApplicationSettings;
