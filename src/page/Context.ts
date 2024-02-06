import { createContext, MouseEvent } from "react";
import { UiPost } from "../model/Post/Post.ts";
import UserFrontPagePostSortOrderOptionsEnum from "../model/config/enums/UserFrontPagePostSortOrderOptionsEnum.ts";

type RootFontSizeContextObj = {
  fontSize: number;
};
export const RootFontSizeContext = createContext<RootFontSizeContextObj>(
  {} as RootFontSizeContextObj
);

type PostCardContextObj = {
  uiPost: UiPost;
  postRowUuid: string;
  userFrontPagePostSortOrderOptionAtRowCreation: UserFrontPagePostSortOrderOptionsEnum;
  handleMouseDownTouchStart: (clientX: number) => void;
  stopPostCardTransition: (uiPost: UiPost, postCardDiv: HTMLDivElement) => void;
  handleMouseUpTouchEnd: () => void;
  handleMouseTouchMove: (clientX: number) => void;
  handlePostCardClickCapture: (event: MouseEvent) => void;
  handleOnMouseEnter: (event: MouseEvent, uiPost: UiPost) => void;
};
export const PostCardContext = createContext({} as PostCardContextObj);
