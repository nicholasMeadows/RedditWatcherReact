import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Post } from "../model/Post/Post.ts";
import { PostRowsDispatchContext } from "../context/post-rows-context.ts";
import { PostRowsActionType } from "../reducer/post-rows-reducer.ts";

export default function useIncrementAttachment(
  postRowUuid: string | undefined,
  post: Post | undefined,
  autoIncrementAttachments?: boolean
) {
  const postRowsDispatch = useContext(PostRowsDispatchContext);
  const [currentAttachmentIndex, setCurrentAttachmentIndex] = useState(0);
  const autoIncrementPostAttachmentInterval = useRef<
    NodeJS.Timeout | undefined
  >();

  const incrementPostAttachment = useCallback(() => {
    if (post === undefined || postRowUuid === undefined) {
      return;
    }
    const attachments = post.attachments;
    let attachmentIndex: number;
    if (currentAttachmentIndex < attachments.length - 1) {
      attachmentIndex = currentAttachmentIndex + 1;
    } else {
      attachmentIndex = 0;
    }
    setCurrentAttachmentIndex(attachmentIndex);
    postRowsDispatch({
      type: PostRowsActionType.SET_POST_ATTACHMENT_INDEX,
      payload: {
        postRowUuid: postRowUuid,
        postUuid: post.postUuid,
        index: attachmentIndex,
      },
    });
  }, [currentAttachmentIndex, post, postRowUuid]);

  const decrementPostAttachment = useCallback(() => {
    if (post === undefined || postRowUuid === undefined) {
      return;
    }
    const attachments = post.attachments;
    let attachmentIndex: number;
    if (currentAttachmentIndex <= 0) {
      attachmentIndex = attachments.length - 1;
    } else {
      attachmentIndex = currentAttachmentIndex - 1;
    }
    setCurrentAttachmentIndex(attachmentIndex);
    postRowsDispatch({
      type: PostRowsActionType.SET_POST_ATTACHMENT_INDEX,
      payload: {
        postRowUuid: postRowUuid,
        postUuid: post.postUuid,
        index: attachmentIndex,
      },
    });
  }, [currentAttachmentIndex, post, postRowUuid]);

  const jumpToPostAttachment = useCallback(
    (index: number) => {
      if (post === undefined || postRowUuid === undefined) {
        return;
      }
      const attachments = post.attachments;
      if (index >= 0 && index < attachments.length) {
        setCurrentAttachmentIndex(index);
        postRowsDispatch({
          type: PostRowsActionType.SET_POST_ATTACHMENT_INDEX,
          payload: {
            postRowUuid: postRowUuid,
            postUuid: post.postUuid,
            index: index,
          },
        });
      }
    },
    [post, postRowUuid]
  );
  const setupAutoIncrementPostAttachmentInterval = useCallback(() => {
    if (post === undefined) {
      return;
    }
    if (post.attachments.length > 1 && autoIncrementAttachments) {
      autoIncrementPostAttachmentInterval.current = setInterval(() => {
        incrementPostAttachment();
      }, 5000);
    }
  }, [autoIncrementAttachments, incrementPostAttachment, post]);

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
    clearAutoIncrementPostAttachmentInterval:
      clearAutoIncrementPostAttachmentInterval,
    setupAutoIncrementPostAttachmentInterval:
      setupAutoIncrementPostAttachmentInterval,
    incrementPostAttachment: incrementPostAttachment,
    decrementPostAttachment: decrementPostAttachment,
    jumpToPostAttachment: jumpToPostAttachment,
    currentAttachmentIndex: currentAttachmentIndex,
  };
}
