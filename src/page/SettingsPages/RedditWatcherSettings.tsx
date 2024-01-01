import {useEffect, useState} from "react";
import ContentFilteringOptionEnum from "../../model/config/enums/ContentFilteringOptionEnum";
import PostRowScrollOptionsEnum from "../../model/config/enums/PostRowScrollOptionsEnum";
import RandomIterationSelectWeightOptionsEnum from "../../model/config/enums/RandomIterationSelectWeightOptionsEnum";
import RowIncrementOptionsEnum from "../../model/config/enums/RowIncrementOptionsEnum";
import SelectSubredditIterationMethodOptionsEnum
    from "../../model/config/enums/SelectSubredditIterationMethodOptionsEnum";
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
    setSelectedSubredditListSortOption,
    setSelectSubredditIterationMethodOption,
    setSelectSubredditListMenuSortOption,
    setSortOrderDirectionOption,
    setSubredditSortOrderOption,
    validateConcateRedditUrlLength,
    validatePostRowsToShowInView,
    validatePostsToShowInRow,
} from "../../redux/slice/AppConfigSlice";
import {useAppDispatch, useAppSelector} from "../../redux/store";
import {checkPlatformForSubredditSortOrderOption} from "../../util/PlatformUtil";

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
    const stateConcatRedditUrlMaxLength = useAppSelector(
        (state) => state.appConfig.concatRedditUrlMaxLength
    );
    const [localConcatRedditUrlMaxLength, setLocalConcatRedditUrlMaxLength] =
        useState(stateConcatRedditUrlMaxLength);

    const concatRedditUrlMaxLengthValidationError = useAppSelector(
        (state) => state.appConfig.concatRedditUrlMaxLengthValidationError
    );
    const contentFiltering = useAppSelector(
        (state) => state.appConfig.contentFiltering
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
            <hr/>
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
                            <option
                                hidden={!checkPlatformForSubredditSortOrderOption(key[1])}
                                key={key[0]}
                                value={key[1]}
                            >
                                {key[1]}
                            </option>
                        );
                    })}
                </select>
            </div>
            <hr/>
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
            <hr/>
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
            <hr/>
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
            <hr/>
            <div className="settings-item">
                <label className="select-label">Random Iteration Weight</label>
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
            <hr/>
            <div className="settings-item">
                <label className="select-label">Select Subreddit List Menu Sort</label>
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
            <hr/>
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
            <hr/>
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
            <hr/>
            <div className="settings-item">
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
            <hr/>
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
            <hr/>
            <div className="settings-item">
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
            <hr/>
            <div className="settings-item">
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
            <hr/>
        </div>
    );
};

export default RedditWatcherSettings;
