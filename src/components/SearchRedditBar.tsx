import { useContext, useEffect, useRef, useState } from "react";
import { RedditSearchItemContextMenuEvent } from "../model/Events/RedditSearchItemContextMenuEvent";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { setRedditSearchItemContextMenuEvent } from "../redux/slice/ContextMenuSlice.ts";
import useSearchReddit from "../hook/use-search-reddit.ts";
import SearchRedditBarContext from "../context/search-reddit-bar-context.ts";

const SearchRedditBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const darkmode = useAppSelector((state) => state.appConfig.darkMode);
  const {
    searchResultsOpen,
    setSearchResultsOpen,
    darkmodeOverride,
    onFocus,
    onBlur,
  } = useContext(SearchRedditBarContext);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { searchResults, clearSearchResults, subOrUnSubFromSubreddit } =
    useSearchReddit(searchInputRef);
  const [
    expandCollapseSearchResultsImgSrc,
    setExpandCollapseSearchResultsImgSrc,
  ] = useState("");
  const [clearSearchInputImgSrc, setClearSearchInputImgSrc] = useState("");

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

  return (
    <div className="reddit-search-bar" onFocus={onFocus} onBlur={onBlur}>
      <div className="reddit-search-input-wrapper">
        <input
          ref={searchInputRef}
          type="text"
          className="reddit-search-input"
          placeholder="Search Reddit"
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
              setSearchResultsOpen(!searchResultsOpen);
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
              setSearchResultsOpen(false);
              setTimeout(() => {
                clearSearchResults();
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
            searchInputRef.current == undefined
              ? "100vh"
              : `${
                  (
                    searchInputRef.current as unknown as HTMLDivElement
                  ).getBoundingClientRect().bottom
                }px`
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
                subOrUnSubFromSubreddit(searchResult);
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
