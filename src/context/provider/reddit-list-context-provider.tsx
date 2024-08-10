import { FC, ReactNode, useReducer } from "react";
import {
  RedditListDispatchContext,
  RedditListStateContext,
} from "../reddit-list-context.ts";
import { RedditListState } from "../../model/state/RedditListState.ts";
import RedditListReducer from "../../reducer/reddit-list-reducer.ts";

const initialState: RedditListState = {
  subredditLists: [],
  modifyListMode: undefined,
  showModifyListBox: false,
  modifyListBoxTitle: "",
  createUpdateInputValue: "",
  createUpdateInputValidationError: "",
  createUpdateButtonText: "",
  updatingListUuid: undefined,
  subredditListsLoaded: false,
};
type Props = {
  children: ReactNode;
};
const RedditListContextProvider: FC<Props> = ({ children }) => {
  const [redditListState, dispatch] = useReducer(
    RedditListReducer,
    initialState
  );
  return (
    <RedditListStateContext.Provider value={redditListState}>
      <RedditListDispatchContext.Provider value={dispatch}>
        {children}
      </RedditListDispatchContext.Provider>
    </RedditListStateContext.Provider>
  );
};

export default RedditListContextProvider;
