import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import CustomContextMenuEvent from "../../model/Events/CustomContextMenuEvent";
import PostContextMenuEvent from "../../model/Events/PostContextMenuEvent";
import { RedditSearchItemContextMenuEvent } from "../../model/Events/RedditSearchItemContextMenuEvent";
import SideBarSubredditMenuEvent from "../../model/Events/SideBarSubredditMenuEvent";
import SubredditListContextMenuEvent from "../../model/Events/SubredditListContextMenuEvent";
import SubredditListItemContextMenuEvent from "../../model/Events/SubredditListItemContextMenuEvent";
import { Post } from "../../model/Post/Post";
import { Subreddit } from "../../model/Subreddit/Subreddit";
import { SubredditAccountSearchResult } from "../../model/SubredditAccountSearchResult";
import { SubredditLists } from "../../model/SubredditList/SubredditLists";

export const onCopyClick = createAsyncThunk(
  "contextMenu/onCopyClick",
  async (copyInfo: { url: string; mediaType: string }) => {
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
  }
);

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

interface ShowButtonControls extends ShowButtonControlsOptional {
  showOpenPost: boolean;
  showOpenImageInNewTab: boolean;
  showOpenSubreddit: boolean;
  showCopy: boolean;
  showSkipToSubreddit: boolean;
  showAddToList: boolean;
  expandAddToList: boolean;
  showRemoveFromList: boolean;
  expandRemoveFromList: boolean;
  showUpdateListName: boolean;
  showDeleteList: boolean;
}

interface ContextDataObjects {
  post?: Post | undefined;
  subredditAccountSearchResult?: SubredditAccountSearchResult | undefined;
  subredditLists?: SubredditLists | undefined;
  subreddit?: Subreddit | undefined;
}

type InitialState = {
  showContextMenu: boolean;
  x: number;
  y: number;
  copyInfo:
    | {
        url: string;
        mediaType: string;
      }
    | undefined;
  updateSubredditListInfo:
    | {
        subredditList: SubredditLists;
      }
    | undefined;
  subreddit: Subreddit | undefined;
  openPostPermaLink: string | undefined;
  openSubredditLink: string | undefined;
  showButtonControls: ShowButtonControls;
};

const initialState: InitialState = {
  showContextMenu: false,
  x: 0,
  y: 0,
  copyInfo: undefined,
  subreddit: undefined,
  updateSubredditListInfo: undefined,
  openPostPermaLink: undefined,
  openSubredditLink: undefined,
  showButtonControls: {
    showOpenImageInNewTab: false,
    showOpenPost: false,
    showOpenSubreddit: false,
    showCopy: false,
    showSkipToSubreddit: false,
    showAddToList: false,
    expandAddToList: false,
    showRemoveFromList: false,
    expandRemoveFromList: false,
    showUpdateListName: false,
    showDeleteList: false,
  },
};

export const contextMenuSlice = createSlice({
  name: "contextMenu",
  initialState: initialState,
  reducers: {
    setPostContextMenuEvent: (
      state,
      action: {
        type: string;
        payload: {
          event: PostContextMenuEvent;
          showButtonOverride?: ShowButtonControlsOptional | undefined;
        };
      }
    ) => {
      const post = action.payload.event.post;
      setContextStateFields(
        state,
        action.payload.event,
        { post: post },
        action.payload.showButtonOverride
      );
    },
    setSubredditListItemContextMenuEvent: (
      state,
      action: {
        type: string;
        payload: {
          event: SubredditListItemContextMenuEvent;
          showButtonOverride?: ShowButtonControlsOptional | undefined;
        };
      }
    ) => {
      const subreddit = action.payload.event.subreddit;
      setContextStateFields(
        state,
        action.payload.event,
        { subreddit: subreddit },
        action.payload.showButtonOverride
      );
    },
    setSubredditListContextMenuEvent: (
      state,
      action: {
        type: string;
        payload: {
          event: SubredditListContextMenuEvent;
          showButtonOverride?: ShowButtonControlsOptional | undefined;
        };
      }
    ) => {
      const subredditList = action.payload.event.subredditList;
      setContextStateFields(
        state,
        action.payload.event,
        { subredditLists: subredditList },
        action.payload.showButtonOverride
      );
    },
    setRedditSearchItemContextMenuEvent: (
      state,
      action: {
        type: string;
        payload: {
          event: RedditSearchItemContextMenuEvent;
          showButtonOverride?: ShowButtonControlsOptional | undefined;
        };
      }
    ) => {
      const searchResultItem = action.payload.event.searchResultItem;
      setContextStateFields(
        state,
        action.payload.event,
        { subredditAccountSearchResult: searchResultItem },
        action.payload.showButtonOverride
      );
    },
    setSideBarSubredditMenuEvent: (
      state,
      action: {
        type: string;
        payload: {
          event: SideBarSubredditMenuEvent;
          showButtonOverride?: ShowButtonControlsOptional | undefined;
        };
      }
    ) => {
      const subreddit = action.payload.event.subreddit;
      setContextStateFields(
        state,
        action.payload.event,
        { subreddit: subreddit },
        action.payload.showButtonOverride
      );
    },
    closeContextMenu: (state) => {
      resetContextMenuFields(state);
    },
    setExpandAddToList: (state, action: { type: string; payload: boolean }) => {
      state.showButtonControls.expandAddToList = action.payload;
      state.showButtonControls.expandRemoveFromList = false;
    },
    setExpandRemoveToList: (
      state,
      action: { type: string; payload: boolean }
    ) => {
      state.showButtonControls.expandRemoveFromList = action.payload;
      state.showButtonControls.expandAddToList = false;
    },
  },
});

