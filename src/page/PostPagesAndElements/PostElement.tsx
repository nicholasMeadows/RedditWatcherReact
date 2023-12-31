import {
  MouseEventHandler,
  TouchEventHandler,
  WheelEventHandler,
  useEffect,
  useState,
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
const PostElement: React.FC<Props> = ({
  postRowUuid,
  post,
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

  return (
    <div className="post-element">
      <img
        hidden={post.attachments.length == 1}
        src={`assets/left_chevron_${carouselArrowLightDarkPart}_mode.png`}
        className="post-element-scroll-img-button left"
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
        hidden={post.attachments.length == 1}
        src={`assets/right_chevron_${carouselArrowLightDarkPart}_mode.png`}
        className="post-element-scroll-img-button right"
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

      {(post.attachments[post.currentAttatchmentIndex].mediaType == "IMAGE" ||
        post.attachments[post.currentAttatchmentIndex].mediaType == "GIF") && (
        <div className="post-element-media-element">
          <img
            draggable={false}
            src={post.attachments[post.currentAttatchmentIndex].url}
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

      {post.attachments[post.currentAttatchmentIndex].mediaType ==
        "VIDEO-MP4" && (
        <video className="post-element-media-element">
          {" "}
          <source
            src={post.attachments[post.currentAttatchmentIndex].url}
            type="video/mp4"
          />{" "}
        </video>
      )}
      {post.attachments[post.currentAttatchmentIndex].mediaType == "IFRAME" && (
        <iframe
          src={post.attachments[post.currentAttatchmentIndex].url}
          className="post-element-media-element"
        />
      )}
    </div>
  );
};

export default PostElement;
