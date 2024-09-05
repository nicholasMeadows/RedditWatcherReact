import { Dispatch } from "react";
import {
  AddPostRowAction,
  PostRowPageBooleanPayloadAction,
  PostRowPageNoPayloadAction,
  PostRowPageNumberPayloadAction,
  PostRowPageSetMouseOverPostRowUuidAction,
  PostRowPageStringPayloadAction,
  SetPostAttachmentIndexAction,
  SetPostSliderLeftOrTransitionTimeAction,
  SetPostsToShowUuidsAction,
} from "../../../reducer/post-row-page-reducer.ts";

type PostRowPageDispatch = Dispatch<
  | PostRowPageStringPayloadAction
  | PostRowPageNumberPayloadAction
  | PostRowPageBooleanPayloadAction
  | PostRowPageNoPayloadAction
  | SetPostAttachmentIndexAction
  | AddPostRowAction
  | PostRowPageSetMouseOverPostRowUuidAction
  | SetPostsToShowUuidsAction
  | SetPostSliderLeftOrTransitionTimeAction
>;
export default PostRowPageDispatch;
