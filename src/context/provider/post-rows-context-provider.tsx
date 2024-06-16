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
const initialState: PostRowsState = {
  getPostRowsPaused: false,
  currentPath: "",
  scrollY: 0,
  clickedOnPlayPauseButton: false,
  postRowsHasAtLeast1PostRow: false,
  postRows: new Array<PostRow>(),
  postCardWidthPercentage: 0,
  postRowContentWidthPx: 0,
};

export const PostRowsContextProvider: FC<Props> = ({ children }) => {
  const [postRowsState, dispatch] = useReducer(PostRowsReducer, initialState);
  return (
    <PostRowsContext.Provider value={postRowsState}>
      <PostRowsDispatchContext.Provider value={dispatch}>
        {children}
      </PostRowsDispatchContext.Provider>
    </PostRowsContext.Provider>
  );
};
