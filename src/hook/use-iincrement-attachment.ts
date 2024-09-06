import { useCallback, useContext, useEffect, useRef } from "react";
import { PostRowPageActionType } from "../reducer/post-row-page-reducer.ts";
import { Post } from "../model/Post/Post.ts";
import { PostRowPageDispatchContext } from "../context/post-row-page-context.ts";

export default function useIncrementAttachment(
  post: Post | undefined,
  postRowUuid: string | null,
  autoIncrementAttachments: boolean,
  mouseOver: boolean
) {
  const postRowPageDispatch = useContext(PostRowPageDispatchContext);
  const autoIncrementPostAttachmentInterval = useRef<
    NodeJS.Timeout | undefined
  >();

  const incrementPostAttachment = useCallback(() => {
    if (
      post == undefined ||
      post.postUuid === undefined ||
      postRowUuid === null ||
      post.attachments === undefined ||
      post.currentAttachmentIndex === undefined
    ) {
      return;
    }
    let attachmentIndex: number;
    if (post.currentAttachmentIndex < post.attachments.length - 1) {
      attachmentIndex = post.currentAttachmentIndex + 1;
    } else {
      attachmentIndex = 0;
    }
    postRowPageDispatch({
      type: PostRowPageActionType.SET_POST_ATTACHMENT_INDEX,
      payload: {
        postRowUuid: postRowUuid,
        postUuid: post.postUuid,
        index: attachmentIndex,
      },
    });
  }, [post, postRowUuid, postRowPageDispatch]);

  const decrementPostAttachment = useCallback(() => {
    if (
      post === undefined ||
      post.postUuid === undefined ||
      postRowUuid === null ||
      post.attachments === undefined ||
      post.currentAttachmentIndex === undefined
    ) {
      return;
    }
    let attachmentIndex: number;
    if (post.currentAttachmentIndex <= 0) {
      attachmentIndex = post.attachments.length - 1;
    } else {
      attachmentIndex = post.currentAttachmentIndex - 1;
    }
    postRowPageDispatch({
      type: PostRowPageActionType.SET_POST_ATTACHMENT_INDEX,
      payload: {
        postRowUuid: postRowUuid,
        postUuid: post.postUuid,
        index: attachmentIndex,
      },
    });
  }, [post, postRowUuid, postRowPageDispatch]);

  const jumpToPostAttachment = useCallback(
    (index: number) => {
      if (
        post === undefined ||
        post.postUuid === undefined ||
        postRowUuid === null ||
        post.attachments === undefined
      ) {
        return;
      }
      if (index >= 0 && index < post.attachments.length) {
        postRowPageDispatch({
          type: PostRowPageActionType.SET_POST_ATTACHMENT_INDEX,
          payload: {
            postRowUuid: postRowUuid,
            postUuid: post.postUuid,
            index: index,
          },
        });
      }
    },
    [post, postRowUuid, postRowPageDispatch]
  );

  const setupAutoIncrementPostAttachmentInterval = useCallback(() => {
    if (
      !autoIncrementAttachments ||
      post === undefined ||
      post.attachments === undefined ||
      post.attachments.length <= 1 ||
      mouseOver
    ) {
      return;
    }
    autoIncrementPostAttachmentInterval.current = setInterval(() => {
      incrementPostAttachment();
    }, 5000);
  }, [post, autoIncrementAttachments, mouseOver, incrementPostAttachment]);

  const clearAutoIncrementPostAttachmentInterval = useCallback(() => {
    if (autoIncrementPostAttachmentInterval.current != undefined) {
      clearInterval(autoIncrementPostAttachmentInterval.current);
    }
  }, []);

  useEffect(() => {
    setupAutoIncrementPostAttachmentInterval();
    return () => {
      clearAutoIncrementPostAttachmentInterval();
    };
  }, [
    clearAutoIncrementPostAttachmentInterval,
    setupAutoIncrementPostAttachmentInterval,
  ]);

  return {
    incrementPostAttachment: incrementPostAttachment,
    decrementPostAttachment: decrementPostAttachment,
    jumpToPostAttachment: jumpToPostAttachment,
  };
}
