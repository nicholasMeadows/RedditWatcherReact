import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { POST_ROW_ROUTE } from "../../RedditWatcherConstants";
import { Post } from "../../model/Post/Post";
import {
  decrementPostAttachment,
  incrementPostAttachment,
} from "../../redux/slice/PostRowsSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";

type Props = { postRowUuid: string; post: Post };
const PostElement: React.FC<Props> = ({ postRowUuid, post }) => {
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
    <div className="postCardMediaContentWrapper">
      <div
        hidden={post.attachments.length == 1}
        className="post-attachment-image-box post-attachment-image-box-left"
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
      >
        <img
          src={`assets/left_chevron_${carouselArrowLightDarkPart}_mode.png`}
          className="post-attachment-image"
        />
      </div>

      <div
        hidden={post.attachments.length == 1}
        className="post-attachment-image-box post-attachment-image-box-right"
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
      >
        <img
          src={`assets/right_chevron_${carouselArrowLightDarkPart}_mode.png`}
          className="post-attachment-image"
        />
      </div>

      {(post.attachments[post.currentAttatchmentIndex].mediaType == "IMAGE" ||
        post.attachments[post.currentAttatchmentIndex].mediaType == "GIF") && (
        <img
          src={post.attachments[post.currentAttatchmentIndex].url}
          className="postCardMediaElement"
        ></img>
      )}

      {post.attachments[post.currentAttatchmentIndex].mediaType ==
        "VIDEO-MP4" && (
        <video className="postCardMediaElement">
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
          className="postCardMediaElement"
        />
      )}
    </div>
  );
};

export default PostElement;
