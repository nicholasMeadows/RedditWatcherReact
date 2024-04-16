import React, { MouseEvent, useCallback, useEffect, useRef } from "react";
import { SIDE_BAR_SUBREDDIT_LIST_FILTER_NOT_SELECTED } from "../RedditWatcherConstants.ts";
import SideBarSubredditMenuEvent from "../model/Events/SideBarSubredditMenuEvent.ts";
import {
  decreaseTimeTillNextGetPostsSeconds,
  setListToFilterByUuid,
  setMouseDownOnOpenSidebarButton,
  setMouseOverSubredditList,
  setOpenSidebarButtonTopPercent,
  setSearchInput,
  setSideBarButtonMoved,
  setSideBarOpen,
  subredditListsUpdated,
} from "../redux/slice/SideBarSlice.ts";
import { useAppDispatch, useAppSelector } from "../redux/store.ts";
import SearchRedditBar from "./ModifySubredditListsPagesAndElements/SearchRedditBar.tsx";
import { useContextMenu } from "../hook/use-context-menu.ts";

const SideBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const contextMenu = useContextMenu();
  const darkMode = useAppSelector((state) => state.appConfig.darkMode);
  const subredditLists = useAppSelector(
    (state) => state.subredditLists.subredditLists
  );
  const subredditsToShow = useAppSelector(
    (state) => state.sideBar.subredditsToShow
  );
  const mostRecentSubredditGotten = useAppSelector(
    (state) => state.sideBar.mostRecentSubredditGotten
  );

  const availableSubredditListsForFilter = useAppSelector(
    (state) => state.sideBar.availableSubredditListsForFilter
  );
  const listToFilterByUuid = useAppSelector(
    (state) => state.sideBar.listToFilterByUuid
  );

  const sideBarOpen = useAppSelector((state) => state.sideBar.sideBarOpen);

  const sideBarButtonMoved = useAppSelector(
    (state) => state.sideBar.sideBarButtonMoved
  );
  const mouseDownOnOpenSidebarButton = useAppSelector(
    (state) => state.sideBar.mouseDownOnOpenSidebarButton
  );
  const openSidebarButtonTopPercent = useAppSelector(
    (state) => state.sideBar.openSidebarButtonTopPercent
  );

  const mouseOverSubredditList = useAppSelector(
    (state) => state.sideBar.mouseOverSubredditList
  );

  const openSideBarButtonColumnDivRef = useRef(null);
  const openSideBarButtonDivRef = useRef(null);
  const subredditListDivRef = useRef(null);
  useEffect(() => {
    dispatch(subredditListsUpdated());
  }, [dispatch, subredditLists]);

  const scrollToMostRecentSubredditGotten = useCallback(() => {
    const foundSubredditIndex = subredditsToShow.findIndex(
      (subreddit) =>
        subreddit.subredditUuid == mostRecentSubredditGotten?.subredditUuid
    );
    if (foundSubredditIndex >= 0) {
      const subredditListDiv =
        subredditListDivRef.current as unknown as HTMLDivElement;
      const subredditNameElement = subredditListDiv.children[
        foundSubredditIndex
      ] as HTMLParagraphElement;
      const offsetTop = subredditNameElement.offsetTop;
      subredditListDiv.scrollTo({ top: offsetTop, behavior: "smooth" });
    }
  }, [mostRecentSubredditGotten, subredditsToShow]);

  useEffect(() => {
    if (!mouseOverSubredditList) {
      scrollToMostRecentSubredditGotten();
    }
  }, [
    scrollToMostRecentSubredditGotten,
    mouseOverSubredditList,
    mostRecentSubredditGotten,
    subredditsToShow,
  ]);
  const handleOpenCloseButtonMouseMove = (event: MouseEvent) => {
    if (mouseDownOnOpenSidebarButton) {
      dispatch(setSideBarButtonMoved(true));
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
      dispatch(setOpenSidebarButtonTopPercent(updatedPercentage));
    }
  };

  const handleOpenCloseBtnMouseDown = () => {
    dispatch(setMouseDownOnOpenSidebarButton(true));
  };
  const handleOpenCloseBtnMouseUp = () => {
    dispatch(setMouseDownOnOpenSidebarButton(false));
    if (!sideBarButtonMoved) {
      dispatch(setSideBarOpen(!sideBarOpen));
    }
    dispatch(setSideBarButtonMoved(false));
  };

  const timeTillNextGetPostsSeconds = useAppSelector(
    (state) => state.sideBar.timeTillNextGetPostsSeconds
  );

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(decreaseTimeTillNextGetPostsSeconds());
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [dispatch]);
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
          <SearchRedditBar darkmodeOverride={false} />
        </div>

        <hr className="hr" />
        <div className="subreddit-list-select-div">
          <label className="subreddit-list-select-label">Subreddit List</label>
          <select
            className="subreddit-list-select"
            value={listToFilterByUuid}
            onChange={(event) => {
              console.log(event.target.value);
              dispatch(setListToFilterByUuid(event.target.value));
            }}
          >
            <option value={SIDE_BAR_SUBREDDIT_LIST_FILTER_NOT_SELECTED}>
              {SIDE_BAR_SUBREDDIT_LIST_FILTER_NOT_SELECTED}
            </option>
            {availableSubredditListsForFilter.map((subredditList) => {
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
              dispatch(setSearchInput(event.target.value));
            }}
          />
        </div>
        <hr className="hr" />
        <div
          className="subreddit-list"
          ref={subredditListDivRef}
          onMouseEnter={() => dispatch(setMouseOverSubredditList(true))}
          onMouseLeave={() => dispatch(setMouseOverSubredditList(false))}
        >
          {subredditsToShow.map((subreddit) => (
            <p
              onContextMenu={(event) => {
                event.preventDefault();
                event.stopPropagation();
                const subredditContextMenuEvent: SideBarSubredditMenuEvent = {
                  subreddit: subreddit,
                  x: event.clientX,
                  y: event.clientY,
                };
                contextMenu.setSideBarSubredditMenuEvent(
                  subredditContextMenuEvent
                );
              }}
              key={subreddit.subredditUuid}
              className={`subreddit-list-item ${
                subreddit.subredditUuid ==
                mostRecentSubredditGotten?.subredditUuid
                  ? "subreddit-list-item-highlight"
                  : ""
              }`}
            >
              {subreddit.displayName}
            </p>
          ))}
        </div>

        <hr className="hr" />

        <div className={"next-post-countdown-timer-text-box"}>
          <p className={"next-post-countdown-timer-text"}>
            {`Getting next posts in ${timeTillNextGetPostsSeconds} seconds`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
