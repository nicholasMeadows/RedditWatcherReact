import { setScrollY } from "../../redux/slice/PostRowsSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import PostRowView from "./PostRowView";
import SideBar from "./SideBar";

const PostRowCollectionView: React.FC = () => {
  const dispatch = useAppDispatch();
  const postRows = useAppSelector((state) => state.postRows.postRows);

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
          <SideBar />
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
