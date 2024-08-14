import { useContext, useEffect, useRef, useState } from "react";
import { SubredditLists } from "../model/SubredditList/SubredditLists";

import { ContextMenuStateContext } from "../context/context-menu-context.ts";
import useContextMenu from "../hook/use-context-menu.ts";
import { useCopy } from "../hook/use-copy.ts";
import {
  RedditListDispatchContext,
  RedditListStateContext,
} from "../context/reddit-list-context.ts";
import { RedditListActionType } from "../reducer/reddit-list-reducer.ts";
import useRedditQueue from "../hook/use-reddit-queue.ts";

const ContextMenu: React.FC = () => {
  const copyHook = useCopy();
  const {
    showContextMenu,
    x,
    y,
    showButtonControls,
    subreddit,
    copyInfo,
    subredditList,
    openSubredditLink,
    openPostPermaLink,
  } = useContext(ContextMenuStateContext);
  const redditListState = useContext(RedditListStateContext);
  const redditListDispatch = useContext(RedditListDispatchContext);
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

  const {
    closeContextMenu,
    toggleExpandRemoveFromList,
    toggleExpandAddToList,
  } = useContextMenu();
  const { addSubredditToQueue } = useRedditQueue();
  useEffect(() => {
    if (subreddit !== undefined) {
      const isIn = redditListState.subredditLists.filter((list) => {
        return (
          list.subreddits.find(
            (listItem) =>
              listItem.displayName.toLowerCase() ==
              subreddit.displayName.toLowerCase()
          ) != undefined
        );
      });

      const isNotIn = redditListState.subredditLists.filter((list) => {
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
  }, [redditListState.subredditLists, subreddit]);

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

    let xToSet = x;
    let yToSet = y;

    if (x + menuWidth > windowWidth) {
      xToSet = x - menuWidth;
    }

    if (y + menuHeight > windowHeight) {
      yToSet = windowHeight - menuHeight;
    }

    setContextMenuX(xToSet);
    setContextMenuY(yToSet);
    setContextMenuMaxHeight(windowHeight - yToSet);
  }, [x, y]);

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
            window.open(openPostPermaLink);
            closeContextMenu();
          }}
        >
          <p className="context-menu-button-label">Open Post</p>
        </div>

        <div
          className="context-menu-button"
          hidden={!showButtonControls.showOpenSubreddit}
          onClick={() => {
            window.open(openSubredditLink);
            closeContextMenu();
          }}
        >
          <p className="context-menu-button-label">Open Subreddit</p>
        </div>

        <div
          className="context-menu-button"
          hidden={!showButtonControls.showCopy}
          onClick={() => {
            if (copyInfo != undefined) {
              copyHook.copy(copyInfo);
            }
            closeContextMenu();
          }}
        >
          <p className="context-menu-button-label">Copy</p>
        </div>

        <div
          className="context-menu-button"
          hidden={!showButtonControls.showSkipToSubreddit}
          onClick={() => {
            if (subreddit != undefined) {
              addSubredditToQueue(subreddit);
            }
            closeContextMenu();
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
              showButtonControls.expandAddToList
                ? "expandable-context-sub-menu-active"
                : ""
            }`}
            onClick={() => {
              toggleExpandAddToList();
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
              showButtonControls.expandAddToList
                ? "context-menu-sub-menu-open"
                : ""
            }`}
            ref={addToListNamesDivRef}
          >
            {subredditListsThatSubredditIsNotIn.map((subredditList) => (
              <div
                key={subredditList.subredditListUuid}
                onClick={() => {
                  if (subreddit != undefined) {
                    redditListDispatch({
                      type: RedditListActionType.ADD_SUBREDDIT_TO_LIST,
                      payload: {
                        subreddit: {
                          ...subreddit,
                          fromList: subredditList.listName,
                        },
                        subredditList: subredditList,
                      },
                    });
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
              showButtonControls.expandRemoveFromList
                ? "expandable-context-sub-menu-active"
                : ""
            }`}
            onClick={() => {
              toggleExpandRemoveFromList();
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
              showButtonControls.expandRemoveFromList
                ? "context-menu-sub-menu-open"
                : ""
            }`}
            ref={removeFromListNamesDivRef}
          >
            {subredditListsThatSubredditIsIn.map((subredditList) => (
              <div
                key={subredditList.subredditListUuid}
                onClick={() => {
                  if (subreddit != undefined) {
                    redditListDispatch({
                      type: RedditListActionType.REMOVE_SUBREDDIT_FROM_LIST,
                      payload: {
                        subreddit: {
                          ...subreddit,
                          fromList: subredditList.listName,
                        },
                        subredditList: subredditList,
                      },
                    });
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
            if (subredditList != undefined) {
              redditListDispatch({
                type: RedditListActionType.SHOW_UPDATE_LIST_BOX,
                payload: subredditList,
              });
            }
            closeContextMenu();
          }}
        >
          <p className="context-menu-button-label">Update List Name</p>
        </div>

        <div
          className="context-menu-button"
          hidden={!showButtonControls.showDeleteList}
          onClick={() => {
            if (subredditList !== undefined) {
              redditListDispatch({
                type: RedditListActionType.SHOW_DELETE_LIST_CONFIRMATION,
                payload: subredditList,
              });
            }
            closeContextMenu();
          }}
        >
          <p className="context-menu-button-label">Delete List</p>
        </div>
      </div>
    </>
  );
};
export default ContextMenu;
