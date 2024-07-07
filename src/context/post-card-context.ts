import { createContext } from "react";
import { Post } from "../model/Post/Post.ts";

type PostCardContextObj = {
  postRowUuid: string;
  post: Post;
};
export const PostCardContext = createContext({} as PostCardContextObj);
