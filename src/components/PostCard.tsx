import { FC, memo, useContext, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../redux/store.ts";
import { PostCardContext } from "../context/post-card-context.ts";
import "../theme/post-card.scss";
import { setSinglePostPageUuids } from "../redux/slice/SinglePostPageSlice.ts";
import { mouseLeavePostRow } from "../redux/slice/PostRowsSlice.ts";
import {
  POST_CARD_LEFT_MARGIN_EM,
  SINGPLE_POST_ROUTE,
} from "../RedditWatcherConstants.ts";
import PostContextMenuEvent from "../model/Events/PostContextMenuEvent.ts";
import PostMediaElement from "./PostMediaElement.tsx";
import { useNavigate } from "react-router-dom";
import useIncrementAttachment from "../hook/use-iincrement-attachment.ts";
import { ContextMenuDispatchContext } from "../context/context-menu-context.ts";
import { ContextMenuActionType } from "../reducer/context-menu-reducer.ts";

const PostCard: FC = memo(() => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { postRowUuid, post } = useContext(PostCardContext);
  const contextMenuDispatch = useContext(ContextMenuDispatchContext);
  const postRowsState = useAppSelector((state) => state.postRows);
  const initialMouseDownOrTouchX = useRef(0);

  const incrementAttachmentHook = useIncrementAttachment(
    postRowUuid,
    post,
    true
  );
  return (
    <div
      className={`post-card-outer`}
      style={{
        minWidth: `calc(${postRowsState.postCardWidthPercentage}% - ((1em * ${POST_CARD_LEFT_MARGIN_EM})*2) )`,
        maxWidth: `calc(${postRowsState.postCardWidthPercentage}% - ((1em * ${POST_CARD_LEFT_MARGIN_EM})*2) )`,
      }}
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
        dispatch(
          setSinglePostPageUuids({
            postRowUuid: postRowUuid,
            postUuid: post.postUuid,
          })
        );
        navigate(`${SINGPLE_POST_ROUTE}`);
        dispatch(mouseLeavePostRow(postRowUuid));
      }}
      onMouseEnter={() => {
        incrementAttachmentHook.clearAutoIncrementPostAttachmentInterval();
      }}
      onMouseLeave={() => {
        incrementAttachmentHook.setupAutoIncrementPostAttachmentInterval();
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
        <PostMediaElement
          post={post}
          incrementPostAttachment={
            incrementAttachmentHook.incrementPostAttachment
          }
          decrementPostAttachment={
            incrementAttachmentHook.decrementPostAttachment
          }
          jumpToPostAttachment={incrementAttachmentHook.jumpToPostAttachment}
          currentAttachmentIndex={
            incrementAttachmentHook.currentAttachmentIndex
          }
        />
      </div>
    </div>
  );
});
export default PostCard;
