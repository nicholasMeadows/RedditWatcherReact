import React, {
  memo,
  MouseEvent,
  ReactNode,
  useCallback,
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
import useIncrementAttachment from "../hook/use-iincrement-attachment.ts";
import PostMediaElementZoomContext from "../context/post-media-element-zoom-context.ts";
import { PostRowPageActionType } from "../reducer/post-row-page-reducer.ts";
import { PostRowPageDispatchContext } from "../context/post-row-page-context.ts";

const PostMediaElement: React.FC = memo(() => {
  const {
    post,
    postRowUuid,
    autoIncrementAttachment,
    mouseOverPostCard,
    postImageQuality,
  } = useContext(PostMediaElementContext);

  const postMediaElementZoomContext = useContext(PostMediaElementZoomContext);
  const postRowPageDispatch = useContext(PostRowPageDispatchContext);
  let imgTop = 50;
  let imgLeft = 50;
  let imgScale = 1;
  if (postMediaElementZoomContext !== undefined) {
    imgTop = postMediaElementZoomContext.imgYPercent;
    imgLeft = postMediaElementZoomContext.imgXPercent;
    imgScale = postMediaElementZoomContext.scale;
  }

  const currentAttachmentIndex = post.currentAttachmentIndex;

  const [carouselArrowLightDarkPart, setCarouselArrowLightDarkPart] =
    useState("light");
  const [mediaSrc, setMediaSrc] = useState("");

  const {
    incrementPostAttachment,
    decrementPostAttachment,
    jumpToPostAttachment,
  } = useIncrementAttachment(
    post,
    postRowUuid,
    autoIncrementAttachment,
    mouseOverPostCard
  );

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

  const carouselLeftButtonClick = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      decrementPostAttachment();
    },
    [decrementPostAttachment]
  );

  const carouselRightButtonClick = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      incrementPostAttachment();
    },
    [incrementPostAttachment]
  );

  const setShowPostCardInfo = useCallback(
    (showPostCardInfoToSet: boolean) => {
      postRowPageDispatch({
        type: PostRowPageActionType.SET_SHOW_POST_CARD_INFO,
        payload: {
          showPostCardInfo: showPostCardInfoToSet,
          postUuid: post.postUuid,
          postRowUuid: postRowUuid,
        },
      });
    },
    [post.postUuid, postRowPageDispatch, postRowUuid]
  );
  return (
    <div className="post-element" ref={postElementRef}>
      <img
        alt={""}
        hidden={post.attachments.length == 1}
        src={`assets/left_chevron_${carouselArrowLightDarkPart}_mode.png`}
        className="post-element-scroll-img-button left"
        draggable={false}
        onClick={(event) => {
          carouselLeftButtonClick(event);
        }}
      />
      <img
        alt={""}
        hidden={post.attachments.length == 1}
        src={`assets/right_chevron_${carouselArrowLightDarkPart}_mode.png`}
        className="post-element-scroll-img-button right"
        draggable={false}
        onClick={(event) => {
          carouselRightButtonClick(event);
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
                style={{
                  left: `${imgLeft}%`,
                  top: `${imgTop}%`,
                  transform: `translate(-50%, -50%) scale(${imgScale})`,
                  background: "blue",
                }}
                onMouseEnter={() => {
                  setShowPostCardInfo(true);
                }}
                onMouseLeave={() => {
                  setShowPostCardInfo(false);
                }}
              ></img>
            </div>
          );
        } else if (
          post.attachments[currentAttachmentIndex].mediaType ==
          MediaType.VideoMP4
        ) {
          mediaElement = (
            <video
              className="post-element-media-element"
              onMouseEnter={() => {
                setShowPostCardInfo(true);
              }}
              onMouseLeave={() => {
                setShowPostCardInfo(false);
              }}
            >
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
                  className={"post-element-iframe-element"}
                  onMouseEnter={() => {
                    setShowPostCardInfo(true);
                  }}
                  onMouseLeave={() => {
                    setShowPostCardInfo(false);
                  }}
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
