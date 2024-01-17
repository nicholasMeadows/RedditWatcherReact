import React, {
  MouseEventHandler,
  TouchEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
  WheelEventHandler,
} from "react";
import { useLocation } from "react-router-dom";
import { POST_ROW_ROUTE } from "../../RedditWatcherConstants";
import { Post } from "../../model/Post/Post";
import {
  decrementPostAttachment,
  incrementPostAttachment,
} from "../../redux/slice/PostRowsSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";

type Props = {
  postRowUuid: string;
  post: Post;
  autoIncrementAttachments?: boolean;
  scale?: number;
  imgXPercent?: number;
  imgYPercent?: number;
  onMouseOut?: MouseEventHandler;
  onMouseDown?: MouseEventHandler;
  onMouseUp?: MouseEventHandler;
  onMouseMove?: MouseEventHandler;
  onWheel?: WheelEventHandler;
  onTouchStart?: TouchEventHandler;
  onTouchMove?: TouchEventHandler;
};
const PostMediaElement: React.FC<Props> = ({
  postRowUuid,
  post,
  autoIncrementAttachments = true,
  scale = 1,
  imgXPercent = 50,
  imgYPercent = 50,
  onMouseOut,
  onMouseDown,
  onMouseUp,
  onMouseMove,
  onWheel,
  onTouchStart,
  onTouchMove,
}) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const darkMode = useAppSelector((state) => state.appConfig.darkMode);

  const [carouselArrowLightDarkPart, setCarouselArrowLightDarkPart] =
    useState("light");

  useEffect(() => {
    if (location.pathname == POST_ROW_ROUTE) {
      setCarouselArrowLightDarkPart("light");
    } else {
      if (darkMode) {
        setCarouselArrowLightDarkPart("dark");
      } else {
        setCarouselArrowLightDarkPart("light");
      }
    }
  }, [location, darkMode]);

  const autoIncrementPostAttachmentInterval = useRef<
    NodeJS.Timeout | undefined
  >();

  const setupAutoIncrementPostAttachmentInterval = useCallback(() => {
    if (post.attachments.length > 1 && autoIncrementAttachments) {
      autoIncrementPostAttachmentInterval.current = setInterval(() => {
        dispatch(
          incrementPostAttachment({
            postRowUuid: postRowUuid,
            postUuid: post.postUuid,
          })
        );
      }, 5000);
    }
  }, [autoIncrementAttachments, dispatch, post, postRowUuid]);

  useEffect(() => {
    setupAutoIncrementPostAttachmentInterval();
    return () => {
      if (autoIncrementPostAttachmentInterval.current != undefined) {
        clearInterval(autoIncrementPostAttachmentInterval.current);
      }
    };
  }, [setupAutoIncrementPostAttachmentInterval]);

  return (
    <div
      className="post-element"
      onMouseEnter={() => {
        if (autoIncrementPostAttachmentInterval.current != undefined) {
          clearInterval(autoIncrementPostAttachmentInterval.current);
        }
      }}
      onMouseLeave={() => {
        setupAutoIncrementPostAttachmentInterval();
      }}
    >
      <img
        alt={""}
        hidden={post.attachments.length == 1}
        src={`assets/left_chevron_${carouselArrowLightDarkPart}_mode.png`}
        className="post-element-scroll-img-button left"
        draggable={false}
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();
          dispatch(
            decrementPostAttachment({
              postRowUuid: postRowUuid,
              postUuid: post.postUuid,
            })
          );
        }}
      />
      <img
        alt={""}
        hidden={post.attachments.length == 1}
        src={`assets/right_chevron_${carouselArrowLightDarkPart}_mode.png`}
        className="post-element-scroll-img-button right"
        draggable={false}
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();
          dispatch(
            incrementPostAttachment({
              postRowUuid: postRowUuid,
              postUuid: post.postUuid,
            })
          );
        }}
      />

      {(post.attachments[post.currentAttachmentIndex].mediaType == "IMAGE" ||
        post.attachments[post.currentAttachmentIndex].mediaType == "GIF") && (
        <div className="post-element-media-element">
          <img
            alt={""}
            draggable={false}
            src={post.attachments[post.currentAttachmentIndex].url}
            className="post-element-img-element"
            onMouseOut={onMouseOut}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            onWheel={onWheel}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            style={{
              left: `${imgXPercent}%`,
              top: `${imgYPercent}%`,
              transform: `translate(-50%, -50%) scale(${scale})`,
            }}
          ></img>
        </div>
      )}

      {post.attachments[post.currentAttachmentIndex].mediaType ==
        "VIDEO-MP4" && (
        <video className="post-element-media-element">
          {" "}
          <source
            src={post.attachments[post.currentAttachmentIndex].url}
            type="video/mp4"
          />{" "}
        </video>
      )}
      {post.attachments[post.currentAttachmentIndex].mediaType == "IFRAME" && (
        <iframe
          src={post.attachments[post.currentAttachmentIndex].url}
          className="post-element-media-element"
        />
      )}
    </div>
  );
};

export default PostMediaElement;
