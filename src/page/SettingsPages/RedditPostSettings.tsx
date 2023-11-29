// import { useAppDispatch, useAppSelector } from "../../redux/store";
// import PostSortOrderOptionsEnum from "../../model/config/enums/PostSortOrderOptionsEnum";
// import UserFrontPagePostSortOrderOptionsEnum from "../../model/config/enums/UserFrontPagePostSortOrderOptionsEnum";
// import TopTimeFrameOptionsEnum from "../../model/config/enums/TopTimeFrameOptionsEnum";
// import {
//   setPostSortOrderOption,
//   setRedditApiItemLimit,
//   setTopTimeFrameOption,
//   setUserFrontPagePostSortOrderOption,
// } from "../../redux/slice/AppConfigSlice";

import PostSortOrderOptionsEnum from "../../model/config/enums/PostSortOrderOptionsEnum";
import TopTimeFrameOptionsEnum from "../../model/config/enums/TopTimeFrameOptionsEnum";
import UserFrontPagePostSortOrderOptionsEnum from "../../model/config/enums/UserFrontPagePostSortOrderOptionsEnum";
import {
  setPostSortOrderOption,
  setRedditApiItemLimit,
  setTopTimeFrameOption,
  setUserFrontPagePostSortOrderOption,
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
  const redditApiItemLimit = useAppSelector(
    (state) => state.appConfig.redditApiItemLimit
  );
  const redditApiLimitValidationError = useAppSelector(
    (state) => state.appConfig.redditApiItemLimitValidationError
  );

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
            value={redditApiItemLimit}
            className="input"
            type="number"
            onChange={(event) =>
              dispatch(setRedditApiItemLimit(event.target.value))
            }
          />
          <p className="settings-item-error">{redditApiLimitValidationError}</p>
        </div>
      </div>
    </>
  );
};

export default RedditPostSettings;
