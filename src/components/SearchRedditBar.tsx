import { useContext, useEffect, useRef, useState } from "react";
import { RedditServiceActions } from "../reducer/reddit-service-reducer.ts";
import { ContextMenuActionType } from "../reducer/context-menu-reducer.ts";
import { RedditServiceDispatchContext } from "../context/reddit-service-context.ts";
import { ContextMenuDispatchContext } from "../context/context-menu-context.ts";
import { AppConfigStateContext } from "../context/app-config-context.ts";
import {
  SearchRedditBarContext,
  SearchRedditBarDispatchContext,
} from "../context/search-reddit-bar-context.ts";
import { SearchRedditBarActionType } from "../reducer/search-reddit-bar-reducer.ts";
import useSearchReddit from "../hook/use-search-reddit.ts";

const SearchRedditBar: React.FC = () => {
  const { darkMode } = useContext(AppConfigStateContext);
  const { searchResults, searchResultsOpen } = useContext(
    SearchRedditBarContext
  );
  const contextMenuDispatch = useContext(ContextMenuDispatchContext);
  const redditServiceDispatch = useContext(RedditServiceDispatchContext);
  const searchRedditBarDispatch = useContext(SearchRedditBarDispatchContext);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { subOrUnSubFromSubreddit } = useSearchReddit(
    searchResults,
    searchInputRef
  );

  const [
    expandCollapseSearchResultsImgSrc,
    setExpandCollapseSearchResultsImgSrc,
  ] = useState("");
  const [clearSearchInputImgSrc, setClearSearchInputImgSrc] = useState("");

  useEffect(() => {
    const lightDark = darkMode ? "dark" : "light";
    const expandCollapseImgSrc = `assets/left_chevron_${lightDark}_mode.png`;
    const clearSearchInputImgSrc = `assets/x_close_${lightDark}_mode.png`;

    setExpandCollapseSearchResultsImgSrc(expandCollapseImgSrc);
    setClearSearchInputImgSrc(clearSearchInputImgSrc);
  }, [darkMode]);

  return (
    <div className="reddit-search-bar" /*onFocus={onFocus} onBlur={onBlur}*/>
      <div className="reddit-search-input-wrapper">
        <input
          ref={searchInputRef}
          type="text"
          className="reddit-search-input"
          placeholder="Search Reddit"
          onKeyUp={(event) => {
            event.stopPropagation();
            event.preventDefault();
          }}
        />

        <div className="reddit-search-bar-control-imgs-div">
          <img
            alt={""}
            hidden={searchResults.length == 0}
            src={expandCollapseSearchResultsImgSrc}
            className={`reddit-search-bar-control-img ${
              searchResultsOpen
                ? "collapse-search-results-img"
                : "expand-search-results-img"
            }`}
            onClick={() => {
              searchRedditBarDispatch({
                type: SearchRedditBarActionType.SET_SEARCH_RESULTS_OPEN,
                payload: !searchResultsOpen,
              });
            }}
          />
          <img
            alt={""}
            hidden={
              searchInputRef.current === null
                ? true
                : searchInputRef.current.value.length === 0
            }
            src={clearSearchInputImgSrc}
            className="reddit-search-bar-control-img"
            onClick={() => {
              if (searchInputRef.current !== null) {
                searchInputRef.current.value = "";
              }
              searchRedditBarDispatch({
                type: SearchRedditBarActionType.SET_SEARCH_RESULTS_OPEN,
                payload: false,
              });
              setTimeout(() => {
                searchRedditBarDispatch({
                  type: SearchRedditBarActionType.SET_SEARCH_RESULTS,
                  payload: [],
                });
              }, 200);
            }}
          />
        </div>
      </div>
      <div
        className={`search-results`}
        style={{
          top: `calc(0px + ${
            searchInputRef.current == undefined
              ? 0
              : (
                  searchInputRef.current as unknown as HTMLDivElement
                ).getBoundingClientRect().height
          }px)`,
          maxHeight: `calc( 100vh - ${
            searchResultsOpen
              ? searchInputRef.current == undefined
                ? "100vh"
                : `${
                    (
                      searchInputRef.current as unknown as HTMLDivElement
                    ).getBoundingClientRect().bottom
                  }px`
              : "100vh"
          })`,
        }}
      >
        {searchResults.map((searchResult) => (
          <div
            key={searchResult.searchResultUuid}
            className="search-result-item"
            onContextMenu={(event) => {
              event.stopPropagation();
              event.preventDefault();
              contextMenuDispatch({
                type: ContextMenuActionType.OPEN_CONTEXT_MENU_FOR_REDDIT_SEARCH_ITEM,
                payload: {
                  redditSearchItem: searchResult,
                  x: event.clientX,
                  y: event.clientY,
                },
              });
            }}
          >
            <p className="search-result-p">
              {(searchResult.isUser ? "(User) " : "") +
                searchResult.displayName +
                (searchResult.over18 ? " NSFW" : "")}
            </p>
            {!searchResult.isUser && (
              <p className="search-result-p">{`Subs: ${searchResult.subscribers}`}</p>
            )}
            <div className={"search-results-button-div"}>
              <button
                className="search-result-sub-unsub-button"
                onClick={() => {
                  subOrUnSubFromSubreddit(searchResult);
                }}
              >
                {searchResult.isSubscribed ? "UnSubscribe" : "Subscribe"}
              </button>
              <button
                className={"search-result-add-to-queue-button"}
                onClick={() => {
                  redditServiceDispatch({
                    type: RedditServiceActions.ADD_ITEM_TO_SUBREDDIT_QUEUE,
                    payload: searchResult,
                  });
                }}
              >
                Add to queue
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchRedditBar;
