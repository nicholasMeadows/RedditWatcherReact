import React, {
  MouseEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { SideBarActionType } from "../reducer/side-bar-reducer.ts";
import {
  SideBarDispatchContext,
  SideBarStateContext,
} from "../context/side-bar-context.ts";
import { AppConfigStateContext } from "../context/app-config-context.ts";
import SearchRedditBar from "./SearchRedditBar.tsx";
import SearchRedditBarContext from "../context/search-reddit-bar-context.ts";
import useSearchRedditBar from "../hook/use-search-reddit-bar.ts";
import { Subreddit } from "../model/Subreddit/Subreddit.ts";
import {
  ContextMenuDispatchContext,
  ContextMenuStateContext,
} from "../context/context-menu-context.ts";
import { RedditListStateContext } from "../context/reddit-list-context.ts";
import { SubredditLists } from "../model/SubredditList/SubredditLists.ts";
import { SIDE_BAR_SUBREDDIT_LIST_FILTER_NOT_SELECTED } from "../RedditWatcherConstants.ts";
import { ContextMenuActionType } from "../reducer/context-menu-reducer.ts";

type SideBarProps = {
  onRedditSearchBarFocus: () => void;
  onRedditSearchBarBlur: () => void;
};
const SideBar: React.FC<SideBarProps> = ({
  onRedditSearchBarFocus,
  onRedditSearchBarBlur,
}) => {
  const {
    sideBarOpen,
    openSidebarButtonTopPercent,
    subredditsToShowInSideBar,
    mostRecentSubredditGotten,
  } = useContext(SideBarStateContext);
  const { subredditLists } = useContext(RedditListStateContext);
  const sideBarDispatch = useContext(SideBarDispatchContext);
  const { darkMode } = useContext(AppConfigStateContext);
  const { showContextMenu } = useContext(ContextMenuStateContext);
  const contextMenuDispatch = useContext(ContextMenuDispatchContext);

  const [listToFilterByUuid, setListToFilterByUuid] = useState<string>(
    SIDE_BAR_SUBREDDIT_LIST_FILTER_NOT_SELECTED
  );
  const [searchInAvailableSubredditsTerm, setSearchInAvailableSubredditsTerm] =
    useState("");

  const [subredditsInSideBar, setSubredditsInSideBar] = useState<
    Array<Subreddit>
  >([]);
  const [subredditListsInSideBar, setSubredditListsInSideBar] = useState<
    Array<SubredditLists>
  >([]);

  const openSideBarButtonColumnDivRef = useRef<HTMLDivElement>(null);
  const openSideBarButtonDivRef = useRef<HTMLDivElement>(null);
  const subredditListDivRef = useRef<HTMLDivElement>(null);

  const mouseDownOnOpenSidebarButtonRef = useRef<boolean>(false);
  const sideBarButtonMovedRef = useRef(false);
  const mouseOverSubredditListRef = useRef(false);
  const showContextMenuRef = useRef(false);

  useEffect(() => {
    showContextMenuRef.current = showContextMenu;
  }, [showContextMenu]);

  const scrollToMostRecentSubredditGotten = useCallback(() => {
    if (mostRecentSubredditGotten === undefined) {
      return;
    }
    const foundSubredditIndex = subredditsInSideBar.findIndex(
      (subreddit) =>
        subreddit.subredditUuid == mostRecentSubredditGotten.subredditUuid
    );
    if (foundSubredditIndex === -1) {
      return;
    }
    const subredditListDiv = subredditListDivRef.current;
    if (subredditListDiv === null) {
      return;
    }
    const subredditNameElement = subredditListDiv.children[
      foundSubredditIndex
    ] as HTMLParagraphElement;
    const offsetTop = subredditNameElement.offsetTop;
    subredditListDiv.scrollTo({ top: offsetTop, behavior: "smooth" });
  }, [mostRecentSubredditGotten, subredditsInSideBar]);

  useEffect(() => {
    if (!mouseOverSubredditListRef.current && !showContextMenuRef.current) {
      scrollToMostRecentSubredditGotten();
    }
  }, [scrollToMostRecentSubredditGotten]);

  const handleOpenCloseButtonMouseMove = (event: MouseEvent) => {
    if (mouseDownOnOpenSidebarButtonRef.current) {
      sideBarButtonMovedRef.current = true;
      const openSideBarButtonColumnDiv =
        openSideBarButtonColumnDivRef.current as unknown as HTMLDivElement;
      const openSideBarButtonDiv =
        openSideBarButtonDivRef.current as unknown as HTMLDivElement;

      const columnDivBoundingRect =
        openSideBarButtonColumnDiv.getBoundingClientRect();
      const openSideBarButtonBindingRect =
        openSideBarButtonDiv.getBoundingClientRect();

      const buttonHeightPercentage =
        (openSideBarButtonBindingRect.height / columnDivBoundingRect.height) *
        100;
      const minPercentage = buttonHeightPercentage / 2;
      const maxPercentage = 100 - buttonHeightPercentage / 2;

      const relativeColumnMouseY = event.clientY - columnDivBoundingRect.top;

      let updatedPercentage =
        (relativeColumnMouseY / columnDivBoundingRect.height) * 100;
      if (updatedPercentage < minPercentage) {
        updatedPercentage = minPercentage;
      } else if (updatedPercentage > maxPercentage) {
        updatedPercentage = maxPercentage;
      }
      sideBarDispatch({
        type: SideBarActionType.SET_OPEN_SIDEBAR_BUTTON_TOP_PERCENT,
        payload: updatedPercentage,
      });
    }
  };

  const handleOpenCloseBtnMouseDown = () => {
    mouseDownOnOpenSidebarButtonRef.current = true;
  };
  const handleOpenCloseBtnMouseUp = () => {
    mouseDownOnOpenSidebarButtonRef.current = false;
    if (!sideBarButtonMovedRef.current) {
      sideBarDispatch({
        type: SideBarActionType.SET_SIDE_BAR_OPEN,
        payload: !sideBarOpen,
      });
    }
    sideBarButtonMovedRef.current = false;
  };

  const searchRedditBarState = useSearchRedditBar();

  useEffect(() => {
    let subredditsInSideBarToSet = subredditsToShowInSideBar;
    const subredditListsInSideBarToSet = subredditLists.filter((list) => {
      const listSubreddits = list.subreddits;
      const foundSubreddit = listSubreddits.find((subreddit) => {
        const displayNameLowercase = subreddit.displayName.toLowerCase();
        return displayNameLowercase.includes(
          searchInAvailableSubredditsTerm.toLowerCase()
        );
      });
      return foundSubreddit !== undefined;
    });

    subredditsInSideBarToSet = subredditsInSideBarToSet.filter((subreddit) => {
      const displayNameLowerCase = subreddit.displayName.toLowerCase();
      const isValidSubreddit = displayNameLowerCase.includes(
        searchInAvailableSubredditsTerm.toLowerCase()
      );
      if (
        !isValidSubreddit ||
        listToFilterByUuid === SIDE_BAR_SUBREDDIT_LIST_FILTER_NOT_SELECTED
      ) {
        return isValidSubreddit;
      } else {
        const selectedList = subredditListsInSideBarToSet.find(
          (list) => list.subredditListUuid === listToFilterByUuid
        );
        if (selectedList === undefined) {
          return isValidSubreddit;
        }
        const foundSubredditInSelectedList = selectedList.subreddits.find(
          (listSubreddit) => listSubreddit.displayName === subreddit.displayName
        );
        return foundSubredditInSelectedList !== undefined;
      }
    });

    setSubredditsInSideBar(subredditsInSideBarToSet);
    setSubredditListsInSideBar(subredditListsInSideBarToSet);
  }, [
    listToFilterByUuid,
    searchInAvailableSubredditsTerm,
    subredditLists,
    subredditsToShowInSideBar,
  ]);

  return (
    <div className="side-bar">
      <div ref={openSideBarButtonColumnDivRef} className="open-close-column">
        <div
          ref={openSideBarButtonDivRef}
          className="open-close-btn-div"
          style={{
            top: `${openSidebarButtonTopPercent}%`,
          }}
          onMouseMove={(event) => {
            handleOpenCloseButtonMouseMove(event);
          }}
          onMouseDown={() => {
            handleOpenCloseBtnMouseDown();
          }}
          onMouseUp={() => {
            handleOpenCloseBtnMouseUp();
          }}
        >
          <img
            alt={""}
            src={`assets/${sideBarOpen ? "right" : "left"}_chevron_${
              darkMode ? "dark" : "light"
            }_mode.png`}
            draggable={false}
            className="open-close-btn-img"
          />
        </div>
      </div>
      <div
        className={`side-bar-content-div ${
          sideBarOpen ? "side-bar-content-div-open" : ""
        } `}
      >
        <div className="side-bar-search-bar">
          <SearchRedditBarContext.Provider
            value={{
              ...searchRedditBarState,
              onFocus: onRedditSearchBarFocus,
              onBlur: onRedditSearchBarBlur,
            }}
          >
            <SearchRedditBar />
          </SearchRedditBarContext.Provider>
        </div>

        <hr className="hr" />
        <div className="subreddit-list-select-div">
          <label className="subreddit-list-select-label">Subreddit List</label>
          <select
            className="subreddit-list-select"
            value={listToFilterByUuid}
            onChange={(event) => {
              setListToFilterByUuid(event.target.value);
            }}
          >
            <option value={SIDE_BAR_SUBREDDIT_LIST_FILTER_NOT_SELECTED}>
              {SIDE_BAR_SUBREDDIT_LIST_FILTER_NOT_SELECTED}
            </option>
            {subredditListsInSideBar.map((subredditList) => {
              return (
                <option
                  selected={
                    listToFilterByUuid == subredditList.subredditListUuid
                  }
                  key={subredditList.subredditListUuid}
                  value={subredditList.subredditListUuid}
                >
                  {subredditList.listName}
                </option>
              );
            })}
          </select>
        </div>
        <hr className="hr" />

        <div className="search-in-list-div">
          <label className="search-in-list-label">
            Search in available subreddits
          </label>
          <input
            type="text"
            className="search-in-list-input"
            onChange={(event) => {
              setSearchInAvailableSubredditsTerm(event.target.value);
            }}
          />
        </div>
        <hr className="hr" />
        <div
          className="subreddit-list"
          ref={subredditListDivRef}
          onMouseEnter={() => (mouseOverSubredditListRef.current = true)}
          onMouseLeave={() => (mouseOverSubredditListRef.current = false)}
        >
          {subredditsInSideBar.map((subreddit) => (
            <p
              onContextMenu={(event) => {
                event.preventDefault();
                event.stopPropagation();
                contextMenuDispatch({
                  type: ContextMenuActionType.OPEN_CONTEXT_MENU_FOR_SIDE_BAR,
                  payload: {
                    subreddit: subreddit,
                    x: event.clientX,
                    y: event.clientY,
                  },
                });
              }}
              key={subreddit.subredditUuid}
              className={`subreddit-list-item ${
                mostRecentSubredditGotten !== undefined &&
                subreddit.subredditUuid ==
                  mostRecentSubredditGotten.subredditUuid
                  ? "subreddit-list-item-highlight"
                  : ""
              }`}
            >
              {subreddit.displayName}
            </p>
          ))}
        </div>
        <hr className="hr" />
      </div>
    </div>
  );
};

export default SideBar;
