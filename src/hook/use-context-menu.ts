import { useCallback, useContext } from "react";
import { Post } from "../model/Post/Post.ts";
import { ContextMenuActionType } from "../reducer/context-menu-reducer.ts";
import { Subreddit } from "../model/Subreddit/Subreddit.ts";
import { SubredditLists } from "../model/SubredditList/SubredditLists.ts";
import { SubredditAccountSearchResult } from "../model/SubredditAccountSearchResult.ts";
import {
  ContextMenuDispatchContext,
  ContextMenuStateContext,
} from "../context/context-menu-context.ts";
import { ContextMenuState } from "../model/state/ContextMenuState.ts";

export default function useContextMenu() {
  const contextMenuDispatch = useContext(ContextMenuDispatchContext);
  const { showButtonControls } = useContext(ContextMenuStateContext);

  const openContextMenuForPost = useCallback(
    (post: Post, x: number, y: number) => {
      const base = makeBaseContextState(true, x, y);
      base.copyInfo = {
        url: post.attachments[post.currentAttachmentIndex].url,
        mediaType: post.attachments[post.currentAttachmentIndex].mediaType,
      };
      base.openSubredditLink = buildOpenSubredditLink(
        post.subreddit.isUser,
        post.subreddit.displayName
      );
      base.openPostPermaLink = buildOpenPostPermaLink(post.permaLink);
      setButtonControls(base, { post: post });
      contextMenuDispatch({
        type: ContextMenuActionType.SET_CONTEXT_MENU,
        payload: base,
      });
    },
    [contextMenuDispatch]
  );

  const openContextMenuForSideBar = useCallback(
    (subreddit: Subreddit, x: number, y: number) => {
      const base = makeBaseContextState(true, x, y);
      base.subreddit = subreddit;
      base.openSubredditLink = buildOpenSubredditLink(
        subreddit.isUser,
        subreddit.displayName
      );

      setButtonControls(base, { subreddit: subreddit });
      contextMenuDispatch({
        type: ContextMenuActionType.SET_CONTEXT_MENU,
        payload: base,
      });
    },
    [contextMenuDispatch]
  );

  const openContextMenuForSubredditList = useCallback(
    (subredditList: SubredditLists, x: number, y: number) => {
      const base = makeBaseContextState(true, x, y);
      base.subredditList = subredditList;
      setButtonControls(base, { subredditList: subredditList });
      contextMenuDispatch({
        type: ContextMenuActionType.SET_CONTEXT_MENU,
        payload: base,
      });
    },
    [contextMenuDispatch]
  );

  const openContextMenuForSubredditListItem = useCallback(
    (subreddit: Subreddit, x: number, y: number) => {
      const base = makeBaseContextState(true, x, y);
      base.subreddit = subreddit;
      base.openSubredditLink = buildOpenSubredditLink(
        subreddit.isUser,
        subreddit.displayName
      );
      setButtonControls(base, { subreddit: subreddit });
      contextMenuDispatch({
        type: ContextMenuActionType.SET_CONTEXT_MENU,
        payload: base,
      });
    },
    [contextMenuDispatch]
  );

  const openContextMenuForRedditSearchItem = useCallback(
    (redditSearchItem: SubredditAccountSearchResult, x: number, y: number) => {
      const base = makeBaseContextState(true, x, y);

      base.openSubredditLink = buildOpenSubredditLink(
        redditSearchItem.isUser,
        redditSearchItem.displayName
      );
      base.subreddit = redditSearchItem;
      setButtonControls(base, { searchResultItem: redditSearchItem });
      contextMenuDispatch({
        type: ContextMenuActionType.SET_CONTEXT_MENU,
        payload: base,
      });
    },
    [contextMenuDispatch]
  );

  const closeContextMenu = useCallback(() => {
    const base = makeBaseContextState(false, 0, 0);
    contextMenuDispatch({
      type: ContextMenuActionType.SET_CONTEXT_MENU,
      payload: base,
    });
  }, [contextMenuDispatch]);
  const makeBaseContextState = (
    showContextMenu: boolean,
    x: number,
    y: number
  ): ContextMenuState => {
    return {
      showContextMenu: showContextMenu,
      x: x,
      y: y,
      copyInfo: undefined,
      subredditList: undefined,
      subreddit: undefined,
      openSubredditLink: undefined,
      openPostPermaLink: undefined,
      showButtonControls: {
        showAddToList: false,
        showOpenSubreddit: false,
        showRemoveFromList: false,
        showSkipToSubreddit: false,
        showCopy: false,
        showUpdateListName: false,
        expandAddToList: false,
        showDeleteList: false,
        showOpenPost: false,
        expandRemoveFromList: false,
        showOpenImageInNewTab: false,
      },
    };
  };

  const buildOpenPostPermaLink = (permaLink: string) => {
    return `https://www.reddit.com${permaLink}`;
  };

  const buildOpenSubredditLink = (isUser: boolean, displayName: string) => {
    return `https://www.reddit.com/${isUser ? "u" : "r"}/${displayName}`;
  };

  const setButtonControls = (
    state: ContextMenuState,
    params: {
      post?: Post;
      subreddit?: Subreddit;
      subredditList?: SubredditLists;
      searchResultItem?: SubredditAccountSearchResult;
    }
  ) => {
    const { post, subreddit, subredditList, searchResultItem } = params;
    if (post != undefined) {
      state.showButtonControls.showOpenPost = true;
      state.showButtonControls.showOpenImageInNewTab = true;
      state.showButtonControls.showOpenSubreddit = true;
      state.showButtonControls.showCopy = true;
      state.showButtonControls.showSkipToSubreddit = true;
      state.showButtonControls.showAddToList = true;
      state.showButtonControls.showRemoveFromList = true;
    }

    if (subreddit != undefined) {
      state.showButtonControls.showOpenSubreddit = true;
      state.showButtonControls.showSkipToSubreddit = true;
      state.showButtonControls.showAddToList = true;
      state.showButtonControls.showRemoveFromList = true;
    }

    if (subredditList != undefined) {
      state.showButtonControls.showUpdateListName = true;
      state.showButtonControls.showDeleteList = true;
    }

    if (searchResultItem) {
      state.showButtonControls.showOpenSubreddit = true;
      state.showButtonControls.showSkipToSubreddit = true;
      state.showButtonControls.showAddToList = true;
      state.showButtonControls.showRemoveFromList = true;
    }
  };

  const toggleExpandAddToList = useCallback(() => {
    contextMenuDispatch({
      type: ContextMenuActionType.SET_EXPAND_ADD_TO_LIST,
      payload: !showButtonControls.expandAddToList,
    });
  }, [contextMenuDispatch, showButtonControls.expandAddToList]);
  const toggleExpandRemoveFromList = useCallback(() => {
    contextMenuDispatch({
      type: ContextMenuActionType.SET_EXPAND_REMOVE_TO_LIST,
      payload: !showButtonControls.expandRemoveFromList,
    });
  }, [contextMenuDispatch, showButtonControls.expandRemoveFromList]);

  return {
    openContextMenuForPost,
    openContextMenuForSideBar,
    openContextMenuForSubredditList,
    openContextMenuForSubredditListItem,
    openContextMenuForRedditSearchItem,
    closeContextMenu,
    toggleExpandAddToList,
    toggleExpandRemoveFromList,
  };
}
