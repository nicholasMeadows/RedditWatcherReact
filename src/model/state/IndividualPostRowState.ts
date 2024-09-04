import { Post } from "../Post/Post.ts";
import { PostsToShowUuidsObj } from "../PostRow.ts";
import SubredditSourceOptionsEnum from "../config/enums/SubredditSourceOptionsEnum.ts";

export interface IndividualPostRowState {
  posts: Array<Post>;
  postRowUuid: string;
  postSliderLeft: number;
  postSliderLeftTransitionTime: number;
  postsToShowUuids: Array<PostsToShowUuidsObj>;
  gottenWithSubredditSourceOption: SubredditSourceOptionsEnum;
}
