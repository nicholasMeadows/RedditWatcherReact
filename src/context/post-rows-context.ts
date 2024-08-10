import { createContext } from "react";
import { PostRowsState } from "../model/state/PostRowsState.ts";
import PostRowsDispatch from "../model/state/dispatch/PostRowsDispatch.ts";

export const PostRowsContext = createContext<PostRowsState>(
  {} as PostRowsState
);
export const PostRowsDispatchContext = createContext<PostRowsDispatch>(
  {} as PostRowsDispatch
);
