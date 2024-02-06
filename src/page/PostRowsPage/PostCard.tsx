import { FC, useContext } from "react";
import PostMediaElement from "./PostMediaElement.tsx";
import UserFrontPagePostSortOrderOptionsEnum from "../../model/config/enums/UserFrontPagePostSortOrderOptionsEnum.ts";
import { AutoScrollPostRowOptionEnum } from "../../model/config/enums/AutoScrollPostRowOptionEnum.ts";
import PostContextMenuEvent from "../../model/Events/PostContextMenuEvent.ts";
import { setPostContextMenuEvent } from "../../redux/slice/ContextMenuSlice.ts";
import { setPostAndRowUuid } from "../../redux/slice/SinglePostPageSlice.ts";
import { SINGPLE_POST_ROUTE } from "../../RedditWatcherConstants.ts";
import { PostCardContext } from "../Context.ts";
import { useAppDispatch, useAppSelector } from "../../redux/store.ts";
import { useNavigate } from "react-router-dom";

const PostCard: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    uiPost,
    postRowUuid,
    userFrontPagePostSortOrderOptionAtRowCreation,
    handleMouseDownTouchStart,
    stopPostCardTransition,
    handleMouseUpTouchEnd,
    handleMouseTouchMove,
    handlePostCardClickCapture,
  } = useContext(PostCardContext);

  const postCardWidthPercentage = useAppSelector(
    (state) => state.postRows.postCardWidthPercentage
  );
  const mouseOverPostRowUuid = useAppSelector(
    (state) => state.postRows.mouseOverPostRowUuid
  );
  const autoScrollPostRowOption = useAppSelector(
    (state) => state.appConfig.autoScrollPostRowOption
  );
  return (
    <div
      className={`post-card-outer`}
      style={{
        minWidth: `${postCardWidthPercentage}%`,
        maxWidth: `${postCardWidthPercentage}%`,
        left: `${uiPost.leftPercentage}%`,
        transition: `${
          mouseOverPostRowUuid == postRowUuid ||
          userFrontPagePostSortOrderOptionAtRowCreation ==
            UserFrontPagePostSortOrderOptionsEnum.New ||
          autoScrollPostRowOption ==
            AutoScrollPostRowOptionEnum.ScrollByPostWidth
            ? "none"
            : "left 6000ms linear"
        }`,
      }}
    >
      <div
        className={"post-card-inner"}
        onTouchStart={(event) => {
          handleMouseDownTouchStart(event.touches[0].clientX);
          stopPostCardTransition(uiPost, event.currentTarget as HTMLDivElement);
        }}
        onTouchEnd={() => {
          handleMouseUpTouchEnd();
        }}
        onTouchMove={(event) => {
          handleMouseTouchMove(event.touches[0].clientX);
        }}
        onMouseDown={(event) => {
          handleMouseDownTouchStart(event.clientX);
        }}
        onMouseUp={() => {
          handleMouseUpTouchEnd();
        }}
        onMouseMove={(event) => {
          handleMouseTouchMove(event.clientX);
        }}
        onContextMenu={(event) => {
          event.preventDefault();
          event.stopPropagation();
          const postContextMenuEvent: PostContextMenuEvent = {
            post: uiPost,
            x: event.clientX,
            y: event.clientY,
          };
          dispatch(setPostContextMenuEvent({ event: postContextMenuEvent }));
        }}
        onClick={() => {
          dispatch(
            setPostAndRowUuid({
              postRowUuid: postRowUuid,
              postUuid: uiPost.postUuid,
            })
          );
          navigate(`${SINGPLE_POST_ROUTE}`);
        }}
        onClickCapture={(event) => {
          handlePostCardClickCapture(event);
        }}
        onMouseEnter={(event) => {
          event.preventDefault();
          event.stopPropagation();
          stopPostCardTransition(uiPost, event.currentTarget as HTMLDivElement);
        }}
      >
        <div className="postCardHeader">
          <p className="postCardHeaderText">{`${uiPost.subreddit.displayName}${
            uiPost.attachments.length > 1 ? " (Gallery)" : ""
          }`}</p>
          {uiPost.subreddit.fromList.length > 0 && (
            <p className="postCardHeaderText">{`From List: ${uiPost.subreddit.fromList}`}</p>
          )}
          <p className="postCardHeaderText">
            {new Date(uiPost.created * 1000).toLocaleDateString("en-us", {
              month: "long",
              day: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          {!uiPost.subreddit.displayName.startsWith("u_") && (
            <p className="postCardHeaderText">{`Subscribers: ${uiPost.subreddit.subscribers.toLocaleString()}`}</p>
          )}
          <p className="postCardHeaderText">{uiPost.randomSourceString}</p>
        </div>
        <div className="post-card-content">
          <PostMediaElement postRowUuid={postRowUuid} post={uiPost} />
        </div>
      </div>
    </div>
  );
};
export default PostCard;
