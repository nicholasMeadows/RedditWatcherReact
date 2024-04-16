import PostContextMenuEvent from "../model/Events/PostContextMenuEvent.ts";
import CustomContextMenuEvent from "../model/Events/CustomContextMenuEvent.ts";
import { useContext } from "react";
import {
  ContextMenuContext,
  ContextMenuContextData,
  InitialContextMenuContextData,
} from "../page/Context.ts";
import { Post } from "../model/Post/Post.ts";
import { SubredditAccountSearchResult } from "../model/SubredditAccountSearchResult.ts";
import { SubredditLists } from "../model/SubredditList/SubredditLists.ts";
import { Subreddit } from "../model/Subreddit/Subreddit.ts";
import SubredditListItemContextMenuEvent from "../model/Events/SubredditListItemContextMenuEvent.ts";
import SubredditListContextMenuEvent from "../model/Events/SubredditListContextMenuEvent.ts";
import SideBarSubredditMenuEvent from "../model/Events/SideBarSubredditMenuEvent.ts";
import { RedditSearchItemContextMenuEvent } from "../model/Events/RedditSearchItemContextMenuEvent.ts";

interface ContextDataObjects {
  post?: Post | undefined;
  subredditAccountSearchResult?: SubredditAccountSearchResult | undefined;
  subredditLists?: SubredditLists | undefined;
  subreddit?: Subreddit | undefined;
}

interface ShowButtonControlsOptional {
  showOpenPost?: boolean | undefined;
  showOpenImageInNewTab?: boolean | undefined;
  showOpenSubreddit?: boolean | undefined;
  showCopy?: boolean | undefined;
  showSkipToSubreddit?: boolean | undefined;
  showAddToList?: boolean | undefined;
  showRemoveFromList?: boolean | undefined;
  showUpdateListName?: boolean | undefined;
  showDeleteList: boolean | undefined;
}

