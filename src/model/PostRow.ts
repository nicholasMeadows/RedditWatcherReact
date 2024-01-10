import { Post } from "./Post/Post";

export interface PostRow {
  postRowUuid: string;
  posts: Array<Post>;
  scrollToIndex: number;
  incrementPostInterval: NodeJS.Timeout | undefined;
}
