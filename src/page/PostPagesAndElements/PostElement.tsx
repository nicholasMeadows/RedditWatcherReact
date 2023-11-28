import { Post } from "../../model/Post/Post";
import {
  decrementPostAttachment,
  incrementPostAttachment,
} from "../../redux/slice/PostRowsSlice";
import { useAppDispatch } from "../../redux/store";

type Props = { postRowUuid: string; post: Post };
const PostElement: React.FC<Props> = ({ postRowUuid, post }) => {
  const dispatch = useAppDispatch();
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
          src="assets/left_chevron_light_mode.png"
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
          src="assets/right_chevron_light_mode.png"
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
