import { Dispatch } from "react";
import {
  RedditServiceActionNumberPayload,
  RedditServiceAddSubredditsToMasterSubscribedList,
  RedditServiceSetAuthenticationStatus,
  RemoveSubredditQueueItemActionAction,
  SetSubredditQueueAction,
} from "../../../reducer/reddit-service-reducer.ts";

type RedditServiceDispatch = Dispatch<
  | RedditServiceAddSubredditsToMasterSubscribedList
  | RedditServiceActionNumberPayload
  | RedditServiceSetAuthenticationStatus
  | SetSubredditQueueAction
  | RemoveSubredditQueueItemActionAction
>;
export default RedditServiceDispatch;
