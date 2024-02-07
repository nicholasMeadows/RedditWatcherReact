import { PostRow } from "./PostRow";

export interface PostRowsState {
  scrollY: number;
  postRows: Array<PostRow>;
  postRowsHasAtLeast1PostRow: boolean;
  clickedOnPlayPauseButton: boolean;
  getPostRowsPaused: boolean;
  postCardWidthPercentage: number;
  postRowContentWidthPx: number;
}
