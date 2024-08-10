import { PostRow } from "../PostRow.ts";

export type PostRowsState = {
  currentPath: string;
  scrollY: number;
  playPauseButtonIsPaused: boolean;
  postRows: Array<PostRow>;
  pauseGetPostsLoop: boolean;
  mouseOverAPostRow: boolean;
};
