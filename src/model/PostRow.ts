import { Post } from "./Post/Post";
import SubredditSourceOptionsEnum from "./config/enums/SubredditSourceOptionsEnum.ts";
import PostSortOrderOptionsEnum from "./config/enums/PostSortOrderOptionsEnum.ts";

export interface PostRow {
  postRowUuid: string;
  posts: Array<Post>;
  shouldAutoScroll: boolean;
  gottenWithSubredditSourceOption: SubredditSourceOptionsEnum;
  gottenWithPostSortOrderOption: PostSortOrderOptionsEnum;
}
