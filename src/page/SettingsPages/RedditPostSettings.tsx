import { useEffect, useState } from "react";
import PostSortOrderOptionsEnum from "../../model/config/enums/PostSortOrderOptionsEnum";
import TopTimeFrameOptionsEnum from "../../model/config/enums/TopTimeFrameOptionsEnum";
import UserFrontPagePostSortOrderOptionsEnum from "../../model/config/enums/UserFrontPagePostSortOrderOptionsEnum";
import {
  setPostSortOrderOption,
  setRedditApiItemLimit,
  setTopTimeFrameOption,
  setUserFrontPagePostSortOrderOption,
  validateRedditApiItemLimit,
} from "../../redux/slice/AppConfigSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";

const RedditPostSettings: React.FC = () => {
  const dispatch = useAppDispatch();

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
      </div>
    </>
  );
};

export default RedditPostSettings;
