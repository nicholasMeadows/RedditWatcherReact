import { FC, useContext, useRef, useState } from "react";
import { PostCardContext } from "../context/post-card-context.ts";
import "../theme/post-card.scss";
import {
  SINGLE_POST_PAGE_POST_ROW_UUID_KEY,
  SINGLE_POST_PAGE_POST_UUID_KEY,
  SINGLE_POST_ROUTE,
} from "../RedditWatcherConstants.ts";
import { useNavigate } from "react-router-dom";
import {
  ContextMenuDispatchContext,
  ContextMenuStateContext,
} from "../context/context-menu-context.ts";
import { ContextMenuActionType } from "../reducer/context-menu-reducer.ts";
import PostMediaElement from "./PostMediaElement.tsx";
import PostMediaElementContext from "../context/post-media-element-context.ts";
import { MediaType } from "../model/Post/MediaTypeEnum.ts";
import { AppConfigStateContext } from "../context/app-config-context.ts";
import {
  PostRowPageContext,
  PostRowPageDispatchContext,
} from "../context/post-row-page-context.ts";
import { PostRowPageActionType } from "../reducer/post-row-page-reducer.ts";
import IndividualPostRowContext from "../context/individual-post-row-context.ts";

const PostCard: FC = () => {
  const navigate = useNavigate();
  const { postsToShowInRow } = useContext(AppConfigStateContext);
  const postRowPageDispatch = useContext(PostRowPageDispatchContext);
  const { allPosts } = useContext(IndividualPostRowContext);

  const { postRowUuid, postCard } = useContext(PostCardContext);
  const initialMouseDownOrTouchX = useRef(0);
  const { showContextMenu } = useContext(ContextMenuStateContext);
  const contextMenuDispatch = useContext(ContextMenuDispatchContext);
  const [mouseOverPostCard, setMouseOverPostCard] = useState(false);

  const { showCardInfoOnCardUuid } = useContext(PostRowPageContext);
  const post = allPosts.find(
    (post) => post.postUuid === postCard.postToDisplayUuid
  );
  if (post === undefined) {
    return <></>;
  }
  const currentAttachment = post.attachments[post.currentAttachmentIndex];
  const attachmentUrl = currentAttachment.url;
  const attachmentMediaType = currentAttachment.mediaType;

  return (
    <div
      style={{
        minWidth: `calc(100vw/${postsToShowInRow})`,
        width: `calc(100vw/${postsToShowInRow})`,
        maxWidth: `calc(100vw/${postsToShowInRow})`,
      }}
    >
      <div
        className={`post-card-inner`}
        onMouseOver={() => {
          setMouseOverPostCard(true);
        }}
        onMouseLeave={() => setMouseOverPostCard(false)}
        onMouseDown={(event) => {
          initialMouseDownOrTouchX.current = event.clientX;
        }}
        onContextMenu={(event) => {
          event.preventDefault();
          event.stopPropagation();
          contextMenuDispatch({
            type: ContextMenuActionType.OPEN_CONTEXT_MENU_FOR_POST,
            payload: {
              post: post,
              x: event.clientX,
              y: event.clientY,
              postRowUuid: postRowUuid,
            },
          });
        }}
        onClickCapture={(event) => {
          if (
            Math.abs(initialMouseDownOrTouchX.current - event.clientX) >= 50
          ) {
            event.stopPropagation();
            event.preventDefault();
          }
          initialMouseDownOrTouchX.current = 0;
        }}
        onClick={() => {
          if (showContextMenu) {
            return;
          }
          navigate(
            `${SINGLE_POST_ROUTE}?${SINGLE_POST_PAGE_POST_ROW_UUID_KEY}=${postRowUuid}&${SINGLE_POST_PAGE_POST_UUID_KEY}=${post.postUuid}`
          );
          postRowPageDispatch({
            type: PostRowPageActionType.SET_MOUSE_OVER_POST_ROW_UUID,
            payload: undefined,
          });
          postRowPageDispatch({
            type: PostRowPageActionType.SET_SHOW_POST_CARD_INFO_ON_POST_UUID,
            payload: {
              showCardInfoOnCardUuid: undefined,
            },
          });
        }}
      >
        {attachmentMediaType !== MediaType.IFrame &&
          (() => {
            let url = attachmentUrl;
            if (
              currentAttachment.attachmentResolutions != undefined &&
              currentAttachment.attachmentResolutions.length > 0
            ) {
              const resolutions = currentAttachment.attachmentResolutions;
              const sortedResolutions = resolutions.sort((res1, res2) => {
                const pxCount1 = res1.width * res1.height;
                const pxCount2 = res2.width * res2.height;
                if (pxCount1 > pxCount2) {
                  return 1;
                } else if (pxCount1 < pxCount2) {
                  return -1;
                }
                return 0;
              });
              url = sortedResolutions[0].url;
            }
            return (
              <div className={"post-card-blur-background"}>
                <img src={url} />
              </div>
            );
          })()}
        <div
          className={`post-info-div ${
            showCardInfoOnCardUuid === postCard.postCardUuid
              ? "post-info-div-hover"
              : ""
          }`}
        >
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
              postRowUuid: postRowUuid,
              autoIncrementAttachment: true,
              mouseOverPostCard: mouseOverPostCard,
              postCardUuid: postCard.postCardUuid,
            }}
          >
            <PostMediaElement />
          </PostMediaElementContext.Provider>
        </div>
      </div>
    </div>
  );
};
export default PostCard;
