import { createContext, MutableRefObject } from "react";
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
  mouseOverPostRow: boolean;
  totalMovementX: MutableRefObject<number>;
};
export const PostCardContext = createContext({} as PostCardContextObj);

export const AutoScrollPostRowRateSecondsForSinglePostCardContext =
  createContext(5000);

type singlePostPageContextData = {
  postRowUuid: string | undefined;
  postUuid: string | undefined;
  setSinglePostPagePostRowUuid: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  setSinglePostPagePostUuid: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
};
export const SinglePostPageContext = createContext<singlePostPageContextData>({
  postRowUuid: undefined,
  postUuid: undefined,
  setSinglePostPagePostRowUuid: () => {},
  setSinglePostPagePostUuid: () => {},
});
