import { useAppDispatch, useAppSelector } from "../../redux/store.ts";
import { useEffect, useState } from "react";
import {
  setContentFiltering,
  setPostSortOrderOption,
  setRedditApiItemLimit,
  setSelectedSubredditListSortOption,
  setSubredditSortOrderOption,
  setTopTimeFrameOption,
  setUserFrontPagePostSortOrderOption,
  validateRedditApiItemLimit,
} from "../../redux/slice/AppConfigSlice.ts";
import PostSortOrderOptionsEnum from "../../model/config/enums/PostSortOrderOptionsEnum.ts";
import TopTimeFrameOptionsEnum from "../../model/config/enums/TopTimeFrameOptionsEnum.ts";
import UserFrontPagePostSortOrderOptionsEnum from "../../model/config/enums/UserFrontPagePostSortOrderOptionsEnum.ts";
import SubredditSortOrderOptionsEnum from "../../model/config/enums/SubredditSortOrderOptionsEnum.ts";
import { checkPlatformForSubredditSortOrderOption } from "../../util/PlatformUtil.ts";
import ContentFilteringOptionEnum from "../../model/config/enums/ContentFilteringOptionEnum.ts";
import SelectedSubredditListSortOptionEnum from "../../model/config/enums/SelectedSubredditListSortOptionEnum.ts";

const RedditSourceSettings: React.FC = () => {
  const dispatch = useAppDispatch();
  const subredditSortOrderOption = useAppSelector(
    (state) => state.appConfig.subredditSortOrderOption
  );
  const selectedSubredditListSortOption = useAppSelector(
    (state) => state.appConfig.selectedSubredditListSortOption
  );
  const postSortOrder = useAppSelector(
    (state) => state.appConfig.postSortOrderOption
  );
  const topTimeFrameOption = useAppSelector(
    (state) => state.appConfig.topTimeFrameOption
  );
  const userFrontPagePostSortOrderOption = useAppSelector(
    (state) => state.appConfig.userFrontPagePostSortOrderOption
  );
  const stateRedditApiItemLimit = useAppSelector(
    (state) => state.appConfig.redditApiItemLimit
  );
  const contentFiltering = useAppSelector(
    (state) => state.appConfig.contentFiltering
  );
  const [localRedditApiItemLimit, setLocalRedditApiItemLimit] = useState(
    stateRedditApiItemLimit
  );
  const redditApiLimitValidationError = useAppSelector(
    (state) => state.appConfig.redditApiItemLimitValidationError
  );

  useEffect(() => {
    console.log("inside use effect");
    setLocalRedditApiItemLimit(stateRedditApiItemLimit);
  }, [stateRedditApiItemLimit]);

  return (
    <>
      <hr />
      <div className="settings-item flex-column">
        <label className="select-label">Subreddit Source</label>
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
      <hr />
      <div className="settings-item flex-column">
        <label className="select-label">Sort Selected Subreddit lists by</label>
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
      <hr />
      <div className="reddit-post-settings">
        <div className="settings-item">
          <label className="select-label">Post Sort Order</label>
          <select
            value={postSortOrder}
            onChange={(event) =>
              dispatch(setPostSortOrderOption(event.target.value))
            }
            className="select"
          >
            {Object.entries(PostSortOrderOptionsEnum).map((key) => {
              return (
                <option key={key[0]} value={key[1]}>
                  {key[1]}
                </option>
              );
            })}
          </select>
        </div>
        <hr />
        <div className="settings-item">
          <label className="select-label">Top Time Frame</label>
          <select
            value={topTimeFrameOption}
            onChange={(event) =>
              dispatch(setTopTimeFrameOption(event.target.value))
            }
            className="select"
          >
            {Object.entries(TopTimeFrameOptionsEnum).map((key) => {
              return (
                <option key={key[0]} value={key[1]}>
                  {key[1]}
                </option>
              );
            })}
          </select>
        </div>
        <hr />
        <div className="settings-item">
          <label className="select-label">User Front Page Sort Option</label>
          <select
            value={userFrontPagePostSortOrderOption}
            onChange={(event) =>
              dispatch(setUserFrontPagePostSortOrderOption(event.target.value))
            }
            className="select"
          >
            {Object.entries(UserFrontPagePostSortOrderOptionsEnum).map(
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
        <div className="settings-item">
          <label className="select-label">Reddit API Limit</label>
          <input
            value={localRedditApiItemLimit}
            className="input"
            type="number"
            onChange={(event) => {
              const inputValue = parseInt(event.target.value);
              dispatch(validateRedditApiItemLimit(inputValue));
              setLocalRedditApiItemLimit(inputValue);
            }}
            onBlur={(event) => {
              const inputValue = parseInt(event.target.value);
              dispatch(setRedditApiItemLimit(inputValue));
            }}
          />
          <p className="settings-item-error">{redditApiLimitValidationError}</p>
        </div>

        <hr />
        <div className="settings-item flex-column">
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
        <hr />
      </div>
    </>
  );
};

export default RedditSourceSettings;
