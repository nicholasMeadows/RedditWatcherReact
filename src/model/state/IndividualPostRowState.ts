import { Post } from "../Post/Post.ts";

export interface IndividualPostRowState {
  postCardWidthPercentage: number;
  posts: Array<Post>;
  postRowUuid: string;
  shouldAutoScroll: boolean;
}
