import { Post } from "../Post/Post.ts";

export interface PostCardState {
  postRowUuid: string;
  post: Post;
}
