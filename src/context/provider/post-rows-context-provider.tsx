import { FC, ReactNode, useReducer } from "react";
import { PostRow } from "../../model/PostRow.ts";
import PostRowPageReducer from "../../reducer/post-row-page-reducer.ts";
import { PostRowPageState } from "../../model/state/PostRowsState.ts";
import {
  PostRowPageContext,
  PostRowPageDispatchContext,
} from "../post-row-page-context.ts";

type Props = {
  children: ReactNode;
};

export const PostRowsContextProvider: FC<Props> = ({ children }) => {
  const initialState: PostRowPageState = {
    currentPath: "",
    scrollY: 0,
    playPauseButtonIsClicked: false,
    postRows: new Array<PostRow>(),
    mouseOverPostRowUuid: undefined,
    showCardInfoOnCardUuid: undefined,
  };
  const [postRowsState, dispatch] = useReducer(
    PostRowPageReducer,
    initialState
  );
  return (
    <PostRowPageContext.Provider value={postRowsState}>
      <PostRowPageDispatchContext.Provider value={dispatch}>
        {children}
      </PostRowPageDispatchContext.Provider>
    </PostRowPageContext.Provider>
  );
};
