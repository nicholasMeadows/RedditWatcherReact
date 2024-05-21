import UserFrontPagePostSortOrderOptionsEnum from "../model/config/enums/UserFrontPagePostSortOrderOptionsEnum.ts";
import { createContext } from "react";
import { Post } from "../model/Post/Post.ts";

type PostCardContextObj = {
  postRowUuid: string;
  post: Post;
  userFrontPagePostSortOrderOptionAtRowCreation: UserFrontPagePostSortOrderOptionsEnum;
  mouseOverPostRow: boolean;
};
export const PostCardContext = createContext({} as PostCardContextObj);
