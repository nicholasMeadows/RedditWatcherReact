import { createContext } from "react";
import PostMediaElementZoomContextState from "../model/state/post-media-element-zoom-context-state.ts";

const PostMediaElementZoomContext = createContext(
  {} as PostMediaElementZoomContextState
);
export default PostMediaElementZoomContext;
