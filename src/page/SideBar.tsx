import React, {
  MouseEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { SIDE_BAR_SUBREDDIT_LIST_FILTER_NOT_SELECTED } from "../RedditWatcherConstants.ts";
import SideBarSubredditMenuEvent from "../model/Events/SideBarSubredditMenuEvent.ts";
import { useAppDispatch, useAppSelector } from "../redux/store.ts";
import SearchRedditBar from "./ModifySubredditListsPagesAndElements/SearchRedditBar.tsx";
import { useContextMenu } from "../hook/use-context-menu.ts";
import useSideBar from "../hook/use-side-bar.ts";
import { SideBarContext } from "../context/side-bar-context.ts";

const SideBar: React.FC = () => {
  const sideBarButtonMoved = useRef(false);
  const dispatch = useAppDispatch();
  const contextMenu = useContextMenu();
  const sideBar = useSideBar();
  const { sidebarContextData } = useContext(SideBarContext);
  const [sideBarOpen, setSideBarOpen] = useState(false);

  const darkMode = useAppSelector((state) => state.appConfig.darkMode);
  const subredditLists = useAppSelector(
    (state) => state.subredditLists.subredditLists
  );

  const openSideBarButtonColumnDivRef = useRef(null);
  const openSideBarButtonDivRef = useRef(null);
  const subredditListDivRef = useRef(null);
  useEffect(() => {
    sideBar.subredditListsUpdated();
  }, [dispatch, subredditLists]);

  const scrollToMostRecentSubredditGotten = useCallback(() => {
    const foundSubredditIndex = sidebarContextData.subredditsToShow.findIndex(
      (subreddit) =>
        subreddit.subredditUuid ==
        sidebarContextData.mostRecentSubredditGotten?.subredditUuid
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
  }, [
    sidebarContextData.mostRecentSubredditGotten,
    sidebarContextData.subredditsToShow,
  ]);

  useEffect(() => {
    if (!sidebarContextData.mouseOverSubredditList) {
      scrollToMostRecentSubredditGotten();
    }
  }, [
    scrollToMostRecentSubredditGotten,
    sidebarContextData.mouseOverSubredditList,
    sidebarContextData.subredditsToShow,
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
      sideBar.setOpenSidebarButtonTopPercent(updatedPercentage);
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

  useEffect(() => {
    const interval = setInterval(() => {
      sideBar.decreaseTimeTillNextGetPostsSeconds();
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [dispatch, sideBar]);

  return (
    <div className="side-bar">
      <div ref={openSideBarButtonColumnDivRef} className="open-close-column">
        <div
          ref={openSideBarButtonDivRef}
          className="open-close-btn-div"
          style={{
            top: `${sidebarContextData.openSidebarButtonTopPercent}%`,
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
            value={sidebarContextData.listToFilterByUuid}
            onChange={(event) => {
              console.log(event.target.value);
              sideBar.setListToFilterByUuid(event.target.value);
            }}
          >
            <option value={SIDE_BAR_SUBREDDIT_LIST_FILTER_NOT_SELECTED}>
              {SIDE_BAR_SUBREDDIT_LIST_FILTER_NOT_SELECTED}
            </option>
            {sidebarContextData.availableSubredditListsForFilter.map(
              (subredditList) => {
                return (
                  <option
                    selected={
                      sidebarContextData.listToFilterByUuid ==
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
              sideBar.setSearchInput(event.target.value);
            }}
          />
        </div>
        <hr className="hr" />
        <div
          className="subreddit-list"
          ref={subredditListDivRef}
          onMouseEnter={() => sideBar.setMouseOverSubredditList(true)}
          onMouseLeave={() => sideBar.setMouseOverSubredditList(false)}
        >
          {sidebarContextData.subredditsToShow.map((subreddit) => (
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
                sidebarContextData.mostRecentSubredditGotten?.subredditUuid
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
            {`Getting next posts in ${sidebarContextData.timeTillNextGetPostsSeconds} seconds`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
