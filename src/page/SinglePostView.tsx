import { FC, useCallback, useContext, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PostRowsContext } from "../context/post-rows-context.ts";
import useSinglePostPageZoom from "../hook/use-single-post-page-zoom.ts";
import { Post } from "../model/Post/Post.ts";
import PostContextMenuEvent from "../model/Events/PostContextMenuEvent.ts";
import { ContextMenuActionType } from "../reducer/context-menu-reducer.ts";
import { ContextMenuDispatchContext } from "../context/context-menu-context.ts";
import PostMediaElementContext from "../context/post-media-element-context.ts";
import { PostImageQualityEnum } from "../model/config/enums/PostImageQualityEnum.ts";
import PostMediaElement from "../components/PostMediaElement.tsx";
import { PostRow } from "../model/PostRow.ts";
import useIncrementAttachment from "../hook/use-iincrement-attachment.ts";
import {
  SINGLE_POST_PAGE_POST_ROW_UUID_KEY,
  SINGLE_POST_PAGE_POST_UUID_KEY,
  SINGLE_POST_ROUTE,
} from "../RedditWatcherConstants.ts";

const SinglePostView: FC = () => {
  const navigate = useNavigate();
  const [queryParams] = useSearchParams();
  const postRowUuid = queryParams.get("postRowUuid");
  const postUuid = queryParams.get("postUuid");
  const { postRows } = useContext(PostRowsContext);
  const contextMenuDispatch = useContext(ContextMenuDispatchContext);
  const postElementDivWrapperRef = useRef(null);

  let post: Post | undefined;
  let postRow: PostRow | undefined;
  if (postRowUuid !== null && postUuid !== null) {
    postRow = postRows.find((postRow) => postRow.postRowUuid === postRowUuid);
    if (postRow !== undefined) {
      post = postRow.posts.find((post) => post.postUuid === postUuid);
    }
  }

  const findPostIndexFromState = useCallback(() => {
    if (postRow === undefined || post === undefined) {
      return;
    }
    return postRow.posts.findIndex((post) => post.postUuid === postUuid);
  }, [post, postRow, postUuid]);

  const goToNextPostClicked = useCallback(() => {
    const postIndex = findPostIndexFromState();
    if (
      postIndex === undefined ||
      postRow === undefined ||
      postRowUuid === null
    ) {
      return;
    }

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
  }, [findPostIndexFromState, navigate, postRow, postRowUuid]);

  const goToPrevPostClicked = useCallback(() => {
    const postIndex = findPostIndexFromState();
    if (
      postIndex === undefined ||
      postRow === undefined ||
      postRowUuid === null
    ) {
      return;
    }

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
  }, [findPostIndexFromState, navigate, postRow, postRowUuid]);

  const singlePostPageZoom = useSinglePostPageZoom(
    postElementDivWrapperRef,
    goToNextPostClicked,
    goToPrevPostClicked
  );

  const incrementAttachmentHook = useIncrementAttachment(
    post,
    postRowUuid,
    false
  );

  useEffect(() => {
    const documentKeyUpEvent = (keyboardEvent: globalThis.KeyboardEvent) => {
      const key = keyboardEvent.key;
      if (key === "ArrowRight" || key === "ArrowLeft") {
        singlePostPageZoom.resetImgPositionAndScale();
        if (key == "ArrowRight") {
          goToNextPostClicked();
        } else if (key == "ArrowLeft") {
          goToPrevPostClicked();
        }
      }
    };

    document.body.addEventListener("keyup", documentKeyUpEvent);
    return () => {
      document.body.removeEventListener("keyup", documentKeyUpEvent);
    };
  }, [goToNextPostClicked, goToPrevPostClicked, singlePostPageZoom]);

  return (
    <>
      {post != undefined && (
        <div
          className="single-post-view flex flex-column max-width-height-percentage"
          onTouchStart={singlePostPageZoom.onTouchStart}
          onTouchMove={singlePostPageZoom.onTouchMove}
          onTouchEnd={singlePostPageZoom.onTouchEnd}
        >
          <h4 className="text-align-center text-color">
            {post.subreddit.displayNamePrefixed}
          </h4>

          <div
            ref={postElementDivWrapperRef}
            onContextMenu={(event) => {
              if (post === undefined) return;
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
            className="flex flex-column max-width-height-percentage single-post-view-post-element"
          >
            <PostMediaElementContext.Provider
              value={{
                post: post,
                currentAttachmentIndex: post.currentAttachmentIndex,
                incrementPostAttachment:
                  incrementAttachmentHook.incrementPostAttachment,
                decrementPostAttachment:
                  incrementAttachmentHook.decrementPostAttachment,
                jumpToPostAttachment:
                  incrementAttachmentHook.jumpToPostAttachment,
                autoIncrementAttachments: false,
                scale: singlePostPageZoom.imgScale,
                imgXPercent: singlePostPageZoom.imgXPercent,
                imgYPercent: singlePostPageZoom.imgYPercent,
                onMouseOut: singlePostPageZoom.postMediaElementOnMouseOUt,
                onMouseDown: singlePostPageZoom.postMediaElementOnMouseDown,
                onMouseUp: singlePostPageZoom.postMediaElementOnMouseUp,
                onMouseMove: singlePostPageZoom.postMediaElementOnMouseMove,
                onWheel: singlePostPageZoom.postMediaElementOnWheel,
                onTouchStart: singlePostPageZoom.postMediaElementOnTouchStart,
                onTouchMove: singlePostPageZoom.postMediaElementOnTouchMove,
                carouselLeftButtonClick:
                  singlePostPageZoom.resetImgPositionAndScale,
                carouselRightButtonClick:
                  singlePostPageZoom.resetImgPositionAndScale,
                postImageQuality: PostImageQualityEnum.High,
              }}
            >
              <PostMediaElement />
            </PostMediaElementContext.Provider>
          </div>
          {postRow !== undefined && postRow.posts.length > 1 && (
            <div className="post-control-button-box">
              <div className="post-control-button-wrapper">
                <button
                  className="post-control-button"
                  onClick={goToPrevPostClicked}
                >
                  Previous
                </button>
              </div>
              <div className="post-control-button-wrapper">
                <button
                  className="post-control-button"
                  onClick={goToNextPostClicked}
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
