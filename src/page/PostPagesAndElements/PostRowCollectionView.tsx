import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SINGPLE_POST_ROUTE } from "../../RedditWatcherConstants";
import { setScrollY } from "../../redux/slice/PostRowsSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import PostRowView from "./PostRowView";

const PostRowCollectionView: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const postRows = useAppSelector((state) => state.postRows.postRows);
  const singlePostPagePostRow = useAppSelector(
    (state) => state.singlePostPage.postRow
  );
  const singlePostPagePostToShow = useAppSelector(
    (state) => state.singlePostPage.postToShow
  );

  useEffect(() => {
    if (
      singlePostPagePostToShow != undefined &&
      singlePostPagePostRow != undefined &&
      !window.location.href.endsWith(SINGPLE_POST_ROUTE)
    ) {
      navigate(SINGPLE_POST_ROUTE);
    }
  }, [navigate, singlePostPagePostRow, singlePostPagePostToShow]);

  return (
    <>
      {postRows.length > 0 && (
        <div
          className="post-row-page background"
          onScroll={(event) => {
            const target = event.target as HTMLElement;
            const scrollTop = target.scrollTop;
            dispatch(setScrollY(scrollTop));
          }}
        >
          {postRows.map((postRow) => (
            <PostRowView
              key={"post-row-" + postRow.postRowUuid}
              postRow={postRow}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default PostRowCollectionView;
