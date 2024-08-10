import { FC, memo, useContext, useRef } from "react";
import { PostCardContext } from "../context/post-card-context.ts";
import "../theme/post-card.scss";
import {
  SINGLE_POST_PAGE_POST_ROW_UUID_KEY,
  SINGLE_POST_PAGE_POST_UUID_KEY,
  SINGLE_POST_ROUTE,
} from "../RedditWatcherConstants.ts";
import PostContextMenuEvent from "../model/Events/PostContextMenuEvent.ts";
import PostMediaElement from "./PostMediaElement.tsx";
import { useNavigate } from "react-router-dom";
import useIncrementAttachment from "../hook/use-iincrement-attachment.ts";
import { ContextMenuDispatchContext } from "../context/context-menu-context.ts";
import { ContextMenuActionType } from "../reducer/context-menu-reducer.ts";
import { PostRowsDispatchContext } from "../context/post-rows-context.ts";
import { PostRowsActionType } from "../reducer/post-rows-reducer.ts";
import PostMediaElementContext from "../context/post-media-element-context.ts";

const PostCard: FC = memo(() => {
  const navigate = useNavigate();
  const postRowsDispatch = useContext(PostRowsDispatchContext);
  const { postRowUuid, post } = useContext(PostCardContext);
  const contextMenuDispatch = useContext(ContextMenuDispatchContext);
  const initialMouseDownOrTouchX = useRef(0);

  const {
    clearAutoIncrementPostAttachmentInterval,
    setupAutoIncrementPostAttachmentInterval,
    incrementPostAttachment,
    decrementPostAttachment,
    jumpToPostAttachment,
  } = useIncrementAttachment(post, postRowUuid, true);

  return (
    <div
      className={`post-card-outer`}
      onMouseDown={(event) => {
        initialMouseDownOrTouchX.current = event.clientX;
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const postContextMenuEvent: PostContextMenuEvent = {
          post: post,
          x: event.clientX,
          y: event.clientY,
        };
        contextMenuDispatch({
          type: ContextMenuActionType.SET_POST_CONTEXT_MENU_EVENT,
          payload: { event: postContextMenuEvent },
        });
      }}
      onClickCapture={(event) => {
        if (Math.abs(initialMouseDownOrTouchX.current - event.clientX) >= 50) {
          event.stopPropagation();
          event.preventDefault();
        }
        initialMouseDownOrTouchX.current = 0;
      }}
      onClick={() => {
        navigate(
          `${SINGLE_POST_ROUTE}?${SINGLE_POST_PAGE_POST_ROW_UUID_KEY}=${postRowUuid}&${SINGLE_POST_PAGE_POST_UUID_KEY}=${post.postUuid}`
        );
        postRowsDispatch({
          type: PostRowsActionType.SET_MOUSE_OVER_A_POST_ROW,
          payload: false,
        });
      }}
      onMouseEnter={() => {
        clearAutoIncrementPostAttachmentInterval();
      }}
      onMouseLeave={() => {
        setupAutoIncrementPostAttachmentInterval();
      }}
    >
      <div className="postCardHeader">
        <p className="postCardHeaderText">{`${post.subreddit.displayName}${
          post.attachments.length > 1 ? " (Gallery)" : ""
        }`}</p>
        {post.subreddit.fromList.length > 0 && (
          <p className="postCardHeaderText">{`From List: ${post.subreddit.fromList}`}</p>
        )}
        <p className="postCardHeaderText">
          {new Date(post.created * 1000).toLocaleDateString("en-us", {
            month: "long",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        {!post.subreddit.displayName.startsWith("u_") && (
          <p className="postCardHeaderText">{`Subscribers: ${post.subreddit.subscribers.toLocaleString()}`}</p>
        )}
        <p className="postCardHeaderText">{post.randomSourceString}</p>
      </div>
      <div className="post-card-content">
        <PostMediaElementContext.Provider
          value={{
            post: post,
            incrementPostAttachment: incrementPostAttachment,
            decrementPostAttachment: decrementPostAttachment,
            jumpToPostAttachment: jumpToPostAttachment,
            currentAttachmentIndex: post.currentAttachmentIndex,
          }}
        >
          <PostMediaElement />
        </PostMediaElementContext.Provider>
      </div>
    </div>
  );
});
export default PostCard;
