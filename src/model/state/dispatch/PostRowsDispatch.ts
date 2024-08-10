import { Dispatch } from "react";
import {
  AddPostRowAction,
  PostRowsBooleanPayloadAction,
  PostRowsNoPayloadAction,
  PostRowsNumberPayloadAction,
  PostRowsStringPayloadAction,
  SetPostAttachmentIndexAction,
} from "../../../reducer/post-rows-reducer.ts";

type PostRowsDispatch = Dispatch<
  | PostRowsStringPayloadAction
  | PostRowsNumberPayloadAction
  | PostRowsBooleanPayloadAction
  | PostRowsNoPayloadAction
  | SetPostAttachmentIndexAction
  | AddPostRowAction
>;
export default PostRowsDispatch;
