import { Post } from "./Post/Post";

export interface PostRow {
  postRowUuid: string;
  posts: Array<Post>;
  postRowContentWidthAtCreation: number;
  lastAutoScrollPostRowState:
    | {
        postsToShow: Array<Post>;
        scrollLeft: number;
      }
    | undefined;
}
