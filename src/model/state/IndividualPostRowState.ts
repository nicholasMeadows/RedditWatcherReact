import { Post } from "../Post/Post.ts";
import SubredditSourceOptionsEnum from "../config/enums/SubredditSourceOptionsEnum.ts";
import PostCard from "../PostCard.ts";
import { PostRow } from "../PostRow.ts";

export interface IndividualPostRowState {
  allPosts: Array<Post>;
  postRowUuid: string;
  postSliderLeft: number;
  postSliderLeftTransitionTime: number;
  postCards: Array<PostCard>;
  gottenWithSubredditSourceOption: SubredditSourceOptionsEnum;
  scrollY: number;
  postRows: Array<PostRow>;
}
