import { RedditAuthenticationStatus } from "../model/RedditAuthenticationState.ts";
import { createContext } from "react";

export type RedditClientContextData = {
  redditAuthenticationStatus: RedditAuthenticationStatus;
};

type RedditClientContextObj = {
  redditClientContextData: RedditClientContextData;
  setRedditClientContextData: React.Dispatch<
    React.SetStateAction<RedditClientContextData>
  >;
};

export const RedditClientContext = createContext<RedditClientContextObj>(
  {} as RedditClientContextObj
);
