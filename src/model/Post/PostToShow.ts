import { Post } from "./Post.ts";

export interface PostToShow extends Post {
  postToShowUuid: string;
}
