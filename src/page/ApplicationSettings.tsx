import { AutoScrollPostRowDirectionOptionEnum } from "../model/config/enums/AutoScrollPostRowDirectionOptionEnum.ts";
import RandomIterationSelectWeightOptionsEnum from "../model/config/enums/RandomIterationSelectWeightOptionsEnum.ts";
import SelectSubredditListMenuSortOptionEnum from "../model/config/enums/SelectSubredditListMenuSortOptionEnum.ts";
import SortOrderDirectionOptionsEnum from "../model/config/enums/SortOrderDirectionOptionsEnum.ts";
import { useContext } from "react";
import {
  AppConfigDispatchContext,
  AppConfigStateContext,
} from "../context/app-config-context.ts";
import { AppConfigActionType } from "../reducer/app-config-reducer.ts";
import getPlatform from "../util/PlatformUtil.ts";
import { Platform } from "../model/Platform.ts";
import "../theme/app-settings.scss";

const ApplicationSettings: React.FC = () => {
  const appConfigDispatch = useContext(AppConfigDispatchContext);
  const {
    autoScrollPostRow,
    autoScrollPostRowDirectionOption,
    autoScrollPostRowRateSecondsForSinglePostCard,
    autoScrollPostRowRateSecondsForSinglePostCardValidationError,
    randomIterationSelectWeightOption,
    selectSubredditListMenuSortOption,
    sortOrderDirectionOption,
    concatRedditUrlMaxLength,
    concatRedditUrlMaxLengthValidationError,
    postsToShowInRow,
    postsToShowInRowValidationError,
    postRowsToShowInView,
    postRowsToShowInViewValidationError,
    useInMemoryImagesAndGifs,
    postConverterFilteringOptions,
    getPostRowIterationTime,
    getPostRowIterationTimeValidationError,
    nodeRedUrl,
    nodeRedUrlValidationError,
      redditListDotComNumOfSubredditsToGet,
      redditListDotComNumOfSubredditsToGetValidationError
  } = useContext(AppConfigStateContext);

  const {
    urlsThatEndWithDotPng,
    urlsThatEndWithDotGif,
    urlsThatEndWithDotJpg,
    urlsThatEndWithDotJpeg,
    urlsInRedGifsDomain,
    urlsInGiphyDomain,
    urlsInImgurDomain,
    redditGalleries,
  } = postConverterFilteringOptions;

  return (
      <div className="reddit-watcher-settings">
          {getPlatform() !== Platform.Web && getPlatform() !== Platform.Unknown && (
              <>
                  <hr/>
                  <div className="settings-item flex-row">
                      <label className="select-label-relative">
                          Download and use in memory images and gifs (May affect
                          performance)
                      </label>
                      <input
                          type={"checkbox"}
                          className={"settings-checkbox-input"}
                          checked={useInMemoryImagesAndGifs}
                          onChange={() => {
                              appConfigDispatch({
                                  type: AppConfigActionType.SET_USE_IN_MEMORY_IMAGES_AND_GIFS,
                                  payload: !useInMemoryImagesAndGifs,
                              });
                          }}
                      />
                  </div>
              </>
          )}
          <hr/>
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
          <hr/>
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
          <hr/>
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
          <hr/>

          <div className="settings-item flex-row">
              <label className="select-label-relative">Autoscroll Post Row</label>
              <input
                  type={"checkbox"}
                  className={"settings-checkbox-input"}
                  checked={autoScrollPostRow}
                  onChange={() => {
                      appConfigDispatch({
                          type: AppConfigActionType.SET_AUTO_SCROLL_POST_ROW,
                          payload: !autoScrollPostRow,
                      });
                  }}
              />
          </div>
          <hr/>
          <div className="settings-item flex-column">
              <label className="select-label">Auto Scroll Post Row Direction</label>
              <select
                  value={autoScrollPostRowDirectionOption}
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

          <hr/>
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

          <hr/>
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

          <hr/>
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
          <hr/>
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
          <hr/>

          <div className="settings-item flex-column">
              <label className="select-label">Get Post Row Iteration Time</label>
              <input
                  value={getPostRowIterationTime}
                  className="input"
                  type="number"
                  onChange={(event) => {
                      const inputValue = parseFloat(event.target.value);
                      appConfigDispatch({
                          type: AppConfigActionType.SET_GET_POST_ROW_ITERATION_TIME,
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
                  {getPostRowIterationTimeValidationError}
              </p>
          </div>
          <hr/>

          <div className="settings-item flex-column post-converter-option-section">
              <label className="select-label-relative sub-section-label">
                  Allow posts with URLS
              </label>
              <div className={"post-converter-option-sub-section"}>
                  <label
                      className={
                          "post-converter-option-label post-converter-option-label"
                      }
                  >
                      Urls that end with .jpg
                  </label>
                  <input
                      type={"checkbox"}
                      className={"settings-checkbox-input post-converter-option-checkbox"}
                      checked={urlsThatEndWithDotJpg}
                      onChange={() => {
                          appConfigDispatch({
                              type: AppConfigActionType.SET_POST_CONVERTER_FILTER_OPTION_URLS_THAT_END_WITH_DOT_JPG,
                              payload: !urlsThatEndWithDotJpg,
                          });
                      }}
                  />
                  <hr/>
                  <label
                      className={
                          "post-converter-option-label post-converter-option-label"
                      }
                  >
                      Urls that end with .jpeg
                  </label>
                  <input
                      type={"checkbox"}
                      className={"settings-checkbox-input post-converter-option-checkbox"}
                      checked={urlsThatEndWithDotJpeg}
                      onChange={() => {
                          appConfigDispatch({
                              type: AppConfigActionType.SET_POST_CONVERTER_FILTER_OPTION_URLS_THAT_END_WITH_DOT_JPEG,
                              payload: !urlsThatEndWithDotJpeg,
                          });
                      }}
                  />
                  <hr/>
                  <label
                      className={
                          "post-converter-option-label post-converter-option-label"
                      }
                  >
                      Urls that end with .png
                  </label>
                  <input
                      type={"checkbox"}
                      className={"settings-checkbox-input post-converter-option-checkbox"}
                      checked={urlsThatEndWithDotPng}
                      onChange={() => {
                          appConfigDispatch({
                              type: AppConfigActionType.SET_POST_CONVERTER_FILTER_OPTION_URLS_THAT_END_WITH_DOT_PNG,
                              payload: !urlsThatEndWithDotPng,
                          });
                      }}
                  />
                  <hr/>
                  <label
                      className={
                          "post-converter-option-label post-converter-option-label"
                      }
                  >
                      Urls that end with .gif
                  </label>
                  <input
                      type={"checkbox"}
                      className={"settings-checkbox-input post-converter-option-checkbox"}
                      checked={urlsThatEndWithDotGif}
                      onChange={() => {
                          appConfigDispatch({
                              type: AppConfigActionType.SET_POST_CONVERTER_FILTER_OPTION_URLS_THAT_END_WITH_DOT_GIF,
                              payload: !urlsThatEndWithDotGif,
                          });
                      }}
                  />
                  <hr/>
                  <label
                      className={
                          "post-converter-option-label post-converter-option-label"
                      }
                  >
                      Urls from Imgur
                  </label>
                  <input
                      type={"checkbox"}
                      className={"settings-checkbox-input post-converter-option-checkbox"}
                      checked={urlsInImgurDomain}
                      onChange={() => {
                          appConfigDispatch({
                              type: AppConfigActionType.SET_POST_CONVERTER_FILTER_OPTION_URLS_IN_IMGUR_DOMAIN,
                              payload: !urlsInImgurDomain,
                          });
                      }}
                  />
                  <hr/>
                  <label
                      className={
                          "post-converter-option-label post-converter-option-label"
                      }
                  >
                      Urls from Giphy
                  </label>
                  <input
                      type={"checkbox"}
                      className={"settings-checkbox-input post-converter-option-checkbox"}
                      checked={urlsInGiphyDomain}
                      onChange={() => {
                          appConfigDispatch({
                              type: AppConfigActionType.SET_POST_CONVERTER_FILTER_OPTION_URLS_IN_GIPHY_DOMAIN,
                              payload: !urlsInGiphyDomain,
                          });
                      }}
                  />
                  <hr/>
                  <label
                      className={
                          "post-converter-option-label post-converter-option-label"
                      }
                  >
                      Urls from Redgifs
                  </label>
                  <input
                      type={"checkbox"}
                      className={"settings-checkbox-input post-converter-option-checkbox"}
                      checked={urlsInRedGifsDomain}
                      onChange={() => {
                          appConfigDispatch({
                              type: AppConfigActionType.SET_POST_CONVERTER_FILTER_OPTION_URLS_IN_REDGIFS_DOMAIN,
                              payload: !urlsInRedGifsDomain,
                          });
                      }}
                  />
                  <hr/>
                  <label
                      className={
                          "post-converter-option-label post-converter-option-label"
                      }
                  >
                      Urls from Reddit Galleries
                  </label>
                  <input
                      type={"checkbox"}
                      className={"settings-checkbox-input post-converter-option-checkbox"}
                      checked={redditGalleries}
                      onChange={() => {
                          appConfigDispatch({
                              type: AppConfigActionType.SET_POST_CONVERTER_FILTER_OPTION_REDDIT_GALLERIES,
                              payload: !redditGalleries,
                          });
                      }}
                  />
              </div>
          </div>
          <hr/>

          <div className="settings-item flex-column">
              <label className="select-label">Node red url</label>
              <input
                  value={nodeRedUrl === undefined ? "" : nodeRedUrl}
                  className="input"
                  type="text"
                  onChange={(event) => {
                      console.log("Nicholas test");
                      appConfigDispatch({
                          type: AppConfigActionType.SET_NODE_RED_URL,
                          payload: event.target.value,
                      });
                  }}
              />
              <p className="settings-item-error">{nodeRedUrlValidationError}</p>
          </div>
          <hr/>

          <div className="settings-item flex-column">
              <label className="select-label">RedditList.com number of subreddits to get</label>
              <input
                  value={redditListDotComNumOfSubredditsToGet}
                  className="input"
                  type="number"
                  onChange={(event) => {
                      appConfigDispatch({
                          type: AppConfigActionType.SET_REDDIT_LIST_DOT_COM_NUM_OF_SUBREDDITS_TO_GET,
                          payload:parseInt(event.target.value)
                      });
                  }}
              />
              <p className="settings-item-error">{redditListDotComNumOfSubredditsToGetValidationError}</p>
          </div>
          <hr/>
      </div>
  );
};

export default ApplicationSettings;
