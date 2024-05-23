import { FC, useEffect, useRef, useState } from "react";
import PostContextMenuEvent from "../model/Events/PostContextMenuEvent.ts";
import PostMediaElement from "./PostRowsPage/PostMediaElement.tsx";
import { useAppDispatch, useAppSelector } from "../redux/store.ts";
import { setPostContextMenuEvent } from "../redux/slice/ContextMenuSlice.ts";
import { Post } from "../model/Post/Post.ts";
import useSinglePostPageZoom from "../hook/use-single-post-page-zoom.ts";
import { PostImageQualityEnum } from "../model/config/enums/PostImageQualityEnum.ts";
import useIncrementAttachment from "../hook/use-iincrement-attachment.ts";

const SinglePostView: FC = () => {
  const dispatch = useAppDispatch();
  const singlePostPageState = useAppSelector((state) => state.singlePostPage);
  const postRowsState = useAppSelector((state) => state.postRows);
  const [post, setPost] = useState<Post | undefined>();
  const postElementDivWrapperRef = useRef(null);
  const singlePostPageZoom = useSinglePostPageZoom(
    postElementDivWrapperRef,
    singlePostPageState,
    postRowsState
  );

  useEffect(() => {
    const postRows = postRowsState.postRows;
    const postRowUuid = singlePostPageState.postRowUuid;
    const postRow = postRows.find(
      (postRow) => postRow.postRowUuid === postRowUuid
    );
    if (postRow !== undefined) {
      const postUuid = singlePostPageState.postUuid;
      setPost(postRow.posts.find((post) => post.postUuid === postUuid));
    }
  }, [
    postRowsState.postRows,
    singlePostPageState.postRowUuid,
    singlePostPageState.postUuid,
  ]);

  const incrementAttachmentHook = useIncrementAttachment(
    singlePostPageState.postRowUuid,
    post,
    false
  );
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

          {singlePostPageState.postRowUuid != undefined && (
            <div
              ref={postElementDivWrapperRef}
              onContextMenu={(event) => {
                event.preventDefault();
                event.stopPropagation();
                const postContextMenuEvent: PostContextMenuEvent = {
                  post: post,
                  x: event.clientX,
                  y: event.clientY,
                };
                dispatch(
                  setPostContextMenuEvent({ event: postContextMenuEvent })
                );
              }}
              className="flex flex-column max-width-height-percentage single-post-view-post-element"
            >
              <PostMediaElement
                post={post}
                currentAttachmentIndex={
                  incrementAttachmentHook.currentAttachmentIndex
                }
                incrementPostAttachment={
                  incrementAttachmentHook.incrementPostAttachment
                }
                decrementPostAttachment={
                  incrementAttachmentHook.decrementPostAttachment
                }
                jumpToPostAttachment={
                  incrementAttachmentHook.jumpToPostAttachment
                }
                autoIncrementAttachments={false}
                scale={singlePostPageZoom.imgScale}
                imgXPercent={singlePostPageZoom.imgXPercent}
                imgYPercent={singlePostPageZoom.imgYPercent}
                onMouseOut={singlePostPageZoom.postMediaElementOnMouseOUt}
                onMouseDown={singlePostPageZoom.postMediaElementOnMouseDown}
                onMouseUp={singlePostPageZoom.postMediaElementOnMouseUp}
                onMouseMove={singlePostPageZoom.postMediaElementOnMouseMove}
                onWheel={singlePostPageZoom.postMediaElementOnWheel}
                onTouchStart={singlePostPageZoom.postMediaElementOnTouchStart}
                onTouchMove={singlePostPageZoom.postMediaElementOnTouchMove}
                carouselLeftButtonClick={
                  singlePostPageZoom.resetImgPositionAndScale
                }
                carouselRightButtonClick={
                  singlePostPageZoom.resetImgPositionAndScale
                }
                postImageQuality={PostImageQualityEnum.High}
              />
            </div>
          )}
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
        </div>
      )}
    </>
  );
};

export default SinglePostView;
