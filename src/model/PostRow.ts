import { Post } from "./Post/Post";
import SubredditSourceOptionsEnum from "./config/enums/SubredditSourceOptionsEnum.ts";
import PostSortOrderOptionsEnum from "./config/enums/PostSortOrderOptionsEnum.ts";
import PostCard from "./PostCard.ts";

export interface PostRow {
  postRowUuid: string;
  allPosts: Array<Post>;
  gottenWithSubredditSourceOption: SubredditSourceOptionsEnum;
  gottenWithPostSortOrderOption: PostSortOrderOptionsEnum;
  postSliderLeft: number;
  postSliderLeftTransitionTime: number;
  postCards: Array<PostCard>;
}
