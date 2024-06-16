import { createContext, Dispatch } from "react";
import {
  SetSinglePostPageUuidsAction,
  SinglePostPageState,
} from "../reducer/single-post-page-reducer.ts";

export const SinglePostPageContext = createContext<SinglePostPageState>(
  {} as SinglePostPageState
);
export const SinglePostPageDispatchContext = createContext<
  Dispatch<SetSinglePostPageUuidsAction>
>({} as Dispatch<SetSinglePostPageUuidsAction>);
