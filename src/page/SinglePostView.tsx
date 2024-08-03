import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Post } from "../model/Post/Post.ts";
import {
  SinglePostPageContext,
  SinglePostPageDispatchContext,
} from "../context/single-post-page-context.ts";
import { PostRowsContext } from "../context/post-rows-context.ts";
import PostContextMenuEvent from "../model/Events/PostContextMenuEvent.ts";
import { ContextMenuActionType } from "../reducer/context-menu-reducer.ts";
import { ContextMenuDispatchContext } from "../context/context-menu-context.ts";
import PostMediaElement from "../components/PostMediaElement.tsx";
import useIncrementAttachment from "../hook/use-iincrement-attachment.ts";
import { PostImageQualityEnum } from "../model/config/enums/PostImageQualityEnum.ts";
import { PostRow } from "../model/PostRow.ts";
import useSinglePostPageZoom from "../hook/use-single-post-page-zoom.ts";
import { SinglePostPageActionType } from "../reducer/single-post-page-reducer.ts";
import PostMediaElementContext from "../context/post-media-element-context.ts";

type SinglePostViewState = {
  post: Post | undefined;
  postRow: PostRow | undefined;
};
const SinglePostView: FC = () => {
  const { postRowUuid, postUuid } = useContext(SinglePostPageContext);
  const { postRows } = useContext(PostRowsContext);
  const singlePostPageDispatch = useContext(SinglePostPageDispatchContext);
  const contextMenuDispatch = useContext(ContextMenuDispatchContext);
  const [singlePostViewState, setSinglePostViewState] =
    useState<SinglePostViewState>({ post: undefined, postRow: undefined });
  const postElementDivWrapperRef = useRef(null);

  const findPostIndexFromState = useCallback(() => {
    const postRow = singlePostViewState.postRow;
    const post = singlePostViewState.post;
    if (postRow === undefined || post === undefined) {
      return;
    }
    return postRow.posts.findIndex((post) => post.postUuid === postUuid);
  }, [postUuid, singlePostViewState.post, singlePostViewState.postRow]);

  const goToNextPostClicked = useCallback(() => {
    const postIndex = findPostIndexFromState();
    if (
      postRowUuid === undefined ||
      postIndex === undefined ||
      postIndex === -1 ||
      singlePostViewState.postRow === undefined
    ) {
      return;
    }

    let postUuidToSet: string;
    if (postIndex < singlePostViewState.postRow.posts.length - 1) {
      postUuidToSet = singlePostViewState.postRow.posts[postIndex + 1].postUuid;
    } else {
      postUuidToSet = singlePostViewState.postRow.posts[0].postUuid;
    }
    singlePostPageDispatch({
      type: SinglePostPageActionType.SET_SINGLE_POST_PAGE_UUIDS,
      payload: {
        postRowUuid: postRowUuid,
        postUuid: postUuidToSet,
      },
    });
  }, [
    findPostIndexFromState,
    postRowUuid,
    singlePostPageDispatch,
    singlePostViewState.postRow,
  ]);

  const goToPrevPostClicked = useCallback(() => {
    const postIndex = findPostIndexFromState();
    if (
      postRowUuid === undefined ||
      postIndex === undefined ||
      postIndex === -1 ||
      singlePostViewState.postRow === undefined
    ) {
      return;
    }
    let postUuid: string;
    if (postIndex == 0) {
      postUuid =
        singlePostViewState.postRow.posts[
          singlePostViewState.postRow.posts.length - 1
        ].postUuid;
    } else {
      postUuid = singlePostViewState.postRow.posts[postIndex - 1].postUuid;
    }
    singlePostPageDispatch({
      type: SinglePostPageActionType.SET_SINGLE_POST_PAGE_UUIDS,
      payload: {
        postRowUuid: postRowUuid,
        postUuid: postUuid,
      },
    });
  }, [
    findPostIndexFromState,
    postRowUuid,
    singlePostPageDispatch,
    singlePostViewState.postRow,
  ]);

  const singlePostPageZoom = useSinglePostPageZoom(
    postElementDivWrapperRef,
    goToNextPostClicked,
    goToPrevPostClicked
  );

  useEffect(() => {
    if (postRowUuid === undefined || postUuid === undefined) {
      return;
    }
    const postRow = postRows.find(
      (postRow) => postRow.postRowUuid === postRowUuid
    );
    if (postRow === undefined) {
      return;
    }
    const post = postRow.posts.find((post) => post.postUuid === postUuid);
    if (post === undefined) {
      return;
    }
    setSinglePostViewState({ post: post, postRow: postRow });
  }, [postRowUuid, postRows, postUuid]);

  const incrementAttachmentHook = useIncrementAttachment(
    singlePostViewState.post?.currentAttachmentIndex,
    singlePostViewState.post?.attachments,
    singlePostViewState.post?.postUuid,
    postRowUuid,
    false
  );

  return (
    <>
      {singlePostViewState.post != undefined && (
        <div
          className="single-post-view flex flex-column max-width-height-percentage"
          onTouchStart={singlePostPageZoom.onTouchStart}
          onTouchMove={singlePostPageZoom.onTouchMove}
          onTouchEnd={singlePostPageZoom.onTouchEnd}
        >
          <h4 className="text-align-center text-color">
            {singlePostViewState.post.subreddit.displayNamePrefixed}
          </h4>

          <div
            ref={postElementDivWrapperRef}
            onContextMenu={(event) => {
              if (singlePostViewState.post === undefined) return;
              event.preventDefault();
              event.stopPropagation();
              const postContextMenuEvent: PostContextMenuEvent = {
                post: singlePostViewState.post,
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
                post: singlePostViewState.post,
                currentAttachmentIndex:
                  singlePostViewState.post.currentAttachmentIndex,
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
          {singlePostViewState.postRow !== undefined &&
            singlePostViewState.postRow.posts.length > 1 && (
              <div className="post-control-button-box">
                <div className="post-control-button-wrapper">
                  <button
                    className="post-control-button"
                    onClick={singlePostPageZoom.goToPrevPostClicked}
                  >
                    Previous
                  </button>
                </div>
                <div className="post-control-button-wrapper">
                  <button
                    className="post-control-button"
                    onClick={singlePostPageZoom.goToNextPostClicked}
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
