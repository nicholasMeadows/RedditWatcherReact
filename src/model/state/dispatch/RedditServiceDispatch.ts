import { Dispatch } from "react";
import {
  RedditServiceActionNumberPayload,
  RedditServiceAddSubredditsToMasterSubscribedList,
  RedditServiceSetAuthenticationStatus,
  SetSubredditQueueAction,
} from "../../../reducer/reddit-service-reducer.ts";

type RedditServiceDispatch = Dispatch<
  | RedditServiceAddSubredditsToMasterSubscribedList
  | RedditServiceActionNumberPayload
  | RedditServiceSetAuthenticationStatus
  | SetSubredditQueueAction
>;
export default RedditServiceDispatch;
