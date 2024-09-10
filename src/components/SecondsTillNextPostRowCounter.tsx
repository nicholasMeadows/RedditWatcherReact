import "../theme/seconds-till-next-post-row-counter.scss";
import { FC, useContext } from "react";
import { RedditServiceStateContext } from "../context/reddit-service-context.ts";

const SecondsTillNextPostRowCounter: FC = () => {
  const { secondsTillGettingNextPosts } = useContext(RedditServiceStateContext);
  return (
    <div className={"seconds-till-next-post-row-counter-div"}>
      <p>{`Getting next posts in ${secondsTillGettingNextPosts} seconds`}</p>
    </div>
  );
};
export default SecondsTillNextPostRowCounter;
