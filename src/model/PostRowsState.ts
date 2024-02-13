import { PostRow } from "./PostRow";

export interface PostRowsState {
  getPostRowsPaused: boolean;
  currentPath: string;
  scrollY: number;
  clickedOnPlayPauseButton: boolean;
  getPostRowsPausedTimeout: NodeJS.Timeout | undefined;
  postRows: Array<PostRow>;
  postRowsHasAtLeast1PostRow: boolean;
  postCardWidthPercentage: number;
  postRowContentWidthPx: number;
}
