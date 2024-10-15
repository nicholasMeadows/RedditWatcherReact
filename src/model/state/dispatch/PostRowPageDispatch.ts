import { Dispatch } from "react";
import {
  AddPostRowAction,
  PostRowPageBooleanPayloadAction,
  PostRowPageNoPayloadAction,
  PostRowPageNumberPayloadAction,
  PostRowPageSetMouseOverPostRowUuidAction,
  PostRowPageStringPayloadAction,
  SetPostAttachmentIndexAction,
  SetShowPostCardInfoOnPostUuidAction,
  UpdateMovePostRowValuesAction,
} from "../../../reducer/post-row-page-reducer.ts";

type PostRowPageDispatch = Dispatch<
  | PostRowPageStringPayloadAction
  | PostRowPageNumberPayloadAction
  | PostRowPageBooleanPayloadAction
  | PostRowPageNoPayloadAction
  | SetPostAttachmentIndexAction
  | AddPostRowAction
  | PostRowPageSetMouseOverPostRowUuidAction
  | UpdateMovePostRowValuesAction
  | SetShowPostCardInfoOnPostUuidAction
>;
export default PostRowPageDispatch;
