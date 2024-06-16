import { FC, ReactNode, useReducer } from "react";
import RedditListReducer, {
  RedditListState,
} from "../../reducer/reddit-list-reducer.ts";
import {
  RedditListDispatchContext,
  RedditListStateContext,
} from "../reddit-list-context.ts";

const initialState: RedditListState = {
  subredditLists: [],
  modifyListMode: undefined,
  showModifyListBox: false,
  modifyListBoxTitle: "",
  createUpdateInputValue: "",
  createUpdateInputValidationError: "",
  createUpdateButtonText: "",
  updatingListUuid: undefined,
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
