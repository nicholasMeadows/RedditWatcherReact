import { useCallback, useContext, useEffect, useRef } from "react";
import { Attachment } from "../model/Post/Attachment.ts";
import { PostRowsActionType } from "../reducer/post-rows-reducer.ts";
import { PostRowsDispatchContext } from "../context/post-rows-context.ts";

export default function useIncrementAttachment(
  currentAttachmentIndex: number | undefined,
  attachments: Array<Attachment> | undefined,
  postUuid: string | undefined,
  postRowUuid: string | undefined,
  autoIncrementAttachments?: boolean
) {
  const postRowsDispatch = useContext(PostRowsDispatchContext);
  // const [currentAttachmentIndex, setCurrentAttachmentIndex] = useState(0);
  const autoIncrementPostAttachmentInterval = useRef<
    NodeJS.Timeout | undefined
  >();

  const incrementPostAttachment = useCallback(() => {
    if (
      postUuid === undefined ||
      postRowUuid === undefined ||
      attachments === undefined ||
      currentAttachmentIndex === undefined
    ) {
      return;
    }
    let attachmentIndex: number;
    if (currentAttachmentIndex < attachments.length - 1) {
      attachmentIndex = currentAttachmentIndex + 1;
    } else {
      attachmentIndex = 0;
    }
    postRowsDispatch({
      type: PostRowsActionType.SET_POST_ATTACHMENT_INDEX,
      payload: {
        postRowUuid: postRowUuid,
        postUuid: postUuid,
        index: attachmentIndex,
      },
    });
  }, [
    attachments,
    currentAttachmentIndex,
    postRowUuid,
    postRowsDispatch,
    postUuid,
  ]);

  const decrementPostAttachment = useCallback(() => {
    if (
      postUuid === undefined ||
      postRowUuid === undefined ||
      attachments === undefined ||
      currentAttachmentIndex === undefined
    ) {
      return;
    }
    let attachmentIndex: number;
    if (currentAttachmentIndex <= 0) {
      attachmentIndex = attachments.length - 1;
    } else {
      attachmentIndex = currentAttachmentIndex - 1;
    }
    postRowsDispatch({
      type: PostRowsActionType.SET_POST_ATTACHMENT_INDEX,
      payload: {
        postRowUuid: postRowUuid,
        postUuid: postUuid,
        index: attachmentIndex,
      },
    });
  }, [
    attachments,
    currentAttachmentIndex,
    postRowUuid,
    postRowsDispatch,
    postUuid,
  ]);

  const jumpToPostAttachment = useCallback(
    (index: number) => {
      if (
        postUuid === undefined ||
        postRowUuid === undefined ||
        attachments === undefined
      ) {
        return;
      }
      if (index >= 0 && index < attachments.length) {
        postRowsDispatch({
          type: PostRowsActionType.SET_POST_ATTACHMENT_INDEX,
          payload: {
            postRowUuid: postRowUuid,
            postUuid: postUuid,
            index: index,
          },
        });
      }
    },
    [attachments, postRowUuid, postRowsDispatch, postUuid]
  );

  const setupAutoIncrementPostAttachmentInterval = useCallback(() => {
    if (
      attachments !== undefined &&
      attachments.length > 1 &&
      autoIncrementAttachments
    ) {
      autoIncrementPostAttachmentInterval.current = setInterval(() => {
        incrementPostAttachment();
      }, 5000);
    }
  }, [attachments, autoIncrementAttachments, incrementPostAttachment]);

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
  };
}
