import {
  clearSearchResults,
  searchReddit,
  subOrUnSubFromSubreddit,
} from "../../redux/slice/RedditSearchSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { setRedditSearchItemContextMenuEvent } from "../../redux/slice/ContextMenuSlice";
import { RedditSearchItemContextMenuEvent } from "../../model/Events/RedditSearchItemContextMenuEvent";

const SearchRedditBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const searchResults = useAppSelector(
    (state) => state.redditSearch.searchResults
  );

  return (
    <div className="width">
      <input
        type="text"
        className="input text-color background"
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
        <div className="search-results">
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
              <div className="search-result-fields-wrapper">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchRedditBar;
