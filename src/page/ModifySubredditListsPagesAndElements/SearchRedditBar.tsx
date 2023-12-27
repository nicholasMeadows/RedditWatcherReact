import { useEffect, useRef, useState } from "react";
import { RedditSearchItemContextMenuEvent } from "../../model/Events/RedditSearchItemContextMenuEvent";
import { Platform } from "../../model/Platform";
import { setRedditSearchItemContextMenuEvent } from "../../redux/slice/ContextMenuSlice";
import {
  clearSearchResults,
  searchReddit,
  setSearchBarInput,
  setSearchResultsOpen,
  subOrUnSubFromSubreddit,
} from "../../redux/slice/RedditSearchSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import getPlatform from "../../util/PlatformUtil";

type Props = {
  darkmodeOverride?: boolean;
};
const SearchRedditBar: React.FC<Props> = ({ darkmodeOverride }) => {
  const dispatch = useAppDispatch();
  const darkmode = useAppSelector((state) => state.appConfig.darkMode);
  const searchBarInput = useAppSelector(
    (state) => state.redditSearch.searcbBarInput
  );
  const searchResults = useAppSelector(
    (state) => state.redditSearch.searchResults
  );
  const searchResultsOpen = useAppSelector(
    (state) => state.redditSearch.searchResultsOpen
  );

  const searchInputRef = useRef(null);

  const [
    expandCollapseSearchResultsImgSrc,
    setExpandCollapseSearchResultsImgSrc,
  ] = useState("");
  const [clearSearchInputImgSrc, setClearSearchInputImgSrc] = useState("");

  const searchResultsDivRef = useRef(null);
  const [searchResultsDivHeight, setSearchResultsDivHeight] = useState(0);
  useEffect(() => {
    let useDarkVersion = false;
    if (darkmodeOverride == undefined) {
      useDarkVersion = darkmode;
    } else {
      useDarkVersion = darkmodeOverride;
    }

    const lightDark = useDarkVersion ? "dark" : "light";
    const expandCollapseImgSrc = `assets/left_chevron_${lightDark}_mode.png`;
    const clearSearchInputImgSrc = `assets/x_close_${lightDark}_mode.png`;

    setExpandCollapseSearchResultsImgSrc(expandCollapseImgSrc);
    setClearSearchInputImgSrc(clearSearchInputImgSrc);
  }, [darkmode, darkmodeOverride]);

  useEffect(() => {
    const searchResultsDiv =
      searchResultsDivRef.current as unknown as HTMLDivElement;
    let height = 0;

    if (searchResultsOpen) {
      height = searchResultsDiv.scrollHeight;
    }

    setSearchResultsDivHeight(height);
  }, [searchResults, searchResultsOpen]);

  return (
    <div className="reddit-search-bar">
      <div className="reddit-search-input-wrapper">
        <input
          ref={searchInputRef}
          type="text"
          className="reddit-search-input"
          placeholder="Search Reddit"
          value={searchBarInput}
          onChange={(changeEvent) => {
            const inputValue = changeEvent.target.value;
            dispatch(setSearchBarInput(inputValue));
          }}
          onKeyUp={(keyboardEvent) => {
            if (keyboardEvent.key == "Enter") {
              dispatch(searchReddit());
            }
          }}
          onBlur={() => {
            const platform = getPlatform();
            if (platform == Platform.Android || platform == Platform.Ios) {
              dispatch(searchReddit());
            }
          }}
        />

        <div className="reddit-search-bar-control-imgs-div">
          <img
            hidden={searchResults.length == 0}
            src={expandCollapseSearchResultsImgSrc}
            className={`reddit-search-bar-control-img ${
              searchResultsOpen
                ? "collapse-search-results-img"
                : "expand-search-results-img"
            }`}
            onClick={() => {
              dispatch(setSearchResultsOpen(!searchResultsOpen));
            }}
          />
          <img
            hidden={searchBarInput.length == 0}
            src={clearSearchInputImgSrc}
            className="reddit-search-bar-control-img"
            onClick={() => {
              dispatch(setSearchBarInput(""));
              dispatch(setSearchResultsOpen(false));
              setTimeout(() => {
                dispatch(clearSearchResults());
              }, 200);
            }}
          />
        </div>
      </div>
      <div
        ref={searchResultsDivRef}
        className={`search-results`}
        style={{
          top: `calc(0px + ${
            searchInputRef.current == undefined
              ? 0
              : (
                  searchInputRef.current as unknown as HTMLDivElement
                ).getBoundingClientRect().height
          }px)`,
          height: `${searchResultsDivHeight}px`,
        }}
      >
        {searchResults.map((searchResult) => (
          <div
            key={searchResult.searchResultUuid}
            className="search-result-item"
            onContextMenu={(event) => {
              event.stopPropagation();
              event.preventDefault();
              const customEvent: RedditSearchItemContextMenuEvent = {
                x: event.clientX,
                y: event.clientY,
                searchResultItem: searchResult,
              };
              dispatch(
                setRedditSearchItemContextMenuEvent({ event: customEvent })
              );
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
            <button
              className="search-result-sub-unsub-button"
              onClick={() => {
                dispatch(subOrUnSubFromSubreddit(searchResult));
              }}
            >
              {searchResult.isSubscribed ? "UnSubscribe" : "Subscribe"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchRedditBar;
