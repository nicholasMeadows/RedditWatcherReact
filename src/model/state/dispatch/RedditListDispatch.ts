import { Dispatch } from "react";
import {
  RedditListAddOrRemoveToListAction,
  RedditListNoPayloadAction,
  RedditListSetCreateUpdateInputValueAction,
  RedditListSetSubredditListsAction,
  RedditListSubredditListsPayloadAction,
} from "../../../reducer/reddit-list-reducer.ts";

type RedditListDispatch = Dispatch<
  | RedditListNoPayloadAction
  | RedditListSubredditListsPayloadAction
  | RedditListSetSubredditListsAction
  | RedditListSetCreateUpdateInputValueAction
  | RedditListAddOrRemoveToListAction
>;
export default RedditListDispatch;
