import { useContext, useEffect, useState } from "react";
import { ContextMenuStateContext } from "../context/context-menu-context.ts";
import { PostRowPageContext } from "../context/post-row-page-context.ts";

export default function useGetPostLoopPaused() {
  const [isGetPostLoopPaused, setIsGetPostLoopPaused] = useState(false);

  const { scrollY, playPauseButtonIsClicked, mouseOverPostRowUuid } =
    useContext(PostRowPageContext);

  const { menuOpenOnPostRowUuid } = useContext(ContextMenuStateContext);
  useEffect(() => {
    setIsGetPostLoopPaused(
      scrollY !== 0 ||
        playPauseButtonIsClicked ||
        mouseOverPostRowUuid !== undefined ||
        menuOpenOnPostRowUuid !== undefined
    );
  }, [
    menuOpenOnPostRowUuid,
    mouseOverPostRowUuid,
    playPauseButtonIsClicked,
    scrollY,
  ]);

  return {
    isGetPostLoopPaused,
  };
}
