import { SubredditLists } from "../SubredditList/SubredditLists.ts";
import { ModifySubredditListMode } from "../ModifySubredditListMode.ts";

export type RedditListState = {
  subredditListsLoaded: boolean;
  subredditLists: Array<SubredditLists>;
  modifyListMode: ModifySubredditListMode | undefined;
  showModifyListBox: boolean;
  createUpdateInputValue: string;
  createUpdateInputValidationError: string;
  updatingListUuid: string | undefined;
};
