import { Post, UiPost } from "./Post/Post";
import UserFrontPagePostSortOrderOptionsEnum from "./config/enums/UserFrontPagePostSortOrderOptionsEnum.ts";

export interface PostRow {
  postRowUuid: string;
  posts: Array<Post>;
  uiPosts: Array<UiPost>;
  postRowContentWidthAtCreation: number;
  userFrontPagePostSortOrderOptionAtRowCreation: UserFrontPagePostSortOrderOptionsEnum;
}
