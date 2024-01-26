import { useEffect, useRef, useState } from "react";
import {
  setPostCardWidth,
  setScrollY,
  toggleClickedOnPlayPauseButton,
} from "../../redux/slice/PostRowsSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import PostRowView from "./PostRowView";
import SideBar from "./SideBar";
import { POST_ROW_SCROLL_BTN_WIDTH_EM } from "../../RedditWatcherConstants.ts";

const PostRowCollectionView: React.FC = () => {
  const dispatch = useAppDispatch();
  const postRows = useAppSelector((state) => state.postRows.postRows);

  const postRowsToShowInView = useAppSelector(
    (state) => state.appConfig.postRowsToShowInView
  );
  const postsToShowInRow = useAppSelector(
    (state) => state.appConfig.postsToShowInRow
  );

  const getPostRowsPaused = useAppSelector(
    (state) => state.postRows.getPostRowsPaused
  );
  const postRowsDivRef = useRef(null);
  const [scrollBarWidth, setScrollBarWidth] = useState(0);

  useEffect(() => {
    const contentResizeObserver = new ResizeObserver(() => {
      if (postRowsDivRef.current != undefined) {
        const div = postRowsDivRef.current as unknown as HTMLDivElement;

        const baseFontSize = parseFloat(getComputedStyle(div).fontSize);
        dispatch(
          setPostCardWidth(
            (div.clientWidth -
              baseFontSize * POST_ROW_SCROLL_BTN_WIDTH_EM * 2) /
              postsToShowInRow
          )
        );
      }
    });
    const div = postRowsDivRef.current;
    if (div != undefined) {
      contentResizeObserver.observe(div);
    }
  }, [postsToShowInRow]);

  useEffect(() => {
    const scrollDiv = postRowsDivRef.current as unknown as HTMLDivElement;
    setScrollBarWidth(scrollDiv.offsetWidth - scrollDiv.clientWidth);
  }, [postRowsDivRef, postRows]);

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
        {postRows.map((postRow) => (
          <div
            key={"post-row-" + postRow.postRowUuid}
            style={{
              height: `calc(100%/${postRowsToShowInView})`,
              maxHeight: `calc(100%/${postRowsToShowInView})`,
            }}
          >
            <PostRowView postRow={postRow} />
          </div>
        ))}
      </div>

      <div
        className={"play-pause-button-div"}
        onClick={() => dispatch(toggleClickedOnPlayPauseButton())}
      >
        <img
          src={`assets/${getPostRowsPaused ? "pause" : "play"}_black.png`}
          className={"play-pause-button-img"}
        />
      </div>
    </div>
  );
};

export default PostRowCollectionView;
