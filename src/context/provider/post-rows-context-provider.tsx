import { FC, ReactNode, useReducer } from "react";
import {
  PostRowsContext,
  PostRowsDispatchContext,
} from "../post-rows-context.ts";
import PostRowsReducer, {
  PostRowsState,
} from "../../reducer/post-rows-reducer.ts";
import { PostRow } from "../../model/PostRow.ts";

type Props = {
  children: ReactNode;
};

export const PostRowsContextProvider: FC<Props> = ({ children }) => {
  const initialState: PostRowsState = {
    currentPath: "",
    scrollY: 0,
    playPauseButtonIsPaused: false,
    postRows: new Array<PostRow>(),
    pauseGetPostsLoop: false,
    mouseOverAPostRow: false,
  };
  const [postRowsState, dispatch] = useReducer(PostRowsReducer, initialState);
  return (
    <PostRowsContext.Provider value={postRowsState}>
      <PostRowsDispatchContext.Provider value={dispatch}>
        {children}
      </PostRowsDispatchContext.Provider>
    </PostRowsContext.Provider>
  );
};
