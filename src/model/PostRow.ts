import { Post } from "./Post/Post";

export interface PostRow {
  postRowUuid: string;
  posts: Array<Post>;
  shouldAutoScroll: boolean;
  postRowContentWidthAtCreation: number;
}
