import { UiPost } from "../model/Post/Post.ts";
import UserFrontPagePostSortOrderOptionsEnum from "../model/config/enums/UserFrontPagePostSortOrderOptionsEnum.ts";
import { createContext, MutableRefObject } from "react";

type PostCardContextObj = {
  uiPost: UiPost;
  postRowUuid: string;
  userFrontPagePostSortOrderOptionAtRowCreation: UserFrontPagePostSortOrderOptionsEnum;
  mouseOverPostRow: boolean;
  totalMovementX: MutableRefObject<number>;
};
export const PostCardContext = createContext({} as PostCardContextObj);
