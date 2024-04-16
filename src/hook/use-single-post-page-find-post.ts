import { useContext, useEffect, useState } from "react";
import { Post } from "../model/Post/Post.ts";
import store from "../redux/store.ts";
import { SinglePostPageContext } from "../context/single-post-page-context.ts";

export function useSinglePostPageFindPost() {
  const { postRowUuid, postUuid } = useContext(SinglePostPageContext);
  const [post, setPost] = useState<Post>();
  useEffect(() => {
    if (postRowUuid == undefined || postUuid == undefined) {
      return;
    }
    const postRowsState = store.getState().postRows;

    const postRow = postRowsState.postRows.find(
      (pr) => pr.postRowUuid == postRowUuid
    );
    if (postRow != undefined) {
      setPost(postRow.posts.find((p) => p.postUuid == postUuid));
    }
  }, [postRowUuid, postUuid]);
  return post;
}
