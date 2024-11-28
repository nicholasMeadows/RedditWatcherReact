import { Dispatch } from "react";
import {
  AddItemToSubredditQueueAction,
  MoveSubredditQueueItemAction,
  RedditServiceActionNumberPayload,
  RedditServiceAddSubredditsToMasterSubscribedList,
  RedditServiceSetAuthenticationStatus,
  RemoveSubredditQueueItemActionAction, SetIsGettingPostsAction,
} from "../../../reducer/reddit-service-reducer.ts";

type RedditServiceDispatch = Dispatch<
  | RedditServiceAddSubredditsToMasterSubscribedList
  | RedditServiceActionNumberPayload
  | RedditServiceSetAuthenticationStatus
  | AddItemToSubredditQueueAction
  | RemoveSubredditQueueItemActionAction
  | MoveSubredditQueueItemAction
  | SetIsGettingPostsAction
>;
export default RedditServiceDispatch;