function resetContextMenuFields(state: InitialState) {
  state.showContextMenu = false;
  state.x = 0;
  state.y = 0;
  state.copyInfo = undefined;
  state.subreddit = undefined;
  state.updateSubredditListInfo = undefined;
  state.openPostPermaLink = undefined;
  state.openSubredditLink = undefined;
  state.showButtonControls.showOpenImageInNewTab = false;
  state.showButtonControls.showOpenPost = false;
  state.showButtonControls.showOpenSubreddit = false;
  state.showButtonControls.showCopy = false;
  state.showButtonControls.showSkipToSubreddit = false;
  state.showButtonControls.showAddToList = false;
  state.showButtonControls.expandAddToList = false;
  state.showButtonControls.showRemoveFromList = false;
  state.showButtonControls.expandRemoveFromList = false;
  state.showButtonControls.showUpdateListName = false;
}

function buildOpenPostPermaLink(permaLink: string) {
  return `https://www.reddit.com${permaLink}`;
}

function buildOpenSubredditLink(isUser: boolean, displayName: string) {
  return `https://www.reddit.com/${isUser ? "u" : "r"}/${displayName}`;
}

const setContextStateFields = (
  state: InitialState,
  event: CustomContextMenuEvent,
  contextDataObjects: ContextDataObjects,
  showButtonControls?: ShowButtonControlsOptional
) => {
  resetContextMenuFields(state);
  state.showContextMenu = true;
  state.x = event.x;
  state.y = event.y;

  if (contextDataObjects.post != undefined) {
    const post = contextDataObjects.post;
    state.copyInfo = {
      url: post.attachments[post.currentAttachmentIndex].url,
      mediaType: post.attachments[post.currentAttachmentIndex].mediaType,
    };
    state.openPostPermaLink = buildOpenPostPermaLink(post.permaLink);
    state.openSubredditLink = buildOpenSubredditLink(
      post.subreddit.isUser,
      post.subreddit.displayName
    );
    state.subreddit = post.subreddit;

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
    state.showButtonControls.showOpenPost = showOpenPost;
    state.showButtonControls.showOpenImageInNewTab = showOpenImageInNewTab;
    state.showButtonControls.showOpenSubreddit = showOpenSubreddit;
    state.showButtonControls.showCopy = showCopy;
    state.showButtonControls.showSkipToSubreddit = showSkipToSubreddit;
    state.showButtonControls.showAddToList = showAddToList;
    state.showButtonControls.showRemoveFromList = showRemoveFromList;
  }

  if (contextDataObjects.subreddit != undefined) {
    const subreddit = contextDataObjects.subreddit;
    state.subreddit = subreddit;
    state.openSubredditLink = buildOpenSubredditLink(
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
    state.showButtonControls.showOpenSubreddit = showOpenSubreddit;
    state.showButtonControls.showSkipToSubreddit = showSkipToSubreddit;
    state.showButtonControls.showAddToList = showAddToList;
    state.showButtonControls.showRemoveFromList = showRemoveFromList;
  }

  if (contextDataObjects.subredditLists != undefined) {
    const subredditList = contextDataObjects.subredditLists;
    state.updateSubredditListInfo = {
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
    state.showButtonControls.showUpdateListName = showUpdateListName;
    state.showButtonControls.showDeleteList = showDeleteList;
  }

  if (contextDataObjects.subredditAccountSearchResult) {
    const searchResultItem = contextDataObjects.subredditAccountSearchResult;
    console.log(searchResultItem);
    state.openSubredditLink = buildOpenSubredditLink(
      searchResultItem.isUser,
      searchResultItem.displayName
    );
    state.subreddit = searchResultItem;

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
    state.showButtonControls.showOpenSubreddit = showOpenSubreddit;
    state.showButtonControls.showSkipToSubreddit = showSkipToSubreddit;
    state.showButtonControls.showAddToList = showAddToList;
    state.showButtonControls.showRemoveFromList = showRemoveFromlist;
  }
};

export const {
  setPostContextMenuEvent,
  setSubredditListItemContextMenuEvent,
  setSubredditListContextMenuEvent,
  setSideBarSubredditMenuEvent,
  closeContextMenu,
  setRedditSearchItemContextMenuEvent,
  setExpandAddToList,
  setExpandRemoveToList,
} = contextMenuSlice.actions;
export default contextMenuSlice.reducer;
