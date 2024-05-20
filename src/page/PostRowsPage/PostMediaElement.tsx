import React, {
  memo,
  MouseEventHandler,
  TouchEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
  WheelEventHandler,
} from "react";
import { Post } from "../../model/Post/Post.ts";
import { useAppDispatch } from "../../redux/store.ts";
import { v4 as uuidV4 } from "uuid";
import {
  decrementPostAttachment,
  incrementPostAttachment,
  jumpToPostAttachment,
} from "../../redux/slice/PostRowsSlice.ts";
import { PostImageQualityEnum } from "../../model/config/enums/PostImageQualityEnum.ts";
import { AttachmentResolution } from "../../model/Post/AttachmentResolution.ts";

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
  carouselLeftButtonClick?: () => void;
  carouselRightButtonClick?: () => void;
  postImageQuality: PostImageQualityEnum;
};
const PostMediaElement: React.FC<Props> = memo(
  ({
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
    carouselRightButtonClick,
    carouselLeftButtonClick,
    postImageQuality,
  }) => {
    const dispatch = useAppDispatch();
    const [carouselArrowLightDarkPart, setCarouselArrowLightDarkPart] =
      useState("light");

    const autoIncrementPostAttachmentInterval = useRef<
      NodeJS.Timeout | undefined
    >();
    const [imageUrl, setImageUrl] = useState("");
    const setupAutoIncrementPostAttachmentInterval = useCallback(() => {
      if (post.attachments.length > 1 && autoIncrementAttachments) {
        autoIncrementPostAttachmentInterval.current = setInterval(() => {
          dispatch(
            incrementPostAttachment({
              postUuid: post.postUuid,
              postRowUuid: postRowUuid,
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

    useEffect(() => {
      if (
        post == undefined ||
        post.attachments.length <= 1 ||
        imageUrl == undefined
      ) {
        return;
      }
      const attachment = post.attachments[post.currentAttachmentIndex];
      if (attachment.mediaType != "IMAGE") {
        return;
      }

      const imgEl = document.createElement("img");
      imgEl.crossOrigin = "anonymous";
      imgEl.onload = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext && canvas.getContext("2d");
        const defaultRGB = { r: 0, g: 0, b: 0 }; // for non-supporting envs
        if (!context) {
          return defaultRGB;
        }

        const blockSize = 5; // only visit every 5 pixels

        let data;
        const width = (canvas.width =
          imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width);
        const height = (canvas.height =
          imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height);
        let i = -4;

        const rgb = { r: 0, g: 0, b: 0 };
        let count = 0;

        context.drawImage(imgEl, 0, 0);

        try {
          data = context.getImageData(0, 0, width, height);
        } catch (e) {
          /* security error, img on diff domain */
          return defaultRGB;
        }

        const length = data.data.length;

        while ((i += blockSize * 4) < length) {
          ++count;
          rgb.r += data.data[i];
          rgb.g += data.data[i + 1];
          rgb.b += data.data[i + 2];
        }

        // ~~ used to floor values
        rgb.r = ~~(rgb.r / count);
        rgb.g = ~~(rgb.g / count);
        rgb.b = ~~(rgb.b / count);

        const total = rgb.r + rgb.g + rgb.b;
        if (total <= (255 * 3) / 2) {
          setCarouselArrowLightDarkPart("dark");
        } else {
          setCarouselArrowLightDarkPart("light");
        }
      };
      imgEl.src = imageUrl;
    }, [post, imageUrl]);

    useEffect(() => {
      const attachment = post.attachments[post.currentAttachmentIndex];
      let url = attachment.url;
      const attachmentResolutions = attachment.attachmentResolutions;
      if (attachmentResolutions.length > 0) {
        let attachmentResolution: AttachmentResolution;
        if (
          postImageQuality === PostImageQualityEnum.High ||
          postImageQuality === PostImageQualityEnum.Low
        ) {
          attachmentResolution = attachmentResolutions.reduce(
            (previous, current) => {
              const previousPxCount = previous.width * previous.height;
              const currentPxCount = current.width * current.height;
              if (postImageQuality === PostImageQualityEnum.High) {
                return previousPxCount < currentPxCount ? current : previous;
              } else {
                return previousPxCount > currentPxCount ? current : previous;
              }
            }
          );
        } else {
          const sorted = attachmentResolutions.sort((res1, res2) => {
            const pxCount1 = res1.width * res1.height;
            const pxCount2 = res2.width * res2.height;
            if (pxCount1 > pxCount2) {
              return 1;
            } else if (pxCount1 < pxCount2) {
              return -1;
            }
            return 0;
          });
          attachmentResolution = sorted[Math.floor((sorted.length - 1) / 2)];
        }
        const textAreaElement = document.createElement("textarea");
        textAreaElement.innerHTML = attachmentResolution.url;
        url = decodeURI(textAreaElement.value);
      }
      setImageUrl(url);
    }, [
      post.attachments,
      post.currentAttachmentIndex,
      post.thumbnail,
      postImageQuality,
    ]);

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
            if (carouselLeftButtonClick !== undefined) {
              carouselLeftButtonClick();
            }
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
            if (carouselRightButtonClick !== undefined) {
              carouselRightButtonClick();
            }
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
              src={imageUrl}
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
        {post.attachments[post.currentAttachmentIndex].mediaType ==
          "IFRAME" && (
          <iframe
            src={post.attachments[post.currentAttachmentIndex].url}
            className="post-element-media-element"
          />
        )}

        {post.attachments.length > 1 && (
          <div className={"attachment-indicator-box"}>
            {post.attachments.map((attachment, index) => {
              return (
                <div
                  key={uuidV4()}
                  className={`attachment-indicator ${
                    post.attachments[post.currentAttachmentIndex] == attachment
                      ? "attachment-indicator-active"
                      : ""
                  }`}
                  onClick={() => {
                    dispatch(
                      jumpToPostAttachment({
                        postRowUuid: postRowUuid,
                        postUuid: post.postUuid,
                        attachmentIndex: index,
                      })
                    );
                  }}
                ></div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

export default PostMediaElement;
