import { createContext } from "react";

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
