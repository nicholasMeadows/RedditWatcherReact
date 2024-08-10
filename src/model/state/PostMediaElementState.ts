import { Post } from "../Post/Post.ts";
import { MouseEventHandler, TouchEventHandler, WheelEventHandler } from "react";
import { PostImageQualityEnum } from "../config/enums/PostImageQualityEnum.ts";

export default interface PostMediaElementState {
  post: Post;
  currentAttachmentIndex: number;
  decrementPostAttachment: () => void;
  incrementPostAttachment: () => void;
  jumpToPostAttachment: (index: number) => void;
  autoIncrementAttachments?: boolean;
  scale?: number;
  imgXPercent?: number;
  imgYPercent?: number;
  onMouseOut?: MouseEventHandler;
  onMouseDown?: MouseEventHandler;
  onMouseUp?: MouseEventHandler;
  onMouseMove?: MouseEventHandler;
  onWheel?: WheelEventHandler;
  onTouchStart?: TouchEventHandler;
  onTouchMove?: TouchEventHandler;
  carouselLeftButtonClick?: () => void;
  carouselRightButtonClick?: () => void;
  postImageQuality?: PostImageQualityEnum;
}
