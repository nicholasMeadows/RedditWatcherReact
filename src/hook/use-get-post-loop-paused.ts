import { useContext, useEffect, useState } from "react";
import { PostRowsContext } from "../context/post-rows-context.ts";
import { ContextMenuStateContext } from "../context/context-menu-context.ts";

export default function useGetPostLoopPaused() {
  const [isGetPostLoopPaused, setIsGetPostLoopPaused] = useState(false);

  const { scrollY, playPauseButtonIsClicked, mouseOverPostRowUuid } =
    useContext(PostRowsContext);

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
