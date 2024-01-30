import { Post, UiPost } from "./Post/Post";

export interface PostRow {
  postRowUuid: string;
  posts: Array<Post>;
  uiPosts: Array<UiPost>;
}
