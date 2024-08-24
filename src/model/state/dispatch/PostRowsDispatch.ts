import { Dispatch } from "react";
import {
  AddPostRowAction,
  PostRowsBooleanPayloadAction,
  PostRowsNoPayloadAction,
  PostRowsNumberPayloadAction,
  PostRowsSetMouseOverPostRowUuidAction,
  PostRowsStringPayloadAction,
  SetPostAttachmentIndexAction,
  SetPostsToShowAndPostSliderLeftAndTransitionTimeAction,
} from "../../../reducer/post-rows-reducer.ts";

type PostRowsDispatch = Dispatch<
  | PostRowsStringPayloadAction
  | PostRowsNumberPayloadAction
  | PostRowsBooleanPayloadAction
  | PostRowsNoPayloadAction
  | SetPostAttachmentIndexAction
  | AddPostRowAction
  | PostRowsSetMouseOverPostRowUuidAction
  | SetPostsToShowAndPostSliderLeftAndTransitionTimeAction
>;
export default PostRowsDispatch;
