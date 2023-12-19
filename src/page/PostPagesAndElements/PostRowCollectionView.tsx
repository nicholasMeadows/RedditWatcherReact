import { NAVIGATION_HAMBURGER_TOOLBAR_HEIGHT } from "../../RedditWatcherConstants";
import { setScrollY } from "../../redux/slice/PostRowsSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import PostRowView from "./PostRowView";
import SideBar from "./SideBar";

const PostRowCollectionView: React.FC = () => {
  const dispatch = useAppDispatch();
  const postRows = useAppSelector((state) => state.postRows.postRows);

  const postRowsToShowInView = useAppSelector(
    (state) => state.appConfig.postRowsToShowInView
  );

  return (
    <div
      className="post-row-page background"
      style={{
        maxHeight: `calc( 100vh - ${NAVIGATION_HAMBURGER_TOOLBAR_HEIGHT})`,
      }}
      onScroll={(event) => {
        const target = event.target as HTMLElement;
        const scrollTop = target.scrollTop;
        dispatch(setScrollY(scrollTop));
      }}
    >
      <SideBar />
      <div className="post-rows-div">
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
    </div>
  );
};

export default PostRowCollectionView;
