import { Post } from "./Post/Post";

export interface PostRow{
    postRowUuid: string,
    runningPostsForPostRow: Array<Post>,
    posts: Array<Post>,
    scrollToIndex: number,
    incrementPostInterval: NodeJS.Timeout | undefined
}