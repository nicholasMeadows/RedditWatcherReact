import { createContext, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/store.ts";
import PostRow from "./PostRow.tsx";
import SideBar from "../SideBar.tsx";
import {
  setScrollY,
  toggleClickedOnPlayPauseButton,
} from "../../redux/slice/PostRowsSlice.ts";

export const AutoScrollPostRowRateMsContext = createContext(1000);

const PostRowPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const postRowsState = useAppSelector((state) => state.postRows);

  const postRowsToShowInView = useAppSelector(
    (state) => state.appConfig.postRowsToShowInView
  );

  const autoScrollPostRowRateSecondsForSinglePostCard = useAppSelector(
    (state) => state.appConfig.autoScrollPostRowRateSecondsForSinglePostCard
  );
  const [autoScrollPostRowRateMs, setAutoScrollPostRowRateMs] = useState(1000);
  const postRowsDivRef = useRef(null);
  const [scrollBarWidth, setScrollBarWidth] = useState(0);

  useEffect(() => {
    const scrollDiv = postRowsDivRef.current as unknown as HTMLDivElement;
    setScrollBarWidth(scrollDiv.offsetWidth - scrollDiv.clientWidth);
  }, [postRowsDivRef, postRowsState.postRows]);

  useEffect(() => {
    const documentKeyUpEvent = (keyboardEvent: globalThis.KeyboardEvent) => {
      const key = keyboardEvent.key;
      if (key == " ") {
        dispatch(toggleClickedOnPlayPauseButton());
      }
    };

    document.body.addEventListener("keyup", documentKeyUpEvent);
    return () => {
      document.body.removeEventListener("keyup", documentKeyUpEvent);
    };
  }, [dispatch]);

  useEffect(() => {
    setAutoScrollPostRowRateMs(
      1000 * autoScrollPostRowRateSecondsForSinglePostCard
    );
  }, [autoScrollPostRowRateSecondsForSinglePostCard]);
  return (
    <div className="post-row-page">
      <div
        className="post-rows-side-bar-div"
        style={{
          right: `${scrollBarWidth}px`,
        }}
      >
        <SideBar />
      </div>
      <div
        className="post-rows-div"
        ref={postRowsDivRef}
        onScroll={(event) => {
          const target = event.target as HTMLElement;
          const scrollTop = target.scrollTop;
          dispatch(setScrollY(scrollTop));
        }}
      >
        <AutoScrollPostRowRateMsContext.Provider
          value={autoScrollPostRowRateMs}
        >
          {postRowsState.postRows.map((postRow) => (
            <div
              key={"post-row-" + postRow.postRowUuid}
              style={{
                height: `calc(100%/${postRowsToShowInView})`,
                maxHeight: `calc(100%/${postRowsToShowInView})`,
              }}
            >
              <PostRow postRow={postRow} />
            </div>
          ))}
        </AutoScrollPostRowRateMsContext.Provider>
      </div>

      <div
        className={"play-pause-button-div"}
        onClick={() => dispatch(toggleClickedOnPlayPauseButton())}
      >
        <img
          src={`assets/${
            postRowsState.getPostRowsPaused ? "pause" : "play"
          }_black.png`}
          className={"play-pause-button-img"}
        />
      </div>
    </div>
  );
};

export default PostRowPage;
