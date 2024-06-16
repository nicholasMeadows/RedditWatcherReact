import { FC, ReactNode, useReducer } from "react";
import {
  SideBarDispatchContext,
  SideBarStateContext,
} from "../side-bar-context.ts";
import SideBarReducer, {
  SideBarActionType,
  SideBarState,
} from "../../reducer/side-bar-reducer.ts";
import { SIDE_BAR_SUBREDDIT_LIST_FILTER_NOT_SELECTED } from "../../RedditWatcherConstants.ts";
import { Subreddit } from "../../model/Subreddit/Subreddit.ts";
import { SubredditLists } from "../../model/SubredditList/SubredditLists.ts";

type Props = {
  children: ReactNode;
};

const SideBarContextProvider: FC<Props> = ({ children }) => {
  const decreaseSecondsTillGettingNextPosts = () => {
    const secondsTillGettingNextPosts =
      sideBarState.secondsTillGettingNextPosts;
    if (secondsTillGettingNextPosts > 0) {
      dispatch({
        type: SideBarActionType.SET_SECONDS_TILL_GETTING_NEXT_POSTS,
        payload: secondsTillGettingNextPosts - 1,
      });
    }
  };
  const initialState: SideBarState = {
    subredditsToShowInSideBar: new Array<Subreddit>(),
    subredditsToShow: new Array<Subreddit>(),
    mostRecentSubredditGotten: undefined,
    availableSubredditListsForFilter: new Array<SubredditLists>(),
    listToFilterByUuid: SIDE_BAR_SUBREDDIT_LIST_FILTER_NOT_SELECTED,
    searchInput: "",
    sideBarOpen: false,
    openSidebarButtonTopPercent: 50,
    mouseOverSubredditList: false,
    secondsTillGettingNextPosts: 0,
    decreaseSecondsTillNextPostsSecondsInterval: setInterval(
      decreaseSecondsTillGettingNextPosts,
      1000
    ),
  };
  const [sideBarState, dispatch] = useReducer(SideBarReducer, initialState);

  return (
    <SideBarStateContext.Provider value={sideBarState}>
      <SideBarDispatchContext.Provider value={dispatch}>
        {children}
      </SideBarDispatchContext.Provider>
    </SideBarStateContext.Provider>
  );
};
export default SideBarContextProvider;
