import React, {
  memo,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { v4 as uuidV4 } from "uuid";
import { PostImageQualityEnum } from "../model/config/enums/PostImageQualityEnum.ts";
import { MediaType } from "../model/Post/MediaTypeEnum.ts";
import { AttachmentResolution } from "../model/Post/AttachmentResolution.ts";
import PostMediaElementContext from "../context/post-media-element-context.ts";

// type Props = {
//   post: Post;
//   currentAttachmentIndex: number;
//   decrementPostAttachment: () => void;
//   incrementPostAttachment: () => void;
//   jumpToPostAttachment: (index: number) => void;
//   autoIncrementAttachments?: boolean;
//   scale?: number;
//   imgXPercent?: number;
//   imgYPercent?: number;
//   onMouseOut?: MouseEventHandler;
//   onMouseDown?: MouseEventHandler;
//   onMouseUp?: MouseEventHandler;
//   onMouseMove?: MouseEventHandler;
//   onWheel?: WheelEventHandler;
//   onTouchStart?: TouchEventHandler;
//   onTouchMove?: TouchEventHandler;
//   carouselLeftButtonClick?: () => void;
//   carouselRightButtonClick?: () => void;
//   postImageQuality?: PostImageQualityEnum;
// };
const PostMediaElement: React.FC = memo(() => {
  const {
    post,
    currentAttachmentIndex,
    decrementPostAttachment,
    incrementPostAttachment,
    jumpToPostAttachment,
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
  } = useContext(PostMediaElementContext);

  const [carouselArrowLightDarkPart, setCarouselArrowLightDarkPart] =
    useState("light");
  const [mediaSrc, setMediaSrc] = useState("");

  useEffect(() => {
    if (
      post == undefined ||
      post.attachments.length <= 1 ||
      mediaSrc == undefined
    ) {
      return;
    }
    const attachment = post.attachments[currentAttachmentIndex];
    if (attachment.mediaType != MediaType.Image) {
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
    imgEl.src = mediaSrc;
  }, [post, mediaSrc, currentAttachmentIndex]);

  const postElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentAttachment = post.attachments[currentAttachmentIndex];
    const mediaType = currentAttachment.mediaType;
    if (mediaType === MediaType.Image || mediaType === MediaType.Gif) {
      const attachmentResolutions = currentAttachment.attachmentResolutions;
      if (
        attachmentResolutions === undefined ||
        attachmentResolutions.length === 0 ||
        mediaType === MediaType.Gif
      ) {
        setMediaSrc(
          currentAttachment.base64Img === undefined
            ? currentAttachment.url
            : currentAttachment.base64Img
        );
      } else {
        const sortedResolutions = [...attachmentResolutions];
        sortedResolutions.sort((res1, res2) => {
          const pxCount1 = res1.width * res1.height;
          const pxCount2 = res2.width * res2.height;
          if (pxCount1 > pxCount2) {
            return 1;
          } else if (pxCount1 < pxCount2) {
            return -1;
          }
          return 0;
        });

        let attachmentResolution: AttachmentResolution | undefined = undefined;
        if (postImageQuality == PostImageQualityEnum.High) {
          attachmentResolution =
            sortedResolutions[sortedResolutions.length - 1];
        } else if (postImageQuality === PostImageQualityEnum.Medium) {
          attachmentResolution =
            sortedResolutions[Math.floor(sortedResolutions.length - 1)];
        } else if (postImageQuality === PostImageQualityEnum.Low) {
          attachmentResolution = sortedResolutions[0];
        } else {
          const postElement = postElementRef.current;
          if (postElement !== null) {
            const postElementPxCount =
              postElement.clientWidth * postElement.clientHeight;
            for (const resolution of sortedResolutions) {
              const pxCount = resolution.width * resolution.height;
              if (pxCount >= postElementPxCount) {
                attachmentResolution = resolution;
                break;
              }
            }
          }
        }

        if (attachmentResolution !== undefined) {
          setMediaSrc(
            attachmentResolution.base64Img === undefined
              ? attachmentResolution.url
              : attachmentResolution.base64Img
          );
        }
      }
    } else {
      setMediaSrc(currentAttachment.url);
    }
  }, [
    post.attachments,
    currentAttachmentIndex,
    post.thumbnail,
    postImageQuality,
  ]);

  return (
    <div className="post-element" ref={postElementRef}>
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
          decrementPostAttachment();
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
          incrementPostAttachment();
        }}
      />

      {(() => {
        let mediaElement: ReactNode | null = null;
        if (
          post.attachments[currentAttachmentIndex].mediaType ==
            MediaType.Image ||
          post.attachments[currentAttachmentIndex].mediaType == MediaType.Gif
        ) {
          mediaElement = (
            <div className="post-element-media-element">
              <img
                alt={""}
                draggable={false}
                src={mediaSrc}
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
          );
        } else if (
          post.attachments[currentAttachmentIndex].mediaType ==
          MediaType.VideoMP4
        ) {
          mediaElement = (
            <video className="post-element-media-element">
              {" "}
              <source src={mediaSrc} type="video/mp4" />{" "}
            </video>
          );
        } else if (
          post.attachments[currentAttachmentIndex].mediaType == MediaType.IFrame
        ) {
          mediaElement = (
            <>
              <div className={"post-element-media-element"}>
                <iframe
                  src={mediaSrc}
                  frameBorder="0"
                  scrolling="no"
                  width="100%"
                  height="100%"
                  style={{ position: "absolute", top: 0, left: 0 }}
                  allowFullScreen
                ></iframe>
              </div>
            </>
          );
        }

        return mediaElement;
      })()}
      {post.attachments.length > 1 && (
        <div className={"attachment-indicator-box"}>
          {post.attachments.map((attachment, index) => {
            return (
              <div
                key={uuidV4()}
                className={`attachment-indicator ${
                  post.attachments[currentAttachmentIndex] == attachment
                    ? "attachment-indicator-active"
                    : ""
                }`}
                onClick={() => {
                  jumpToPostAttachment(index);
                }}
              ></div>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default PostMediaElement;
