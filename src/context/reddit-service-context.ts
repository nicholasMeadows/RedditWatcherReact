import { createContext } from "react";
import RedditService from "../service/RedditService.ts";

export const RedditServiceContext = createContext<RedditService>(
  {} as RedditService
);
