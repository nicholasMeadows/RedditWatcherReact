import { SideBarState } from "../../model/state/SideBarState.ts";
import { FC, ReactNode, useReducer } from "react";
import SideBarReducer from "../../reducer/side-bar-reducer.ts";
import {
  SideBarDispatchContext,
  SideBarStateContext,
} from "../side-bar-context.ts";

type Props = {
  children: ReactNode;
};
const SideBarContextProvider: FC<Props> = ({ children }) => {
  const initialState: SideBarState = {
    sideBarOpen: false,
    openSidebarButtonTopPercent: 50,
    subredditsToShowInSideBar: [],
    mostRecentSubredditGotten: undefined,
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
