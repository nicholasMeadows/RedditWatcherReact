import { Dispatch } from "react";
import {
  AddPostRowAction,
  PostRowPageBooleanPayloadAction,
  PostRowPageNoPayloadAction,
  PostRowPageNumberPayloadAction,
  PostRowPageSetMouseOverPostRowUuidAction,
  PostRowPageStringPayloadAction,
  SetPostAttachmentIndexAction,
  SetPostCardsAction,
  SetPostSliderLeftOrTransitionTimeAction,
  SetShowPostCardInfoOnPostUuidAction,
} from "../../../reducer/post-row-page-reducer.ts";

type PostRowPageDispatch = Dispatch<
  | PostRowPageStringPayloadAction
  | PostRowPageNumberPayloadAction
  | PostRowPageBooleanPayloadAction
  | PostRowPageNoPayloadAction
  | SetPostAttachmentIndexAction
  | AddPostRowAction
  | PostRowPageSetMouseOverPostRowUuidAction
  | SetPostCardsAction
  | SetPostSliderLeftOrTransitionTimeAction
  | SetShowPostCardInfoOnPostUuidAction
>;
export default PostRowPageDispatch;
