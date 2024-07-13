import { useCallback, useContext } from "react";
import PostSortOrderOptionsEnum from "./../model/config/enums/PostSortOrderOptionsEnum.ts";
import TopTimeFrameOptionsEnum from "./../model/config/enums/TopTimeFrameOptionsEnum.ts";
import { checkPlatformForSubredditSortOrderOption } from "./../util/PlatformUtil.ts";
import ContentFilteringOptionEnum from "./../model/config/enums/ContentFilteringOptionEnum.ts";
import {
  AppConfigDispatchContext,
  AppConfigStateContext,
} from "../context/app-config-context.ts";
import { AppConfigActionType } from "../reducer/app-config-reducer.ts";
import SubredditSourceOptionsEnum from "../model/config/enums/SubredditSourceOptionsEnum.ts";
import SubredditSortOrderOptionsEnum from "../model/config/enums/SubredditSortOrderOptionsEnum.ts";
import SelectSubredditIterationMethodOptionsEnum from "../model/config/enums/SelectSubredditIterationMethodOptionsEnum.ts";

const RedditSourceSettings: React.FC = () => {
  const appConfigDispatch = useContext(AppConfigDispatchContext);
  const subredditSourceOption = useContext(
    AppConfigStateContext
  ).subredditSourceOption;
  const subredditSortOrderOption = useContext(
    AppConfigStateContext
  ).subredditSortOrderOption;
  const getAllSubredditsAtOnce = useContext(
    AppConfigStateContext
  ).getAllSubredditsAtOnce;
  const selectSubredditIterationMethodOption = useContext(
    AppConfigStateContext
  ).selectSubredditIterationMethodOption;
  const postSortOrder = useContext(AppConfigStateContext).postSortOrderOption;
  const topTimeFrameOption = useContext(
    AppConfigStateContext
  ).topTimeFrameOption;
  const redditApiItemLimit = useContext(
    AppConfigStateContext
  ).redditApiItemLimit;
  const contentFiltering = useContext(AppConfigStateContext).contentFiltering;
  const redditApiLimitValidationError = useContext(
    AppConfigStateContext
  ).redditApiItemLimitValidationError;

  const disableSubredditSortOrderSelect = useCallback(() => {
    return (
      subredditSourceOption ===
        SubredditSourceOptionsEnum.RedditListDotCom24HourGrowth ||
      subredditSourceOption ===
        SubredditSourceOptionsEnum.RedditListDotComSubscribers ||
      subredditSourceOption ===
        SubredditSourceOptionsEnum.RedditListDotComRecentActivity ||
      getAllSubredditsAtOnce ||
      subredditSourceOption === SubredditSourceOptionsEnum.FrontPage
    );
  }, [getAllSubredditsAtOnce, subredditSourceOption]);

  return (
    <>
      <hr />
      <div className="settings-item flex-column">
        <label className="select-label">Subreddit Source</label>
        <select
          value={subredditSourceOption}
          onChange={(event) =>
            appConfigDispatch({
              type: AppConfigActionType.SET_SUBREDDIT_SOURCE_OPTION,
              payload: event.target.value as SubredditSourceOptionsEnum,
            })
          }
          className="select"
        >
          {Object.entries(SubredditSourceOptionsEnum).map((key) => {
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
      <div
        className={`settings-item flex-column ${
          disableSubredditSortOrderSelect() ? "disabled-field-color" : ""
        }`}
      >
        <label className="select-label">Subreddit Sort By</label>
        <select
          disabled={disableSubredditSortOrderSelect()}
          value={subredditSortOrderOption}
          onChange={(event) =>
            appConfigDispatch({
              type: AppConfigActionType.SET_SUBREDDIT_SORT_ORDER_OPTION,
              payload: event.target.value as SubredditSortOrderOptionsEnum,
            })
          }
          className={`select ${
            disableSubredditSortOrderSelect() ? "disabled-field-color" : ""
          }`}
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
      <hr />
      <div className="settings-item flex-row">
        <label className="select-label-relative">
          Get All Subreddits At Once
        </label>
        <input
          type={"checkbox"}
          className={"settings-checkbox-input"}
          checked={getAllSubredditsAtOnce}
          onChange={() => {
            appConfigDispatch({
              type: AppConfigActionType.SET_GET_ALL_SUBREDDITS_AT_ONCE,
              payload: !getAllSubredditsAtOnce,
            });
          }}
        />
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
      <div className="reddit-post-settings">
        <div className="settings-item">
          <label className="select-label">Post Sort Order</label>
          <select
            value={postSortOrder}
            onChange={(event) =>
              appConfigDispatch({
                type: AppConfigActionType.SET_POST_SORT_ORDER_OPTION,
                payload: event.target.value as PostSortOrderOptionsEnum,
              })
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
              appConfigDispatch({
                type: AppConfigActionType.SET_TOP_TIME_FRAME_OPTION,
                payload: event.target.value as TopTimeFrameOptionsEnum,
              })
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
        <div className="settings-item  flex-column">
          <label className="select-label">Reddit API Limit</label>
          <input
            value={redditApiItemLimit}
            className="input"
            type="number"
            onChange={(event) => {
              const inputValue = parseInt(event.target.value);
              appConfigDispatch({
                type: AppConfigActionType.SET_REDDIT_API_ITEM_LIMIT,
                payload: inputValue,
              });
            }}
            onBlur={() => {
              appConfigDispatch({
                type: AppConfigActionType.CLEAR_REDDIT_API_ITEM_LIMIT_VALIDATION_ERROR,
              });
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
              appConfigDispatch({
                type: AppConfigActionType.SET_CONTENT_FILTERING,
                payload: event.target.value as ContentFilteringOptionEnum,
              })
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
