import { PostRow } from "../PostRow.ts";

export type PostRowsState = {
  currentPath: string;
  postRows: Array<PostRow>;
  mouseOverPostRowUuid: string | undefined;
  scrollY: number;
  playPauseButtonIsClicked: boolean;
};
