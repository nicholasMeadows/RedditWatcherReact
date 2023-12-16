import React, { MouseEvent, useEffect, useRef, useState } from "react";
import { NAVIGATION_HAMBURGER_TOOLBAR_HEIGHT } from "../../RedditWatcherConstants";
import { useAppSelector } from "../../redux/store";
import SearchRedditBar from "../ModifySubredditListsPagesAndElements/SearchRedditBar";
const SideBar: React.FC = () => {
  const darkMode = useAppSelector((state) => state.appConfig.darkMode);
  const subredditsToShowInSideBar = useAppSelector(
    (state) => state.redditClient.subredditsToShowInSideBar
  );

  const mostRecentSubredditGotten = useAppSelector(
    (state) => state.redditClient.mostRecentSubredditGotten
  );

  const [mouseDownOnOpenSidebarButton, setMouseDownOnOpenSidebarButton] =
    useState(false);
  const [openSidebarButtonTopPercent, setOpenSidebarButtonTopPercent] =
    useState(50);

  const [sideBarOpen, setSideBarOpen] = useState(false);
  const [sideBarButtonMoved, setSideBarButtonMoved] = useState(false);

  const sideBarButtonAndContentContainerRef = useRef(null);
  const openSideBarButtonColumnDivRef = useRef(null);
  const openSideBarButtonDivRef = useRef(null);
  const subredditListDivRef = useRef(null);

  useEffect(() => {
    const foundSubredditIndex = subredditsToShowInSideBar.findIndex(
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
  }, [mostRecentSubredditGotten, subredditsToShowInSideBar]);
  const handleOpenCloseButtonMouseMove = (event: MouseEvent) => {
    if (mouseDownOnOpenSidebarButton) {
      setSideBarButtonMoved(true);
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
      setOpenSidebarButtonTopPercent(updatedPercentage);
    }
  };

  const handleOpenCloseBtnMouseDown = () => {
    setMouseDownOnOpenSidebarButton(true);
  };
  const handleOpenCloseBtnMouseUp = () => {
    setMouseDownOnOpenSidebarButton(false);
    if (!sideBarButtonMoved) {
      setSideBarOpen(!sideBarOpen);
    }
    setSideBarButtonMoved(false);
  };
  return (
    <div className="side-bar-relative-root">
      <div
        ref={sideBarButtonAndContentContainerRef}
        className="side-bar-fixed-div"
        style={{
          top: `calc( -0.2em + ${NAVIGATION_HAMBURGER_TOOLBAR_HEIGHT})`,
          // left: `calc( 100% - ${containerLeftOffset}px )`,
        }}
      >
        <div className="side-bar-button-and-context-flex">
          <div
            ref={openSideBarButtonColumnDivRef}
            className="button-column"
            onMouseMove={(event) => {
              handleOpenCloseButtonMouseMove(event);
            }}
          >
            <div
              ref={openSideBarButtonDivRef}
              className="open-close-btn-div"
              style={{
                top: `${openSidebarButtonTopPercent}%`,
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
            }`}
          >
            <div className="searchbar">
              <SearchRedditBar />
              <hr className="hr" />
            </div>

            <div className="subreddit-list" ref={subredditListDivRef}>
              {subredditsToShowInSideBar.map((subreddit) => (
                <p
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
      </div>
    </div>
  );
};

export default SideBar;
