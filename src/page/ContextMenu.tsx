import { useContext, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { SubredditLists } from "../model/SubredditList/SubredditLists";
import {
  addSubredditToList,
  removeSubredditFromList,
  showDeleteListConfirmationBox,
  showUpdateListBox,
} from "../redux/slice/RedditListsSlice";
import { useContextMenu } from "../hook/use-context-menu.ts";
import { ContextMenuContext } from "../context/context-menu-context.ts";
import useRedditClient from "../hook/use-reddit-client.ts";

const ContextMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const contextMenu = useContextMenu();
  const redditClient = useRedditClient();
  const { contextMenuData } = useContext(ContextMenuContext);
  const subredditLists = useAppSelector(
    (state) => state.subredditLists.subredditLists
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
    if (contextMenuData.subreddit !== undefined) {
      const subreddit = contextMenuData.subreddit;
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
  }, [subredditLists, contextMenuData.subreddit]);

  useEffect(() => {
    if (!contextMenuData.showContextMenu) {
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
  }, [contextMenuData.showContextMenu]);

  useEffect(() => {
    const contextMenuRoot =
      contextMenuRootRef.current as unknown as HTMLDivElement;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const menuWidth = contextMenuRoot.clientWidth;
    const menuHeight = contextMenuRoot.clientHeight;

    let xToSet = contextMenuData.x;
    let yToSet = contextMenuData.y;

    if (contextMenuData.x + menuWidth > windowWidth) {
      xToSet = contextMenuData.x - menuWidth;
    }

    if (contextMenuData.y + menuHeight > windowHeight) {
      yToSet = windowHeight - menuHeight;
    }

    setContextMenuX(xToSet);
    setContextMenuY(yToSet);
    setContextMenuMaxHeight(windowHeight - yToSet);
  }, [contextMenuData.x, contextMenuData.y]);

  return (
    <>
      <div
        className="context-menu"
        ref={contextMenuRootRef}
        hidden={!contextMenuData.showContextMenu}
        style={{
          visibility: contextMenuData.showContextMenu ? "visible" : "hidden",
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
          hidden={!contextMenuData.showButtonControls.showOpenImageInNewTab}
          onClick={() => {
            window.open(contextMenuData.copyInfo?.url);
          }}
        >
          <p className="context-menu-button-label">Open Image In New Tab</p>
        </div>
        <div
          className="context-menu-button"
          hidden={!contextMenuData.showButtonControls.showOpenPost}
          onClick={() => {
            window.open(contextMenuData.openPostPermaLink);
            contextMenu.closeContextMenu();
          }}
        >
          <p className="context-menu-button-label">Open Post</p>
        </div>

        <div
          className="context-menu-button"
          hidden={!contextMenuData.showButtonControls.showOpenSubreddit}
          onClick={() => {
            window.open(contextMenuData.openSubredditLink);
            contextMenu.closeContextMenu();
          }}
        >
          <p className="context-menu-button-label">Open Subreddit</p>
        </div>

        <div
          className="context-menu-button"
          hidden={!contextMenuData.showButtonControls.showCopy}
          onClick={() => {
            if (contextMenuData.copyInfo != undefined) {
              contextMenu.copy(contextMenuData.copyInfo);
            }
            contextMenu.closeContextMenu();
          }}
        >
          <p className="context-menu-button-label">Copy</p>
        </div>

        <div
          className="context-menu-button"
          hidden={!contextMenuData.showButtonControls.showSkipToSubreddit}
          onClick={() => {
            if (contextMenuData.subreddit != undefined) {
              redditClient.addSubredditToQueue(contextMenuData.subreddit);
            }
            contextMenu.closeContextMenu();
          }}
        >
          <p className="context-menu-button-label">Skip to Subreddit</p>
        </div>

        <div
          className="context-menu-button"
          hidden={
            !(
              contextMenuData.showButtonControls.showAddToList &&
              subredditListsThatSubredditIsNotIn.length > 0
            )
          }
        >
          <div
            className={`expandable-context-sub-menu ${
              contextMenuData.showButtonControls.expandAddToList
                ? "expandable-context-sub-menu-active"
                : ""
            }`}
            onClick={() => {
              contextMenu.setExpandAddToList(
                !contextMenuData.showButtonControls.expandAddToList
              );
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
              contextMenuData.showButtonControls.expandAddToList
                ? "context-menu-sub-menu-open"
                : ""
            }`}
            ref={addToListNamesDivRef}
          >
            {subredditListsThatSubredditIsNotIn.map((subredditList) => (
              <div
                key={subredditList.subredditListUuid}
                onClick={() => {
                  if (contextMenuData.subreddit != undefined) {
                    dispatch(
                      addSubredditToList({
                        subredditList: subredditList,
                        subredditListItem: {
                          ...contextMenuData.subreddit,
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
              contextMenuData.showButtonControls.showRemoveFromList &&
              subredditListsThatSubredditIsIn.length > 0
            )
          }
        >
          <div
            className={`expandable-context-sub-menu ${
              contextMenuData.showButtonControls.expandRemoveFromList
                ? "expandable-context-sub-menu-active"
                : ""
            }`}
            onClick={() => {
              contextMenu.setExpandRemoveToList(
                !contextMenuData.showButtonControls.expandRemoveFromList
              );
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
              contextMenuData.showButtonControls.expandRemoveFromList
                ? "context-menu-sub-menu-open"
                : ""
            }`}
            ref={removeFromListNamesDivRef}
          >
            {subredditListsThatSubredditIsIn.map((subredditList) => (
              <div
                key={subredditList.subredditListUuid}
                onClick={() => {
                  if (contextMenuData.subreddit != undefined) {
                    dispatch(
                      removeSubredditFromList({
                        subredditList: subredditList,
                        subredditListItem: {
                          ...contextMenuData.subreddit,
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
          hidden={!contextMenuData.showButtonControls.showUpdateListName}
          onClick={() => {
            if (
              contextMenuData.updateSubredditListInfo?.subredditList !=
              undefined
            ) {
              dispatch(
                showUpdateListBox(
                  contextMenuData.updateSubredditListInfo?.subredditList
                )
              );
            }
            contextMenu.closeContextMenu();
          }}
        >
          <p className="context-menu-button-label">Update List Name</p>
        </div>

        <div
          className="context-menu-button"
          hidden={!contextMenuData.showButtonControls.showDeleteList}
          onClick={() => {
            if (
              contextMenuData.updateSubredditListInfo?.subredditList !=
              undefined
            ) {
              dispatch(
                showDeleteListConfirmationBox(
                  contextMenuData.updateSubredditListInfo?.subredditList
                )
              );
            }
            contextMenu.closeContextMenu();
          }}
        >
          <p className="context-menu-button-label">Delete List</p>
        </div>
      </div>
    </>
  );
};
export default ContextMenu;
