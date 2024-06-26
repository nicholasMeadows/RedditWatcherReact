import { MutableRefObject, useContext, useEffect, useRef } from "react";
import { PostRow } from "../model/PostRow.ts";
import { Post } from "../model/Post/Post.ts";
import { PostRowsDispatchContext } from "../context/post-rows-context.ts";
import { PostRowsActionType } from "../reducer/post-rows-reducer.ts";

export default function useInitializePostRow(
  postRow: PostRow,
  postRowContentDivRef: MutableRefObject<HTMLDivElement | null>,
  postsToShow: Array<Post>,
  setPostsToShow: (postsToShow: Array<Post>) => void
) {
  const postRowsDispatch = useContext(PostRowsDispatchContext);
  const postRowScrollLeft = useRef(0);

  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) {
      return;
    }
    initialized.current = true;
    const handleScroll = (scrollLeft: number) => {
      setTimeout(() => {
        const postRowContentDiv = postRowContentDivRef.current;
        if (postRowContentDiv !== null) {
          postRowContentDiv.scrollTo({
            left: scrollLeft,
          });
        }
      }, 50);
    };

    const lastAutoScrollPostRowState = postRow.lastAutoScrollPostRowState;
    if (lastAutoScrollPostRowState !== undefined) {
      setPostsToShow(lastAutoScrollPostRowState.postsToShow);
      handleScroll(lastAutoScrollPostRowState.scrollLeft);
    } else {
      setPostsToShow(postRow.posts);
      handleScroll(1);
    }
  }, [
    postRow.lastAutoScrollPostRowState,
    postRow.posts,
    postRowContentDivRef,
    setPostsToShow,
  ]);

  useEffect(() => {
    const saveState = () => {
      postRowsDispatch({
        type: PostRowsActionType.SET_LAST_AUTO_SCROLL_POST_ROW_STATE,
        payload: {
          postRowUuid: postRow.postRowUuid,
          postsToShow: postsToShow,
          scrollLeft: postRowScrollLeft.current,
        },
      });
    };
    saveState();
    return () => {
      saveState();
    };
  }, [postRow.postRowUuid, postsToShow]);

  useEffect(() => {
    const onScroll = (event: Event) => {
      postRowScrollLeft.current = (event.target as HTMLDivElement).scrollLeft;
    };
    const postRowContentDiv = postRowContentDivRef.current;
    if (postRowContentDiv !== null) {
      postRowContentDiv.addEventListener("scroll", onScroll);
    }
    return () => {
      if (postRowContentDiv !== null) {
        postRowContentDiv.removeEventListener("scroll", onScroll);
      }
    };
  }, [postRowContentDivRef]);
}
