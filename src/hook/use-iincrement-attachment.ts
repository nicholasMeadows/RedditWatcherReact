import { useCallback, useEffect, useRef, useState } from "react";
import { setPostAttachmentIndex } from "../redux/slice/PostRowsSlice.ts";
import { useAppDispatch } from "../redux/store.ts";
import { Post } from "../model/Post/Post.ts";

export default function useIncrementAttachment(
  postRowUuid: string | undefined,
  post: Post | undefined,
  autoIncrementAttachments?: boolean
) {
  const dispatch = useAppDispatch();
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
    dispatch(
      setPostAttachmentIndex({
        postRowUuid: postRowUuid,
        postUuid: post.postUuid,
        index: attachmentIndex,
      })
    );
  }, [currentAttachmentIndex, dispatch, post, postRowUuid]);

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
    dispatch(
      setPostAttachmentIndex({
        postRowUuid: postRowUuid,
        postUuid: post.postUuid,
        index: attachmentIndex,
      })
    );
  }, [currentAttachmentIndex, dispatch, post, postRowUuid]);

  const jumpToPostAttachment = useCallback(
    (index: number) => {
      if (post === undefined || postRowUuid === undefined) {
        return;
      }
      const attachments = post.attachments;
      if (index >= 0 && index < attachments.length) {
        setCurrentAttachmentIndex(index);
        dispatch(
          setPostAttachmentIndex({
            postRowUuid: postRowUuid,
            postUuid: post.postUuid,
            index: index,
          })
        );
      }
    },
    [dispatch, post, postRowUuid]
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
