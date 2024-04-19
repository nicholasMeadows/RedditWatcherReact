import { FC, useContext } from "react";
import PostMediaElement from "./PostMediaElement.tsx";
import PostContextMenuEvent from "../../model/Events/PostContextMenuEvent.ts";
import { SINGPLE_POST_ROUTE } from "../../RedditWatcherConstants.ts";
import { useAppDispatch, useAppSelector } from "../../redux/store.ts";
import { useNavigate } from "react-router-dom";
import UserFrontPagePostSortOrderOptionsEnum from "../../model/config/enums/UserFrontPagePostSortOrderOptionsEnum.ts";
import { AutoScrollPostRowOptionEnum } from "../../model/config/enums/AutoScrollPostRowOptionEnum.ts";
import { PostCardContext } from "../../context/post-card-context.ts";
import { SinglePostPageContext } from "../../context/single-post-page-context.ts";
import usePostRows from "../../hook/use-post-rows.ts";
import { PostRowsContext } from "../../context/post-rows-context.ts";
import { AutoScrollPostRowRateMsContext } from "./PostRowPage.tsx";
import { setPostContextMenuEvent } from "../../redux/slice/ContextMenuSlice.ts";

const PostCard: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const postRowsHook = usePostRows();
  const {
    uiPost,
    postRowUuid,
    userFrontPagePostSortOrderOptionAtRowCreation,
    mouseOverPostRow,
    totalMovementX,
  } = useContext(PostCardContext);

  const { postRowsContextData } = useContext(PostRowsContext);

  const autoScrollPostRowOption = useAppSelector(
    (state) => state.appConfig.autoScrollPostRowOption
  );

  const autoScrollPostRowRateMs = useContext(AutoScrollPostRowRateMsContext);

  const { setSinglePostPagePostRowUuid, setSinglePostPagePostUuid } =
    useContext(SinglePostPageContext);

  return (
    <div
      className={`post-card-outer`}
      style={{
        minWidth: `${postRowsContextData.postCardWidthPercentage}%`,
        maxWidth: `${postRowsContextData.postCardWidthPercentage}%`,
        left: `${uiPost.leftPercentage}%`,
        transition: `${
          mouseOverPostRow ||
          userFrontPagePostSortOrderOptionAtRowCreation ==
            UserFrontPagePostSortOrderOptionsEnum.New ||
          autoScrollPostRowOption ==
            AutoScrollPostRowOptionEnum.ScrollByPostWidth
            ? "none"
            : `left ${autoScrollPostRowRateMs}ms linear`
        }`,
      }}
    >
      <div
        className={"post-card-inner"}
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
        onClickCapture={(event) => {
          if (totalMovementX.current >= 50) {
            event.stopPropagation();
            event.preventDefault();
          }
        }}
        onClick={() => {
          setSinglePostPagePostRowUuid(postRowUuid);
          setSinglePostPagePostUuid(uiPost.postUuid);
          navigate(`${SINGPLE_POST_ROUTE}`);
          postRowsHook.mouseLeavePostRow(postRowUuid);
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
