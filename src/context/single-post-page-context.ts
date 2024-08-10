import { createContext } from "react";
import { SinglePostPageState } from "../model/state/SinglePostPageState.ts";
import SinglePostPageDispatch from "../model/state/dispatch/SinglePostPageDispatch.ts";

export const SinglePostPageContext = createContext<SinglePostPageState>(
  {} as SinglePostPageState
);
export const SinglePostPageDispatchContext =
  createContext<SinglePostPageDispatch>({} as SinglePostPageDispatch);
