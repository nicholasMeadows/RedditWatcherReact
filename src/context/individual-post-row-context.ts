import { createContext } from "react";
import { Post } from "../model/Post/Post.ts";

type IndividualPostRowContextState = {
  postCardWidthPercentage: number;
  posts: Array<Post>;
  postRowUuid: string;
  shouldAutoScroll: boolean;
};

const IndividualPostRowContext = createContext(
  {} as IndividualPostRowContextState
);
export default IndividualPostRowContext;
