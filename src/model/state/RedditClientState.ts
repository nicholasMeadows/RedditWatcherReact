import { RedditAuthenticationStatus } from "../RedditAuthenticationState.ts";
import { Dispatch, SetStateAction } from "react";

export type RedditClientState = {
  redditAuthenticationStatus: RedditAuthenticationStatus;
};

export type RedditClientContextObj = {
  redditClientState: RedditClientState;
  redditClientDispatch: Dispatch<SetStateAction<RedditClientState>>;
};
