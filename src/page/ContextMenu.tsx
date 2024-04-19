import { useContext, useEffect, useRef, useState } from "react";
import { SubredditLists } from "../model/SubredditList/SubredditLists";
import useRedditClient from "../hook/use-reddit-client.ts";
import { RedditListContext } from "../context/reddit-list-context.ts";
import useRedditList from "../hook/use-reddit-list.ts";
import { useAppDispatch, useAppSelector } from "../redux/store.ts";
import { useCopy } from "../hook/use-copy.ts";
import {
  closeContextMenu,
  setExpandAddToList,
  setExpandRemoveToList,
} from "../redux/slice/ContextMenuSlice.ts";

const ContextMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const copyHook = useCopy();
  const redditClient = useRedditClient();
  const redditListsHook = useRedditList();
  const contextMenuState = useAppSelector((state) => state.contextMenu);
  const { redditListContextData } = useContext(RedditListContext);

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
      const isIn = redditListContextData.subredditLists.filter((list) => {
        return (
          list.subreddits.find(
            (listItem) =>
              listItem.displayName.toLowerCase() ==
              subreddit.displayName.toLowerCase()
          ) != undefined
        );
      });

      const isNotIn = redditListContextData.subredditLists.filter((list) => {
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
  }, [redditListContextData.subredditLists, contextMenuState.subreddit]);

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
            dispatch(closeContextMenu());
          }}
        >
          <p className="context-menu-button-label">Open Post</p>
        </div>

        <div
          className="context-menu-button"
          hidden={!contextMenuState.showButtonControls.showOpenSubreddit}
          onClick={() => {
            window.open(contextMenuState.openSubredditLink);
            dispatch(closeContextMenu());
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
            dispatch(closeContextMenu());
          }}
        >
          <p className="context-menu-button-label">Copy</p>
        </div>

        <div
          className="context-menu-button"
          hidden={!contextMenuState.showButtonControls.showSkipToSubreddit}
          onClick={() => {
            if (contextMenuState.subreddit != undefined) {
              redditClient.addSubredditToQueue(contextMenuState.subreddit);
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
              dispatch(
                setExpandAddToList(
                  !contextMenuState.showButtonControls.expandAddToList
                )
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
                    redditListsHook.addSubredditToList(
                      {
                        ...contextMenuState.subreddit,
                        fromList: subredditList.listName,
                      },
                      subredditList
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
              dispatch(
                setExpandRemoveToList(
                  !contextMenuState.showButtonControls.expandRemoveFromList
                )
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
                    redditListsHook.removeSubredditFromList(
                      {
                        ...contextMenuState.subreddit,
                        fromList: subredditList.listName,
                      },
                      subredditList
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
          hidden={!contextMenuState.showButtonControls.showUpdateListName}
          onClick={() => {
            if (
              contextMenuState.updateSubredditListInfo?.subredditList !=
              undefined
            ) {
              redditListsHook.showUpdateListBox(
                contextMenuState.updateSubredditListInfo?.subredditList
              );
            }
            dispatch(closeContextMenu());
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
              redditListsHook.showDeleteListConfirmationBox(
                contextMenuState.updateSubredditListInfo?.subredditList
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
