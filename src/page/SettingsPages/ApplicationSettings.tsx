import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/store.ts";
import {
  setAutoScrollPostRowDirectionOption,
  setAutoScrollPostRowOption,
  setAutoScrollPostRowRateSecondsForSinglePostCard,
  setConcatRedditUrlMaxLength,
  setPostRowsToShowInView,
  setPostsToShowInRow,
  setRandomIterationSelectWeightOption,
  setSelectSubredditIterationMethodOption,
  setSelectSubredditListMenuSortOption,
  setSortOrderDirectionOption,
  validateAutoScrollPostRowRateSecondsForSinglePostCard,
  validateConcateRedditUrlLength,
  validatePostRowsToShowInView,
  validatePostsToShowInRow,
} from "../../redux/slice/AppConfigSlice.ts";
import { AutoScrollPostRowOptionEnum } from "../../model/config/enums/AutoScrollPostRowOptionEnum.ts";
import { AutoScrollPostRowDirectionOptionEnum } from "../../model/config/enums/AutoScrollPostRowDirectionOptionEnum.ts";
import RandomIterationSelectWeightOptionsEnum from "../../model/config/enums/RandomIterationSelectWeightOptionsEnum.ts";
import SelectSubredditListMenuSortOptionEnum from "../../model/config/enums/SelectSubredditListMenuSortOptionEnum.ts";
import SortOrderDirectionOptionsEnum from "../../model/config/enums/SortOrderDirectionOptionsEnum.ts";
import SelectSubredditIterationMethodOptionsEnum from "../../model/config/enums/SelectSubredditIterationMethodOptionsEnum.ts";

const ApplicationSettings: React.FC = () => {
  const dispatch = useAppDispatch();

  const autoScrollPostRowOption = useAppSelector(
    (state) => state.appConfig.autoScrollPostRowOption
  );
  const autoScrollPostRowOptionDirection = useAppSelector(
    (state) => state.appConfig.autoScrollPostRowDirectionOption
  );

  const autoScrollPostRowRateSecondsForSinglePostCard = useAppSelector(
    (state) => state.appConfig.autoScrollPostRowRateSecondsForSinglePostCard
  );
  const autoScrollPostRowRateSecondsForSinglePostCardValidationError =
    useAppSelector(
      (state) =>
        state.appConfig
          .autoScrollPostRowRateSecondsForSinglePostCardValidationError
    );
  const [
    localAutoScrollPostRowRateSecondsForSinglePostCard,
    setLocalAutoScrollPostRowRateSecondsForSinglePostCard,
  ] = useState(autoScrollPostRowRateSecondsForSinglePostCard);

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
  const stateConcatRedditUrlMaxLength = useAppSelector(
    (state) => state.appConfig.concatRedditUrlMaxLength
  );
  const [localConcatRedditUrlMaxLength, setLocalConcatRedditUrlMaxLength] =
    useState(stateConcatRedditUrlMaxLength);

  const concatRedditUrlMaxLengthValidationError = useAppSelector(
    (state) => state.appConfig.concatRedditUrlMaxLengthValidationError
  );

  const statePostsToShowInRow = useAppSelector(
    (state) => state.appConfig.postsToShowInRow
  );
  const [localPostsToShowInRow, setLocalPostsToShowInRow] = useState(
    statePostsToShowInRow
  );
  const postsToShowInRowValidationError = useAppSelector(
    (state) => state.appConfig.postsToShowInRowValidationError
  );
  const statePostRowsToShowInView = useAppSelector(
    (state) => state.appConfig.postRowsToShowInView
  );
  const [localPostRowsToShowInView, setLocalPostRowsToShowInView] = useState(
    statePostRowsToShowInView
  );
  const postRowsToShowInViewValidationError = useAppSelector(
    (state) => state.appConfig.postRowsToShowInViewValidationError
  );
  useEffect(() => {
    setLocalConcatRedditUrlMaxLength(stateConcatRedditUrlMaxLength);
  }, [stateConcatRedditUrlMaxLength]);

  useEffect(() => {
    setLocalPostsToShowInRow(statePostsToShowInRow);
  }, [statePostsToShowInRow]);
  useEffect(() => {
    setLocalPostRowsToShowInView(statePostRowsToShowInView);
  }, [statePostRowsToShowInView]);

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
            dispatch(setRandomIterationSelectWeightOption(event.target.value))
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
            dispatch(setSelectSubredditListMenuSortOption(event.target.value))
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
      <hr />
      <div className="settings-item flex-column">
        <label className="select-label">Subreddit Iteration method</label>
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
      <hr />
      <div className="settings-item flex-column">
        <label className="select-label">Auto Scroll Post Row</label>
        <select
          value={autoScrollPostRowOption}
          onChange={(event) =>
            dispatch(setAutoScrollPostRowOption(event.target.value))
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
            dispatch(setAutoScrollPostRowDirectionOption(event.target.value))
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
          value={localAutoScrollPostRowRateSecondsForSinglePostCard}
          className="input"
          type="number"
          onChange={(event) => {
            const inputValue = parseFloat(event.target.value);
            dispatch(
              validateAutoScrollPostRowRateSecondsForSinglePostCard(inputValue)
            );
            setLocalAutoScrollPostRowRateSecondsForSinglePostCard(inputValue);
          }}
          onBlur={(event) => {
            const inputValue = parseFloat(event.target.value);
            dispatch(
              setAutoScrollPostRowRateSecondsForSinglePostCard(inputValue)
            );
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
          value={localConcatRedditUrlMaxLength}
          className="input"
          type="number"
          onChange={(event) => {
            const inputValue = parseInt(event.target.value);
            dispatch(validateConcateRedditUrlLength(inputValue));
            setLocalConcatRedditUrlMaxLength(inputValue);
          }}
          onBlur={(event) => {
            const inputValue = parseInt(event.target.value);
            dispatch(setConcatRedditUrlMaxLength(inputValue));
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
          value={localPostsToShowInRow}
          className="input"
          type="number"
          onChange={(event) => {
            const inputValue = parseFloat(event.target.value);
            dispatch(validatePostsToShowInRow(inputValue));
            setLocalPostsToShowInRow(inputValue);
          }}
          onBlur={(event) => {
            const inputValue = parseFloat(event.target.value);
            dispatch(setPostsToShowInRow(inputValue));
          }}
        />
        <p className="settings-item-error">{postsToShowInRowValidationError}</p>
      </div>
      <hr />
      <div className="settings-item flex-column">
        <label className="select-label">Post Rows to Show In View</label>
        <input
          value={localPostRowsToShowInView}
          className="input"
          type="number"
          onChange={(event) => {
            const inputValue = parseFloat(event.target.value);
            dispatch(validatePostRowsToShowInView(inputValue));
            setLocalPostRowsToShowInView(inputValue);
          }}
          onBlur={(event) => {
            const inputValue = parseFloat(event.target.value);
            dispatch(setPostRowsToShowInView(inputValue));
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
