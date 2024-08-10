import { useContext, useEffect, useRef, useState } from "react";
import { SubredditLists } from "../model/SubredditList/SubredditLists";
import { useCopy } from "../hook/use-copy.ts";

import {
  ContextMenuDispatchContext,
  ContextMenuStateContext,
} from "../context/context-menu-context.ts";
import { ContextMenuActionType } from "../reducer/context-menu-reducer.ts";
import {
  RedditListDispatchContext,
  RedditListStateContext,
} from "../context/reddit-list-context.ts";
import { RedditListActionType } from "../reducer/reddit-list-reducer.ts";
import { RedditServiceDispatchContext } from "../context/reddit-service-context.ts";
import { RedditServiceActions } from "../reducer/reddit-service-reducer.ts";

const ContextMenu: React.FC = () => {
  const copyHook = useCopy();
  const redditServiceDispatch = useContext(RedditServiceDispatchContext);
  const contextMenuState = useContext(ContextMenuStateContext);
  const contextMenuDispatch = useContext(ContextMenuDispatchContext);
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
  useEffect(() => {
    if (contextMenuState.subreddit !== undefined) {
      const subreddit = contextMenuState.subreddit;
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
  }, [redditListState.subredditLists, contextMenuState.subreddit]);

  useEffect(() => {
    if (!contextMenuState.showContextMenu) {
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
  }, [contextMenuState.showContextMenu]);

  useEffect(() => {
    const contextMenuRoot =
      contextMenuRootRef.current as unknown as HTMLDivElement;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const menuWidth = contextMenuRoot.clientWidth;
    const menuHeight = contextMenuRoot.clientHeight;

    let xToSet = contextMenuState.x;
    let yToSet = contextMenuState.y;

    if (contextMenuState.x + menuWidth > windowWidth) {
      xToSet = contextMenuState.x - menuWidth;
    }

    if (contextMenuState.y + menuHeight > windowHeight) {
      yToSet = windowHeight - menuHeight;
    }

    setContextMenuX(xToSet);
    setContextMenuY(yToSet);
    setContextMenuMaxHeight(windowHeight - yToSet);
  }, [contextMenuState.x, contextMenuState.y]);

  return (
    <>
      <div
        className="context-menu"
        ref={contextMenuRootRef}
        hidden={!contextMenuState.showContextMenu}
        style={{
          visibility: contextMenuState.showContextMenu ? "visible" : "hidden",
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
          hidden={!contextMenuState.showButtonControls.showOpenImageInNewTab}
          onClick={() => {
            window.open(contextMenuState.copyInfo?.url);
          }}
        >
          <p className="context-menu-button-label">Open Image In New Tab</p>
        </div>
        <div
          className="context-menu-button"
          hidden={!contextMenuState.showButtonControls.showOpenPost}
          onClick={() => {
            window.open(contextMenuState.openPostPermaLink);
            contextMenuDispatch({
              type: ContextMenuActionType.CLOSE_CONTEXT_MENU,
            });
          }}
        >
          <p className="context-menu-button-label">Open Post</p>
        </div>

        <div
          className="context-menu-button"
          hidden={!contextMenuState.showButtonControls.showOpenSubreddit}
          onClick={() => {
            window.open(contextMenuState.openSubredditLink);
            contextMenuDispatch({
              type: ContextMenuActionType.CLOSE_CONTEXT_MENU,
            });
          }}
        >
          <p className="context-menu-button-label">Open Subreddit</p>
        </div>

        <div
          className="context-menu-button"
          hidden={!contextMenuState.showButtonControls.showCopy}
          onClick={() => {
            if (contextMenuState.copyInfo != undefined) {
              copyHook.copy(contextMenuState.copyInfo);
            }
            contextMenuDispatch({
              type: ContextMenuActionType.CLOSE_CONTEXT_MENU,
            });
          }}
        >
          <p className="context-menu-button-label">Copy</p>
        </div>

        <div
          className="context-menu-button"
          hidden={!contextMenuState.showButtonControls.showSkipToSubreddit}
          onClick={() => {
            if (contextMenuState.subreddit != undefined) {
              redditServiceDispatch({
                type: RedditServiceActions.ADD_SUBREDDIT_TO_QUEUE,
                payload: contextMenuState.subreddit,
              });
            }
            contextMenuDispatch({
              type: ContextMenuActionType.CLOSE_CONTEXT_MENU,
            });
          }}
        >
          <p className="context-menu-button-label">Skip to Subreddit</p>
        </div>

        <div
          className="context-menu-button"
          hidden={
            !(
              contextMenuState.showButtonControls.showAddToList &&
              subredditListsThatSubredditIsNotIn.length > 0
            )
          }
        >
          <div
            className={`expandable-context-sub-menu ${
              contextMenuState.showButtonControls.expandAddToList
                ? "expandable-context-sub-menu-active"
                : ""
            }`}
            onClick={() => {
              contextMenuDispatch({
                type: ContextMenuActionType.SET_EXPAND_ADD_TO_LIST,
                payload: !contextMenuState.showButtonControls.expandAddToList,
              });
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
              contextMenuState.showButtonControls.expandAddToList
                ? "context-menu-sub-menu-open"
                : ""
            }`}
            ref={addToListNamesDivRef}
          >
            {subredditListsThatSubredditIsNotIn.map((subredditList) => (
              <div
                key={subredditList.subredditListUuid}
                onClick={() => {
                  if (contextMenuState.subreddit != undefined) {
                    redditListDispatch({
                      type: RedditListActionType.ADD_SUBREDDIT_TO_LIST,
                      payload: {
                        subreddit: {
                          ...contextMenuState.subreddit,
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
              contextMenuState.showButtonControls.showRemoveFromList &&
              subredditListsThatSubredditIsIn.length > 0
            )
          }
        >
          <div
            className={`expandable-context-sub-menu ${
              contextMenuState.showButtonControls.expandRemoveFromList
                ? "expandable-context-sub-menu-active"
                : ""
            }`}
            onClick={() => {
              contextMenuDispatch({
                type: ContextMenuActionType.SET_EXPAND_REMOVE_TO_LIST,
                payload:
                  !contextMenuState.showButtonControls.expandRemoveFromList,
              });

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
              contextMenuState.showButtonControls.expandRemoveFromList
                ? "context-menu-sub-menu-open"
                : ""
            }`}
            ref={removeFromListNamesDivRef}
          >
            {subredditListsThatSubredditIsIn.map((subredditList) => (
              <div
                key={subredditList.subredditListUuid}
                onClick={() => {
                  if (contextMenuState.subreddit != undefined) {
                    redditListDispatch({
                      type: RedditListActionType.REMOVE_SUBREDDIT_FROM_LIST,
                      payload: {
                        subreddit: {
                          ...contextMenuState.subreddit,
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
          hidden={!contextMenuState.showButtonControls.showUpdateListName}
          onClick={() => {
            if (
              contextMenuState.updateSubredditListInfo?.subredditList !=
              undefined
            ) {
              redditListDispatch({
                type: RedditListActionType.SHOW_UPDATE_LIST_BOX,
                payload: contextMenuState.updateSubredditListInfo.subredditList,
              });
            }
            contextMenuDispatch({
              type: ContextMenuActionType.CLOSE_CONTEXT_MENU,
            });
          }}
        >
          <p className="context-menu-button-label">Update List Name</p>
        </div>

        <div
          className="context-menu-button"
          hidden={!contextMenuState.showButtonControls.showDeleteList}
          onClick={() => {
            if (
              contextMenuState.updateSubredditListInfo?.subredditList !=
              undefined
            ) {
              redditListDispatch({
                type: RedditListActionType.SHOW_DELETE_LIST_CONFIRMATION,
                payload: contextMenuState.updateSubredditListInfo.subredditList,
              });
            }
            contextMenuDispatch({
              type: ContextMenuActionType.CLOSE_CONTEXT_MENU,
            });
          }}
        >
          <p className="context-menu-button-label">Delete List</p>
        </div>
      </div>
    </>
  );
};
export default ContextMenu;
