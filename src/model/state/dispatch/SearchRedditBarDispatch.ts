import { Dispatch } from "react";
import {
  SearchRedditBarBooleanAction,
  SearchRedditBarSetSearchResultsAction,
} from "../../../reducer/search-reddit-bar-reducer.ts";

type SearchRedditBarContext = Dispatch<
  SearchRedditBarBooleanAction | SearchRedditBarSetSearchResultsAction
>;
export default SearchRedditBarContext;