export function useContextMenu() {
  const { contextMenuData, setContextMenuData } =
    useContext(ContextMenuContext);

  const setContextStateFields = (
    contextMenuContextData: ContextMenuContextData,
    event: CustomContextMenuEvent,
    contextDataObjects: ContextDataObjects,
    showButtonControls?: ShowButtonControlsOptional
  ) => {
    closeContextMenu();
    contextMenuContextData.showContextMenu = true;
    contextMenuContextData.x = event.x;
    contextMenuContextData.y = event.y;

    if (contextDataObjects.post != undefined) {
      const post = contextDataObjects.post;
      contextMenuContextData.copyInfo = {
        url: post.attachments[post.currentAttachmentIndex].url,
        mediaType: post.attachments[post.currentAttachmentIndex].mediaType,
      };
      contextMenuContextData.openPostPermaLink = buildOpenPostPermaLink(
        post.permaLink
      );
      contextMenuContextData.openSubredditLink = buildOpenSubredditLink(
        post.subreddit.isUser,
        post.subreddit.displayName
      );
      contextMenuContextData.subreddit = post.subreddit;

      let showOpenPost = true;
      let showOpenImageInNewTab = true;
      let showOpenSubreddit = true;
      let showCopy = true;
      let showSkipToSubreddit = true;
      let showAddToList = true;
      let showRemoveFromList = true;

      if (showButtonControls != undefined) {
        showOpenPost =
          showButtonControls.showOpenPost == undefined
            ? showOpenPost
            : showButtonControls.showOpenPost;
        showOpenImageInNewTab =
          showButtonControls.showOpenImageInNewTab == undefined
            ? showOpenImageInNewTab
            : showButtonControls.showOpenImageInNewTab;
        showOpenSubreddit =
          showButtonControls.showOpenSubreddit == undefined
            ? showOpenSubreddit
            : showButtonControls.showOpenSubreddit;
        showCopy =
          showButtonControls.showCopy == undefined
            ? showCopy
            : showButtonControls.showCopy;
        showSkipToSubreddit =
          showButtonControls.showSkipToSubreddit == undefined
            ? showSkipToSubreddit
            : showButtonControls.showSkipToSubreddit;
        showAddToList =
          showButtonControls.showAddToList == undefined
            ? showAddToList
            : showButtonControls.showAddToList;
        showRemoveFromList =
          showButtonControls.showRemoveFromList == undefined
            ? showRemoveFromList
            : showButtonControls.showRemoveFromList;
      }
      contextMenuContextData.showButtonControls.showOpenPost = showOpenPost;
      contextMenuContextData.showButtonControls.showOpenImageInNewTab =
        showOpenImageInNewTab;
      contextMenuContextData.showButtonControls.showOpenSubreddit =
        showOpenSubreddit;
      contextMenuContextData.showButtonControls.showCopy = showCopy;
      contextMenuContextData.showButtonControls.showSkipToSubreddit =
        showSkipToSubreddit;
      contextMenuContextData.showButtonControls.showAddToList = showAddToList;
      contextMenuContextData.showButtonControls.showRemoveFromList =
        showRemoveFromList;
    }

    if (contextDataObjects.subreddit != undefined) {
      const subreddit = contextDataObjects.subreddit;
      contextMenuContextData.subreddit = subreddit;
      contextMenuContextData.openSubredditLink = buildOpenSubredditLink(
        subreddit.isUser,
        subreddit.displayName
      );

      let showOpenSubreddit = true;
      let showSkipToSubreddit = true;
      let showAddToList = true;
      let showRemoveFromList = true;
      if (showButtonControls != undefined) {
        showOpenSubreddit =
          showButtonControls.showOpenSubreddit == undefined
            ? showOpenSubreddit
            : showButtonControls.showOpenSubreddit;
        showSkipToSubreddit =
          showButtonControls.showSkipToSubreddit == undefined
            ? showSkipToSubreddit
            : showButtonControls.showSkipToSubreddit;
        showAddToList =
          showButtonControls.showAddToList == undefined
            ? showAddToList
            : showButtonControls.showAddToList;
        showRemoveFromList =
          showButtonControls.showRemoveFromList == undefined
            ? showRemoveFromList
            : showButtonControls.showRemoveFromList;
      }
      contextMenuContextData.showButtonControls.showOpenSubreddit =
        showOpenSubreddit;
      contextMenuContextData.showButtonControls.showSkipToSubreddit =
        showSkipToSubreddit;
      contextMenuContextData.showButtonControls.showAddToList = showAddToList;
      contextMenuContextData.showButtonControls.showRemoveFromList =
        showRemoveFromList;
    }

    if (contextDataObjects.subredditLists != undefined) {
      const subredditList = contextDataObjects.subredditLists;
      contextMenuContextData.updateSubredditListInfo = {
        subredditList: subredditList,
      };

      let showUpdateListName = true;
      let showDeleteList = true;
      if (showButtonControls != undefined) {
        showUpdateListName =
          showButtonControls.showUpdateListName == undefined
            ? showUpdateListName
            : showButtonControls.showUpdateListName;
        showDeleteList =
          showButtonControls.showDeleteList == undefined
            ? showDeleteList
            : showButtonControls.showDeleteList;
      }
      contextMenuContextData.showButtonControls.showUpdateListName =
        showUpdateListName;
      contextMenuContextData.showButtonControls.showDeleteList = showDeleteList;
    }

    if (contextDataObjects.subredditAccountSearchResult) {
      const searchResultItem = contextDataObjects.subredditAccountSearchResult;
      contextMenuContextData.openSubredditLink = buildOpenSubredditLink(
        searchResultItem.isUser,
        searchResultItem.displayName
      );
      contextMenuContextData.subreddit = searchResultItem;

      let showOpenSubreddit = true;
      let showSkipToSubreddit = true;
      let showAddToList = true;
      let showRemoveFromlist = true;
      if (showButtonControls != undefined) {
        showOpenSubreddit =
          showButtonControls.showOpenSubreddit == undefined
            ? showOpenSubreddit
            : showButtonControls.showOpenSubreddit;
        showSkipToSubreddit =
          showButtonControls.showSkipToSubreddit == undefined
            ? showSkipToSubreddit
            : showButtonControls.showSkipToSubreddit;
        showAddToList =
          showButtonControls.showAddToList == undefined
            ? showAddToList
            : showButtonControls.showAddToList;
        showRemoveFromlist =
          showButtonControls.showRemoveFromList == undefined
            ? showRemoveFromlist
            : showButtonControls.showRemoveFromList;
      }
      contextMenuContextData.showButtonControls.showOpenSubreddit =
        showOpenSubreddit;
      contextMenuContextData.showButtonControls.showSkipToSubreddit =
        showSkipToSubreddit;
      contextMenuContextData.showButtonControls.showAddToList = showAddToList;
      contextMenuContextData.showButtonControls.showRemoveFromList =
        showRemoveFromlist;
    }
    setContextMenuData({ ...contextMenuContextData });
  };

  const buildOpenPostPermaLink = (permaLink: string) => {
    return `https://www.reddit.com${permaLink}`;
  };

  const buildOpenSubredditLink = (isUser: boolean, displayName: string) => {
    return `https://www.reddit.com/${isUser ? "u" : "r"}/${displayName}`;
  };

  const copy = async (copyInfo: { url: string; mediaType: string }) => {
    if (copyInfo.mediaType == "IMAGE") {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const context = canvas.getContext("2d");
        if (context != undefined) {
          context.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob != undefined) {
              navigator.clipboard.write([
                new ClipboardItem({ "image/png": blob }),
              ]);
            }
          });
        }
      };
      img.onerror = (event) => {
        console.log(
          `Could not load image url ${copyInfo.url} into image tag for copy. ${event}`
        );
        navigator.clipboard.writeText(copyInfo.url);
      };
      img.src = copyInfo.url;
    } else {
      await navigator.clipboard.writeText(copyInfo.url);
    }
  };

  const setPostContextMenuEvent = (
    event: PostContextMenuEvent,
    showButtonOverride?: ShowButtonControlsOptional | undefined
  ) => {
    const post = event.post;
    setContextStateFields(
      contextMenuData,
      event,
      { post: post },
      showButtonOverride
    );
  };

  const setSubredditListItemContextMenuEvent = (
    event: SubredditListItemContextMenuEvent,
    showButtonOverride?: ShowButtonControlsOptional | undefined
  ) => {
    const subreddit = event.subreddit;
    setContextStateFields(
      contextMenuData,
      event,
      { subreddit: subreddit },
      showButtonOverride
    );
  };

  const setSubredditListContextMenuEvent = (
    event: SubredditListContextMenuEvent,
    showButtonOverride?: ShowButtonControlsOptional | undefined
  ) => {
    const subredditList = event.subredditList;
    setContextStateFields(
      contextMenuData,
      event,
      { subredditLists: subredditList },
      showButtonOverride
    );
  };

  const setSideBarSubredditMenuEvent = (
    event: SideBarSubredditMenuEvent,
    showButtonOverride?: ShowButtonControlsOptional | undefined
  ) => {
    const subreddit = event.subreddit;
    setContextStateFields(
      contextMenuData,
      event,
      { subreddit: subreddit },
      showButtonOverride
    );
  };
  const closeContextMenu = () => {
    setContextMenuData({ ...InitialContextMenuContextData });
  };

  const setRedditSearchItemContextMenuEvent = (
    event: RedditSearchItemContextMenuEvent,
    showButtonOverride?: ShowButtonControlsOptional | undefined
  ) => {
    const searchResultItem = event.searchResultItem;
    setContextStateFields(
      contextMenuData,
      event,
      { subredditAccountSearchResult: searchResultItem },
      showButtonOverride
    );
  };

  const setExpandAddToList = (expand: boolean) => {
    contextMenuData.showButtonControls.expandAddToList = expand;
    contextMenuData.showButtonControls.expandRemoveFromList = false;
    setContextMenuData({ ...contextMenuData });
  };
  const setExpandRemoveToList = (expand: boolean) => {
    contextMenuData.showButtonControls.expandRemoveFromList = expand;
    contextMenuData.showButtonControls.expandAddToList = false;
    setContextMenuData({ ...contextMenuData });
  };
  return {
    copy: copy,
    setPostContextMenuEvent: setPostContextMenuEvent,
    setSubredditListItemContextMenuEvent: setSubredditListItemContextMenuEvent,
    setSubredditListContextMenuEvent: setSubredditListContextMenuEvent,
    setSideBarSubredditMenuEvent: setSideBarSubredditMenuEvent,
    closeContextMenu: closeContextMenu,
    setRedditSearchItemContextMenuEvent: setRedditSearchItemContextMenuEvent,
    setExpandAddToList: setExpandAddToList,
    setExpandRemoveToList: setExpandRemoveToList,
  };
}
