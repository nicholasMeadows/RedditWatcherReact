import { createContext, Dispatch } from "react";
import {
  AddPostsToFrontOfRowAction,
  CreatePostRowAndInsertAtBeginningAction,
  PostRowsBooleanPayloadAction,
  PostRowsNoPayloadAction,
  PostRowsNumberPayloadAction,
  PostRowsState,
  PostRowsStringPayloadAction,
  SetLastAutoScrollPostRowStateAction,
  SetPostAttachmentIndexAction,
  SetPostCardWidthPercentageAction,
} from "../reducer/post-rows-reducer.ts";

export type PostRowsDispatch = Dispatch<
  | PostRowsStringPayloadAction
  | PostRowsNumberPayloadAction
  | PostRowsBooleanPayloadAction
  | PostRowsNoPayloadAction
  | CreatePostRowAndInsertAtBeginningAction
  | SetPostAttachmentIndexAction
  | AddPostsToFrontOfRowAction
  | SetPostCardWidthPercentageAction
  | SetLastAutoScrollPostRowStateAction
>;
export const PostRowsContext = createContext<PostRowsState>(
  {} as PostRowsState
);
export const PostRowsDispatchContext = createContext<PostRowsDispatch>(
  {} as PostRowsDispatch
);
