import { PostRow } from "./PostRow";

export interface PostRowsState {
    scrollY: number, 
    postRows: Array<PostRow>,
    postRowsHasAtLeast1PostRow: boolean,
    mouseOverPostRowUuid: string | undefined
}