import { createContext } from "react";
import { PostRowPageState } from "../model/state/PostRowsState.ts";
import PostRowPageDispatch from "../model/state/dispatch/PostRowPageDispatch.ts";

export const PostRowPageContext = createContext<PostRowPageState>(
  {} as PostRowPageState
);
export const PostRowPageDispatchContext = createContext<PostRowPageDispatch>(
  {} as PostRowPageDispatch
);
