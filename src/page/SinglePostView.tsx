import { FC, useCallback, useContext, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PostRowsContext } from "../context/post-rows-context.ts";
import { Post } from "../model/Post/Post.ts";
import PostMediaElementContext from "../context/post-media-element-context.ts";
import { PostImageQualityEnum } from "../model/config/enums/PostImageQualityEnum.ts";
import PostMediaElement from "../components/PostMediaElement.tsx";
import { PostRow } from "../model/PostRow.ts";
import { ContextMenuDispatchContext } from "../context/context-menu-context.ts";
import { ContextMenuActionType } from "../reducer/context-menu-reducer.ts";
import {
  SINGLE_POST_PAGE_POST_ROW_UUID_KEY,
  SINGLE_POST_PAGE_POST_UUID_KEY,
  SINGLE_POST_ROUTE,
} from "../RedditWatcherConstants.ts";
import PostMediaElementZoomContext from "../context/post-media-element-zoom-context.ts";
import useSinglePostPageZoom from "../hook/use-single-post-page-zoom.ts";
import useIncrementAttachment from "../hook/use-iincrement-attachment.ts";

const SinglePostView: FC = () => {
  const navigate = useNavigate();
  const [queryParams] = useSearchParams();
  const postRowUuid = queryParams.get("postRowUuid");
  const postUuid = queryParams.get("postUuid");
  const { postRows } = useContext(PostRowsContext);
  const postElementDivWrapperRef = useRef<HTMLDivElement>(null);
  const contextMenuDispatch = useContext(ContextMenuDispatchContext);

  let post: Post | undefined;
  let postRow: PostRow | undefined;
  let postIndex: number | undefined;

  if (postRowUuid !== null && postUuid !== null) {
    postRow = postRows.find((postRow) => postRow.postRowUuid === postRowUuid);
    if (postRow !== undefined) {
      postIndex = postRow.posts.findIndex((post) => post.postUuid === postUuid);
      if (postIndex !== -1) {
        post = postRow.posts[postIndex];
      }
    }
  }

  const { decrementPostAttachment, incrementPostAttachment } =
    useIncrementAttachment(post, postRowUuid, false, true);

  const goToNextPostClicked = useCallback(() => {
    if (
      post === undefined ||
      postIndex === undefined ||
      postRow === undefined ||
      postRowUuid === null
    ) {
      return;
    }

    const attachmentsLength = post.attachments.length;
    const currentAttachmentIndex = post.currentAttachmentIndex;
    if (currentAttachmentIndex === attachmentsLength - 1) {
      let postUuid: string;
      if (postIndex < postRow.posts.length - 1) {
        postUuid = postRow.posts[postIndex + 1].postUuid;
      } else {
        postUuid = postRow.posts[0].postUuid;
      }

      navigate(
        `${SINGLE_POST_ROUTE}?${SINGLE_POST_PAGE_POST_ROW_UUID_KEY}=${postRowUuid}&${SINGLE_POST_PAGE_POST_UUID_KEY}=${postUuid}`,
        { replace: true }
      );
    } else {
      incrementPostAttachment();
    }
  }, [
    incrementPostAttachment,
    navigate,
    post,
    postIndex,
    postRow,
    postRowUuid,
  ]);

  const goToPrevPostClicked = useCallback(() => {
    if (
      post === undefined ||
      postIndex === undefined ||
      postRow === undefined ||
      postRowUuid === null
    ) {
      return;
    }

    const currentAttachmentIndex = post.currentAttachmentIndex;
    if (currentAttachmentIndex === 0) {
      let postUuid: string;
      if (postIndex == 0) {
        postUuid = postRow.posts[postRow.posts.length - 1].postUuid;
      } else {
        postUuid = postRow.posts[postIndex - 1].postUuid;
      }
      navigate(
        `${SINGLE_POST_ROUTE}?${SINGLE_POST_PAGE_POST_ROW_UUID_KEY}=${postRowUuid}&${SINGLE_POST_PAGE_POST_UUID_KEY}=${postUuid}`,
        { replace: true }
      );
    } else {
      decrementPostAttachment();
    }
  }, [
    decrementPostAttachment,
    navigate,
    post,
    postIndex,
    postRow,
    postRowUuid,
  ]);

  const { resetImgPositionAndScale, imgScale, imgXPercent, imgYPercent } =
    useSinglePostPageZoom(
      postElementDivWrapperRef,
      goToNextPostClicked,
      goToPrevPostClicked
    );

  useEffect(() => {
    const documentKeyUpEvent = (keyboardEvent: globalThis.KeyboardEvent) => {
      if (post === undefined) {
        return;
      }
      const key = keyboardEvent.key;

      resetImgPositionAndScale();
      if (key === "ArrowLeft") {
        goToPrevPostClicked();
      } else if (key === "ArrowRight") {
        goToNextPostClicked();
      }
    };

    document.body.addEventListener("keyup", documentKeyUpEvent);
    return () => {
      document.body.removeEventListener("keyup", documentKeyUpEvent);
    };
  }, [
    decrementPostAttachment,
    goToNextPostClicked,
    goToPrevPostClicked,
    incrementPostAttachment,
    post,
    resetImgPositionAndScale,
  ]);

  return (
    <>
      {post != undefined && postRowUuid != undefined && (
        <div className="single-post-view flex flex-column max-width-height-percentage">
          <h4 className="text-align-center text-color">
            {post.subreddit.displayNamePrefixed}
          </h4>

          <div
            ref={postElementDivWrapperRef}
            onContextMenu={(event) => {
              if (post === undefined || postRowUuid === null) return;
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
            className="flex flex-column max-width-height-percentage single-post-view-post-element"
          >
            <PostMediaElementZoomContext.Provider
              value={{
                imgXPercent: imgXPercent,
                imgYPercent: imgYPercent,
                scale: imgScale,
              }}
            >
              <PostMediaElementContext.Provider
                value={{
                  post: post,
                  postRowUuid: postRowUuid,
                  autoIncrementAttachment: false,
                  mouseOverPostCard: false,
                  postImageQuality: PostImageQualityEnum.High,
                }}
              >
                <PostMediaElement />
              </PostMediaElementContext.Provider>
            </PostMediaElementZoomContext.Provider>
          </div>
          {postRow !== undefined && postRow.posts.length > 1 && (
            <div className="post-control-button-box">
              <div className="post-control-button-wrapper">
                <button
                  className="post-control-button"
                  onClick={() => {
                    resetImgPositionAndScale();
                    goToPrevPostClicked();
                  }}
                >
                  Previous
                </button>
              </div>
              <div className="post-control-button-wrapper">
                <button
                  className="post-control-button"
                  onClick={() => {
                    resetImgPositionAndScale();
                    goToNextPostClicked();
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default SinglePostView;
