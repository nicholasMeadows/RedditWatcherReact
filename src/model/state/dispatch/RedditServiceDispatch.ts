import { Dispatch } from "react";
import {
  RedditServiceActionNumberPayload,
  RedditServiceAddSubredditsToMasterSubscribedList,
} from "../../../reducer/reddit-service-reducer.ts";

type RedditServiceDispatch = Dispatch<
  | RedditServiceAddSubredditsToMasterSubscribedList
  | RedditServiceActionNumberPayload
>;
export default RedditServiceDispatch;
