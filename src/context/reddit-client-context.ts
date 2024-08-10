import { createContext } from "react";
import { RedditClientContextObj } from "../model/state/RedditClientState.ts";

export const RedditClientContext = createContext<RedditClientContextObj>(
  {} as RedditClientContextObj
);
