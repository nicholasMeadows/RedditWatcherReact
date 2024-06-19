import { Post } from "./Post/Post";
import UserFrontPagePostSortOrderOptionsEnum from "./config/enums/UserFrontPagePostSortOrderOptionsEnum.ts";

export interface PostRow {
  postRowUuid: string;
  posts: Array<Post>;
  postRowContentWidthAtCreation: number;
  userFrontPagePostSortOrderOptionAtRowCreation: UserFrontPagePostSortOrderOptionsEnum;
  lastAutoScrollPostRowState:
    | {
        postsToShow: Array<Post>;
        scrollLeft: number;
      }
    | undefined;
}
