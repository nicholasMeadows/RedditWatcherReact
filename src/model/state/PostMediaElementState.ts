import { Post } from "../Post/Post.ts";
import { PostImageQualityEnum } from "../config/enums/PostImageQualityEnum.ts";

export default interface PostMediaElementState {
  post: Post;
  postRowUuid: string;
  autoIncrementAttachment: boolean;
  mouseOverPostCard: boolean;
  postImageQuality?: PostImageQualityEnum;
  postCardUuid: string | undefined;
}
