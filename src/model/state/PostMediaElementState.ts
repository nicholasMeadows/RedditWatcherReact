import { Post } from "../Post/Post.ts";
import { PostImageQualityEnum } from "../config/enums/PostImageQualityEnum.ts";
import { MouseEvent } from "react";

export default interface PostMediaElementState {
  post: Post;
  postRowUuid: string;
  autoIncrementAttachment: boolean;
  mouseOverPostCard: boolean;
  postImageQuality?: PostImageQualityEnum;
  onElementMouseEnter?: (event: MouseEvent) => void;
  onElementMouseLeave?: (event: MouseEvent) => void;
}
