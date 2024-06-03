import React, {
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { SIDE_BAR_SUBREDDIT_LIST_FILTER_NOT_SELECTED } from "../RedditWatcherConstants.ts";
import SideBarSubredditMenuEvent from "../model/Events/SideBarSubredditMenuEvent.ts";
import { useAppDispatch, useAppSelector } from "../redux/store.ts";
import SearchRedditBar from "./SearchRedditBar.tsx";
import { setSideBarSubredditMenuEvent } from "../redux/slice/ContextMenuSlice.ts";
import {
  setListToFilterByUuid,
  setMouseOverSubredditList,
  setOpenSidebarButtonTopPercent,
  setSearchInput,
  subredditListsUpdated,
} from "../redux/slice/SideBarSlice.ts";
import SearchRedditBarContext from "../context/search-reddit-bar-context.ts";
import useSearchRedditBar from "../hook/use-search-reddit-bar.ts";

const SideBar: React.FC = () => {
  const sideBarButtonMoved = useRef(false);
  const dispatch = useAppDispatch();
  const secondsTillGettingNextPosts = useAppSelector(
    (state) => state.sideBar.secondsTillGettingNextPosts
  );
  const sideBarState = useAppSelector((state) => state.sideBar);
  const redditListsState = useAppSelector((state) => state.redditLists);
  const [sideBarOpen, setSideBarOpen] = useState(false);

  const darkMode = useAppSelector((state) => state.appConfig.darkMode);

  const openSideBarButtonColumnDivRef = useRef(null);
  const openSideBarButtonDivRef = useRef(null);
  const subredditListDivRef = useRef(null);
  useEffect(() => {
    dispatch(subredditListsUpdated(redditListsState.subredditLists));
  }, [dispatch, redditListsState.subredditLists]);

  const scrollToMostRecentSubredditGotten = useCallback(() => {
    const foundSubredditIndex = sideBarState.subredditsToShow.findIndex(
      (subreddit) =>
        subreddit.subredditUuid ==
        sideBarState.mostRecentSubredditGotten?.subredditUuid
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
  }, [sideBarState.mostRecentSubredditGotten, sideBarState.subredditsToShow]);

  useEffect(() => {
    if (!sideBarState.mouseOverSubredditList) {
      scrollToMostRecentSubredditGotten();
    }
  }, [
    scrollToMostRecentSubredditGotten,
    sideBarState.mouseOverSubredditList,
    sideBarState.subredditsToShow,
  ]);
  const mouseDownOnOpenSidebarButton = useRef<boolean>(false);

  const handleOpenCloseButtonMouseMove = (event: MouseEvent) => {
    if (mouseDownOnOpenSidebarButton.current) {
      sideBarButtonMoved.current = true;
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
    mouseDownOnOpenSidebarButton.current = true;
  };
  const handleOpenCloseBtnMouseUp = () => {
    mouseDownOnOpenSidebarButton.current = false;
    if (!sideBarButtonMoved.current) {
      setSideBarOpen(!sideBarOpen);
    }
    sideBarButtonMoved.current = false;
  };

  const searchRedditBarContextData = useSearchRedditBar();

  return (
    <div className="side-bar">
      <div ref={openSideBarButtonColumnDivRef} className="open-close-column">
        <div
          ref={openSideBarButtonDivRef}
          className="open-close-btn-div"
          style={{
            top: `${sideBarState.openSidebarButtonTopPercent}%`,
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
          <SearchRedditBarContext.Provider value={searchRedditBarContextData}>
            <SearchRedditBar />
          </SearchRedditBarContext.Provider>
        </div>

        <hr className="hr" />
        <div className="subreddit-list-select-div">
          <label className="subreddit-list-select-label">Subreddit List</label>
          <select
            className="subreddit-list-select"
            value={sideBarState.listToFilterByUuid}
            onChange={(event) => {
              console.log(event.target.value);
              dispatch(
                setListToFilterByUuid({
                  listUuid: event.target.value,
                  subredditLists: redditListsState.subredditLists,
                })
              );
            }}
          >
            <option value={SIDE_BAR_SUBREDDIT_LIST_FILTER_NOT_SELECTED}>
              {SIDE_BAR_SUBREDDIT_LIST_FILTER_NOT_SELECTED}
            </option>
            {sideBarState.availableSubredditListsForFilter.map(
              (subredditList) => {
                return (
                  <option
                    selected={
                      sideBarState.listToFilterByUuid ==
                      subredditList.subredditListUuid
                    }
                    key={subredditList.subredditListUuid}
                    value={subredditList.subredditListUuid}
                  >
                    {subredditList.listName}
                  </option>
                );
              }
            )}
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
              dispatch(
                setSearchInput({
                  searchInput: event.target.value,
                  subredditLists: redditListsState.subredditLists,
                })
              );
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
          {sideBarState.subredditsToShow.map((subreddit) => (
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
                sideBarState.mostRecentSubredditGotten?.subredditUuid
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
            {`Getting next posts in ${secondsTillGettingNextPosts} seconds`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SideBar;