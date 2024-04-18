import { SubredditLists } from "../model/SubredditList/SubredditLists.ts";
import { ModifySubredditListMode } from "../model/ModifySubredditListMode.ts";
import { createContext } from "react";

export default interface RedditListContextData {
  subredditLists: Array<SubredditLists>;
  modifyListMode: ModifySubredditListMode | undefined;
  showModifyListBox: boolean;
  modifyListBoxTitle: string;
  createUpdateInputValue: string;
  createUpdateInputValidationError: string;
  createUpdateButtonText: string;
  updatingListUuid: string | undefined;
}
type RedditListContextObj = {
  redditListContextData: RedditListContextData;
  setRedditListContextData: React.Dispatch<
    React.SetStateAction<RedditListContextData>
  >;
};
export const RedditListContext = createContext<RedditListContextObj>(
  {} as RedditListContextObj
);
