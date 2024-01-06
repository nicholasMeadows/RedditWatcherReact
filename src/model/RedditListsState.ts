import { SubredditLists } from "./SubredditList/SubredditLists.ts";
import { ModifySubredditListMode } from "./ModifySubredditListMode.ts";

export default interface RedditListsState {
  subredditLists: Array<SubredditLists>;
  subredditListsLoaded: boolean;
  modifyListMode: ModifySubredditListMode | undefined;
  showModifyListBox: boolean;
  modifyListBoxTitle: string;
  createUpdateInputValue: string;
  createUpdateInputValidationError: string;
  createUpdateButtonText: string;
  updatingListUuid: string | undefined;
}
