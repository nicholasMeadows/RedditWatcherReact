import { createContext } from "react";
import { PostRow } from "../model/PostRow.ts";

export interface PostRowsContextData {
  getPostRowsPaused: boolean;
  currentPath: string;
  scrollY: number;
  clickedOnPlayPauseButton: boolean;
  getPostRowsPausedTimeout: NodeJS.Timeout | undefined;
  postRows: Array<PostRow>;
  postRowsHasAtLeast1PostRow: boolean;
  postCardWidthPercentage: number;
  postRowContentWidthPx: number;
}

type PostRowsContextObj = {
  postRowsContextData: PostRowsContextData;
  setPostRowsContextData: React.Dispatch<
    React.SetStateAction<PostRowsContextData>
  >;
};
export const PostRowsContext = createContext({} as PostRowsContextObj);
