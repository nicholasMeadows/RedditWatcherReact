import { useContext } from "react";
import { SinglePostPageContext } from "../context/single-post-page-context.ts";
import { PostRow } from "../model/PostRow.ts";

export function useSinglePostPageGoToNextPrevPost() {
  const { postRowUuid, postUuid, setSinglePostPagePostUuid } = useContext(
    SinglePostPageContext
  );

  const findPostRow = (postRows: Array<PostRow>) => {
    const postRowIndex = postRows.findIndex(
      (postRow) => postRow.postRowUuid === postRowUuid
    );
    if (postRowIndex === -1) {
      return;
    }
    return postRows[postRowIndex];
  };

  const goToNextPost = (postRows: Array<PostRow>) => {
    const postRow = findPostRow(postRows);
    if (postRow === undefined) {
      return;
    }
    const postIndex = postRow.posts.findIndex(
      (post) => post.postUuid === postUuid
    );
    if (postIndex === -1) {
      return;
    }
    if (postIndex < postRow.posts.length - 1) {
      setSinglePostPagePostUuid(postRow.posts[postIndex + 1].postUuid);
    } else {
      setSinglePostPagePostUuid(postRow.posts[0].postUuid);
    }
  };

  const goToPreviousPost = (postRows: Array<PostRow>) => {
    const postRow = findPostRow(postRows);
    if (postRow === undefined) {
      return;
    }
    const postIndex = postRow.posts.findIndex(
      (post) => post.postUuid === postUuid
    );
    if (postIndex === -1) {
      return;
    }
    if (postIndex == 0) {
      setSinglePostPagePostUuid(
        postRow.posts[postRow.posts.length - 1].postUuid
      );
    } else {
      setSinglePostPagePostUuid(postRow.posts[postIndex - 1].postUuid);
    }
  };

  return { goToNextPost, goToPreviousPost };
}
