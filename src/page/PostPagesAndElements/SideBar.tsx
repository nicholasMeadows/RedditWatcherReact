import React, { MouseEvent, useEffect, useRef } from "react";
import { SIDE_BAR_SUBREDDIT_LIST_FILTER_NOT_SELECTED } from "../../RedditWatcherConstants";
import SideBarSubredditMenuEvent from "../../model/Events/SideBarSubredditMenuEvent";
import { setSideBarSubredditMenuEvent } from "../../redux/slice/ContextMenuSlice";
import {
  setListToFilterByUuid,
  setMouseDownOnOpenSidebarButton,
  setOpenSidebarButtonTopPercent,
  setSideBarButtonMoved,
  setSideBarOpen,
  subredditListsUpdated,
} from "../../redux/slice/SideBarSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import SearchRedditBar from "../ModifySubredditListsPagesAndElements/SearchRedditBar";
const SideBar: React.FC = () => {
  const dispatch = useAppDispatch();
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

  const openSideBarButtonColumnDivRef = useRef(null);
  const openSideBarButtonDivRef = useRef(null);
  const subredditListDivRef = useRef(null);
  useEffect(() => {
    dispatch(subredditListsUpdated(subredditLists));
  }, [dispatch, subredditLists]);

  useEffect(() => {
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
        <div className="search-bar">
          <SearchRedditBar />
          <hr className="hr" />
        </div>
        <div className="subreddit-list-select-div">
          <label className="subreddit-list-select-label">Subreddit List</label>
          <select
            className="subreddit-list-select"
            value={listToFilterByUuid}
            onChange={(event) => {
              console.log(event.target.value);
              dispatch(
                setListToFilterByUuid({
                  listUuid: event.target.value,
                  subredditLists: subredditLists,
                })
              );
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

        <div className="subreddit-list" ref={subredditListDivRef}>
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
                dispatch(
                  setSideBarSubredditMenuEvent({
                    event: subredditContextMenuEvent,
                  })
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
      </div>
    </div>
  );
};

export default SideBar;