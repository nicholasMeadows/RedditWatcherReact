import {
  ContextMenuDispatchContext,
  ContextMenuStateContext,
} from "../context-menu-context.ts";
import { FC, ReactNode, useReducer } from "react";
import ContextMenuReducer, {
  ContextMenuState,
} from "../../reducer/context-menu-reducer.ts";

type Props = {
  children: ReactNode;
};
const initialState: ContextMenuState = {
  showContextMenu: false,
  x: 0,
  y: 0,
  copyInfo: undefined,
  subreddit: undefined,
  updateSubredditListInfo: undefined,
  openPostPermaLink: undefined,
  openSubredditLink: undefined,
  showButtonControls: {
    showOpenImageInNewTab: false,
    showOpenPost: false,
    showOpenSubreddit: false,
    showCopy: false,
    showSkipToSubreddit: false,
    showAddToList: false,
    expandAddToList: false,
    showRemoveFromList: false,
    expandRemoveFromList: false,
    showUpdateListName: false,
    showDeleteList: false,
  },
};
const ContextMenuContextProvider: FC<Props> = ({ children }) => {
  const [contextMenuState, dispatch] = useReducer(
    ContextMenuReducer,
    initialState
  );
  return (
    <ContextMenuStateContext.Provider value={contextMenuState}>
      <ContextMenuDispatchContext.Provider value={dispatch}>
        {children}
      </ContextMenuDispatchContext.Provider>
    </ContextMenuStateContext.Provider>
  );
};
export default ContextMenuContextProvider;
