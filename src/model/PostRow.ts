import { Post } from "./Post/Post";
import SubredditSourceOptionsEnum from "./config/enums/SubredditSourceOptionsEnum.ts";
import PostSortOrderOptionsEnum from "./config/enums/PostSortOrderOptionsEnum.ts";

export type PostsToShowUuidsObj = {
  postUuid: string;
  uiUuid: string;
};

export interface PostRow {
  postRowUuid: string;
  posts: Array<Post>;
  gottenWithSubredditSourceOption: SubredditSourceOptionsEnum;
  gottenWithPostSortOrderOption: PostSortOrderOptionsEnum;
  postSliderLeft: number;
  postSliderLeftTransitionTime: number;
  postsToShowUuids: Array<PostsToShowUuidsObj>;
}
