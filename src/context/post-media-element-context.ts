import { Post } from "../model/Post/Post.ts";
import {
  createContext,
  MouseEventHandler,
  TouchEventHandler,
  WheelEventHandler,
} from "react";
import { PostImageQualityEnum } from "../model/config/enums/PostImageQualityEnum.ts";

type PostMediaElementState = {
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
};

const PostMediaElementContext = createContext<PostMediaElementState>(
  {} as PostMediaElementState
);
export default PostMediaElementContext;
