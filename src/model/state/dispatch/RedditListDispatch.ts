import { Dispatch } from "react";
import {
  RedditListAddOrRemoveToListAction,
  RedditListNoPayloadAction,
  RedditListSetCreateUpdateInputValueAction,
  RedditListSetSubredditListsAction,
  RedditListSetSubredditListSelected,
  RedditListSubredditListsPayloadAction,
} from "../../../reducer/reddit-list-reducer.ts";

type RedditListDispatch = Dispatch<
  | RedditListNoPayloadAction
  | RedditListSubredditListsPayloadAction
  | RedditListSetSubredditListsAction
  | RedditListSetCreateUpdateInputValueAction
  | RedditListAddOrRemoveToListAction
  | RedditListSetSubredditListSelected
>;
export default RedditListDispatch;
