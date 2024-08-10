import { createContext } from "react";
import PostMediaElementState from "../model/state/PostMediaElementState.ts";

const PostMediaElementContext = createContext<PostMediaElementState>(
  {} as PostMediaElementState
);
export default PostMediaElementContext;
