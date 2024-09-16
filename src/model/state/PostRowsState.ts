import { PostRow } from "../PostRow.ts";

export type PostRowPageState = {
  currentPath: string;
  postRows: Array<PostRow>;
  mouseOverPostRowUuid: string | undefined;
  scrollY: number;
  playPauseButtonIsClicked: boolean;
  showCardInfoOnCardUuid: undefined | string;
};
