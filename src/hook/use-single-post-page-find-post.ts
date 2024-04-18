import { useContext, useEffect, useState } from "react";
import { Post } from "../model/Post/Post.ts";
import { SinglePostPageContext } from "../context/single-post-page-context.ts";
import { PostRow } from "../model/PostRow.ts";

export function useSinglePostPageFindPost(postRows: Array<PostRow>) {
  const { postRowUuid, postUuid } = useContext(SinglePostPageContext);
  const [post, setPost] = useState<Post>();
  useEffect(() => {
    if (postRowUuid == undefined || postUuid == undefined) {
      return;
    }

    const postRow = postRows.find((pr) => pr.postRowUuid == postRowUuid);
    if (postRow != undefined) {
      setPost(postRow.posts.find((p) => p.postUuid == postUuid));
    }
  }, [postRowUuid, postUuid]);
  return post;
}
