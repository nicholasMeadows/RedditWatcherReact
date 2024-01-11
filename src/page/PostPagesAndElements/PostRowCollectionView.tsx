import { useEffect, useRef, useState } from "react";
import {
  setScrollY,
  toggleClickedOnPlayPauseButton,
} from "../../redux/slice/PostRowsSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import PostRowView from "./PostRowView";
import SideBar from "./SideBar";

const PostRowCollectionView: React.FC = () => {
  const dispatch = useAppDispatch();
  const postRows = useAppSelector((state) => state.postRows.postRows);

  const postRowsToShowInView = useAppSelector(
    (state) => state.appConfig.postRowsToShowInView
  );

  const getPostRowsPaused = useAppSelector(
    (state) => state.postRows.getPostRowsPaused
  );
  const postRowsDivRef = useRef(null);
  const [scrollBarWidth, setScrollBarWidth] = useState(0);

  useEffect(() => {
    const scrollDiv = postRowsDivRef.current as unknown as HTMLDivElement;
    setScrollBarWidth(scrollDiv.offsetWidth - scrollDiv.clientWidth);
  }, [postRowsDivRef, postRows]);

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
