import { Dispatch } from "react";
import {
  RedditServiceActionNumberPayload,
  RedditServiceAddSubredditsToMasterSubscribedList,
  RedditServiceSetAuthenticationStatus,
  SubredditQueueAction,
} from "../../../reducer/reddit-service-reducer.ts";

type RedditServiceDispatch = Dispatch<
  | RedditServiceAddSubredditsToMasterSubscribedList
  | RedditServiceActionNumberPayload
  | RedditServiceSetAuthenticationStatus
  | SubredditQueueAction
>;
export default RedditServiceDispatch;
