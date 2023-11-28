import { SubredditAccountSearchResult } from "../SubredditAccountSearchResult";
import CustomContextMenuEvent from "./CustomContextMenuEvent";

export interface RedditSearchItemContextMenuEvent extends CustomContextMenuEvent{
    searchResultItem: SubredditAccountSearchResult
}