import { createContext } from "react";
import { PostCardState } from "../model/state/PostCardState.ts";

export const PostCardContext = createContext({} as PostCardState);
