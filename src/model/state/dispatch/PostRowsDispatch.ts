import { Dispatch } from "react";
import {
  AddPostRowAction,
  PostRowsBooleanPayloadAction,
  PostRowsNoPayloadAction,
  PostRowsNumberPayloadAction,
  PostRowsSetMouseOverPostRowUuidAction,
  PostRowsStringPayloadAction,
  SetPostAttachmentIndexAction,
  SetPostSliderLeftOrTransitionTimeAction,
  SetPostsToShowUuidsAction,
} from "../../../reducer/post-rows-reducer.ts";

type PostRowsDispatch = Dispatch<
  | PostRowsStringPayloadAction
  | PostRowsNumberPayloadAction
  | PostRowsBooleanPayloadAction
  | PostRowsNoPayloadAction
  | SetPostAttachmentIndexAction
  | AddPostRowAction
  | PostRowsSetMouseOverPostRowUuidAction
  | SetPostsToShowUuidsAction
  | SetPostSliderLeftOrTransitionTimeAction
>;
export default PostRowsDispatch;
