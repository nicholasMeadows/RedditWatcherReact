import { PostRowsState } from "../model/PostRowsState.ts";
import { createContext } from "react";

type PostRowsContextObj = {
  postRowsContextData: PostRowsState;
  setPostRowsContextData: React.Dispatch<React.SetStateAction<PostRowsState>>;
};
export const PostRowsContext = createContext({} as PostRowsContextObj);
