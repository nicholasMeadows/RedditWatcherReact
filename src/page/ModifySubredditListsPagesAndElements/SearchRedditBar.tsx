import { useRef } from "react";
import { RedditSearchItemContextMenuEvent } from "../../model/Events/RedditSearchItemContextMenuEvent";
import { setRedditSearchItemContextMenuEvent } from "../../redux/slice/ContextMenuSlice";
import {
  clearSearchResults,
  searchReddit,
  subOrUnSubFromSubreddit,
} from "../../redux/slice/RedditSearchSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";

const SearchRedditBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const searchResults = useAppSelector(
    (state) => state.redditSearch.searchResults
  );

  const searchInput = useRef(null);

  return (
    <div className="reddit-search-bar">
      <input
        ref={searchInput}
        type="text"
        className="reddit-search-input"
        placeholder="Search Reddit"
        onKeyUp={(keyboardEvent) => {
          if (keyboardEvent.key == "Enter") {
            const inputText: string = (keyboardEvent.target as HTMLInputElement)
              .value;
            dispatch(searchReddit(inputText));
          } else {
            dispatch(clearSearchResults());
          }
        }}
      />
      {searchResults.length > 0 && (
        <div
          className="search-results"
          style={{
            top: `calc(0px + ${
              searchInput.current == undefined
                ? 0
                : (
                    searchInput.current as unknown as HTMLDivElement
                  ).getBoundingClientRect().height
            }px)`,
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
      )}
    </div>
  );
};

export default SearchRedditBar;
