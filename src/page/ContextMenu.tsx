import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { SubredditLists } from "../model/SubredditList/SubredditLists";
import {
  addSubredditToList,
  removeSubredditFromList,
  showDeleteListConfirmationBox,
  showUpdateListBox,
} from "../redux/slice/RedditListsSlice";
import { addSubredditToQueue } from "../redux/slice/RedditClientSlice";
import {
  closeContextMenu,
  onCopyClick,
  setExpandAddToList,
  setExpandRemoveToList,
} from "../redux/slice/ContextMenuSlice";

const ContextMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const showContextMenu = useAppSelector(
    (state) => state.contextMenu.showContextMenu
  );
  const xFromState = useAppSelector((state) => state.contextMenu.x);
  const yFromState = useAppSelector((state) => state.contextMenu.y);
  const showButtonControls = useAppSelector(
    (state) => state.contextMenu.showButtonControls
  );
  const copyInfo = useAppSelector((state) => state.contextMenu.copyInfo);
  const updateSubredditListInfo = useAppSelector(
    (state) => state.contextMenu.updateSubredditListInfo
  );
  const subredditLists = useAppSelector(
    (state) => state.subredditLists.subredditLists
  );
  const subreddit = useAppSelector((state) => state.contextMenu.subreddit);
  const openPostLink = useAppSelector(
    (state) => state.contextMenu.openPostPermaLink
  );
  const openSubredditLink = useAppSelector(
    (state) => state.contextMenu.openSubredditLink
  );
  const expandAddToList = useAppSelector(
    (state) => state.contextMenu.showButtonControls.expandAddToList
  );
  const expandRemoveFromList = useAppSelector(
    (state) => state.contextMenu.showButtonControls.expandRemoveFromList
  );

  const [contextMenuX, setContextMenuX] = useState(0);
  const [contextMenuY, setContextMenuY] = useState(0);

  const [subredditListsThatSubredditIsIn, setSubredditListsThatSubredditIsIn] =
    useState<Array<SubredditLists>>([]);
  const [
    subredditListsThatSubredditIsNotIn,
    setSubredditListsThatSubredditIsNotIn,
  ] = useState<Array<SubredditLists>>([]);

  const contextMenuRootRef = useRef(null);
  const addToListNamesDivRef = useRef(null);
  const removeFromListNamesDivRef = useRef(null);

  const [contextMenuMaxHeight, setContextMenuMaxHeight] = useState(0);
  useEffect(() => {
    if (subreddit != undefined) {
      const isIn = subredditLists.filter((list) => {
        return (
          list.subreddits.find(
            (listItem) =>
              listItem.displayName.toLowerCase() ==
              subreddit.displayName.toLowerCase()
          ) != undefined
        );
      });

      const isNotIn = subredditLists.filter((list) => {
        return (
          list.subreddits.find(
            (listItem) =>
              listItem.displayName.toLowerCase() ==
              subreddit.displayName.toLowerCase()
          ) == undefined
        );
      });
      setSubredditListsThatSubredditIsIn(isIn);
      setSubredditListsThatSubredditIsNotIn(isNotIn);
    }
  }, [subredditLists, subreddit]);

  useEffect(() => {
    if (!showContextMenu) {
      setSubredditListsThatSubredditIsIn([]);
      setSubredditListsThatSubredditIsNotIn([]);
      const addToListIconSpan = document.getElementById(
        "add-to-list-icon-span"
      );
      if (
        addToListIconSpan != undefined &&
        addToListIconSpan.classList.contains("active")
      ) {
        addToListIconSpan.classList.remove("active");
      }
      const removeFromListIconSpan = document.getElementById(
        "remove-from-list-icon-span"
      );
      if (
        removeFromListIconSpan != undefined &&
        removeFromListIconSpan.classList.contains("active")
      ) {
        removeFromListIconSpan.classList.remove("active");
      }
    }
  }, [showContextMenu]);

  useEffect(() => {
    const contextMenuRoot =
      contextMenuRootRef.current as unknown as HTMLDivElement;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const menuWidth = contextMenuRoot.clientWidth;
    const menuHeight = contextMenuRoot.clientHeight;

    let xToSet = xFromState;
    let yToSet = yFromState;

    if (xFromState + menuWidth > windowWidth) {
      xToSet = xFromState - menuWidth;
    }

    if (yFromState + menuHeight > windowHeight) {
      yToSet = windowHeight - menuHeight;
    }

    setContextMenuX(xToSet);
    setContextMenuY(yToSet);
    setContextMenuMaxHeight(windowHeight - yToSet);
  }, [xFromState, yFromState]);

  return (
    <>
      <div
        className="context-menu"
        ref={contextMenuRootRef}
        hidden={!showContextMenu}
        style={{
          visibility: showContextMenu ? "visible" : "hidden",
          top: `${contextMenuY}px`,
          left: `${contextMenuX}px`,
          maxHeight: contextMenuMaxHeight,
        }}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <div
          className="context-menu-button"
          hidden={!showButtonControls.showOpenImageInNewTab}
          onClick={() => {
            window.open(copyInfo?.url);
          }}
        >
          <p className="context-menu-button-label">Open Image In New Tab</p>
        </div>
        <div
          className="context-menu-button"
          hidden={!showButtonControls.showOpenPost}
          onClick={() => {
            window.open(openPostLink);
            dispatch(closeContextMenu());
          }}
        >
          <p className="context-menu-button-label">Open Post</p>
        </div>

        <div
          className="context-menu-button"
          hidden={!showButtonControls.showOpenSubreddit}
          onClick={() => {
            window.open(openSubredditLink);
            dispatch(closeContextMenu());
          }}
        >
          <p className="context-menu-button-label">Open Subreddit</p>
        </div>

        <div
          className="context-menu-button"
          hidden={!showButtonControls.showCopy}
          onClick={() => {
            if (copyInfo != undefined) {
              dispatch(onCopyClick(copyInfo));
            }
            dispatch(closeContextMenu());
          }}
        >
          <p className="context-menu-button-label">Copy</p>
        </div>

        <div
          className="context-menu-button"
          hidden={!showButtonControls.showSkipToSubreddit}
          onClick={() => {
            if (subreddit != undefined) {
              dispatch(addSubredditToQueue(subreddit));
            }
            dispatch(closeContextMenu());
          }}
        >
          <p className="context-menu-button-label">Skip to Subreddit</p>
        </div>

        <div
          className="context-menu-button"
          hidden={
            !(
              showButtonControls.showAddToList &&
              subredditListsThatSubredditIsNotIn.length > 0
            )
          }
        >
          <div
            className={`expandable-context-sub-menu ${
              expandAddToList ? "expandable-context-sub-menu-active" : ""
            }`}
            onClick={() => {
              dispatch(setExpandAddToList(!expandAddToList));
              const div =
                addToListNamesDivRef.current as unknown as HTMLDivElement;
              div.style.setProperty(
                "--context-menu-sub-menu-height",
                `${div.scrollHeight}px`
              );
            }}
          >
            <label className="context-menu-button-label">Add to List</label>
          </div>

          <div
            className={`context-menu-sub-menu ${
              expandAddToList ? "context-menu-sub-menu-open" : ""
            }`}
            ref={addToListNamesDivRef}
          >
            {subredditListsThatSubredditIsNotIn.map((subredditList) => (
              <div
                key={subredditList.subredditListUuid}
                onClick={() => {
                  if (subreddit != undefined) {
                    dispatch(
                      addSubredditToList({
                        subredditList: subredditList,
                        subredditListItem: {
                          ...subreddit,
                          fromList: subredditList.listName,
                        },
                      })
                    );
                  }
                }}
                className="context-menu-sub-menu-item"
              >
                <h4 className="context-menu-button-label">
                  {subredditList.listName}
                </h4>
              </div>
            ))}
          </div>
        </div>

        <div
          className="context-menu-button"
          hidden={
            !(
              showButtonControls.showRemoveFromList &&
              subredditListsThatSubredditIsIn.length > 0
            )
          }
        >
          <div
            className={`expandable-context-sub-menu ${
              expandRemoveFromList ? "expandable-context-sub-menu-active" : ""
            }`}
            onClick={() => {
              dispatch(setExpandRemoveToList(!expandRemoveFromList));
              const div =
                removeFromListNamesDivRef.current as unknown as HTMLDivElement;
              div.style.setProperty(
                "--context-menu-sub-menu-height",
                `${div.scrollHeight}px`
              );
            }}
          >
            <label className="context-menu-button-label">
              Remove From List
            </label>
          </div>

          <div
            className={`context-menu-sub-menu ${
              expandRemoveFromList ? "context-menu-sub-menu-open" : ""
            }`}
            ref={removeFromListNamesDivRef}
          >
            {subredditListsThatSubredditIsIn.map((subredditList) => (
              <div
                key={subredditList.subredditListUuid}
                onClick={() => {
                  if (subreddit != undefined) {
                    dispatch(
                      removeSubredditFromList({
                        subredditList: subredditList,
                        subredditListItem: {
                          ...subreddit,
                          fromList: subredditList.listName,
                        },
                      })
                    );
                  }
                }}
                className="context-menu-sub-menu-item"
              >
                <h4 className="context-menu-button-label">
                  {subredditList.listName}
                </h4>
              </div>
            ))}
          </div>
        </div>

        <div
          className="context-menu-button"
          hidden={!showButtonControls.showUpdateListName}
          onClick={() => {
            if (updateSubredditListInfo?.subredditList != undefined) {
              dispatch(
                showUpdateListBox(updateSubredditListInfo?.subredditList)
              );
            }
            dispatch(closeContextMenu());
          }}
        >
          <p className="context-menu-button-label">Update List Name</p>
        </div>

        <div
          className="context-menu-button"
          hidden={!showButtonControls.showDeleteList}
          onClick={() => {
            if (updateSubredditListInfo?.subredditList != undefined) {
              dispatch(
                showDeleteListConfirmationBox(
                  updateSubredditListInfo?.subredditList
                )
              );
            }
            dispatch(closeContextMenu());
          }}
        >
          <p className="context-menu-button-label">Delete List</p>
        </div>
      </div>
    </>
  );
};
export default ContextMenu;
