import "../theme/seconds-till-next-post-row-counter.scss";
import { FC, useContext, useState } from "react";
import { RedditServiceStateContext } from "../context/reddit-service-context.ts";
import { CountdownTimerOnCLickContext } from "../page/PostRowPage.tsx";

const SecondsTillNextPostRowCounter: FC = () => {
  const { secondsTillGettingNextPosts } = useContext(RedditServiceStateContext);
  const { onCountdownClickRef } = useContext(CountdownTimerOnCLickContext);

  const [mouseOverCounter, setMouseOverCounter] = useState(false);
  return (
    <div
      className={"seconds-till-next-post-row-counter-div"}
      onClick={() => {
        onCountdownClickRef.current();
      }}
      onMouseEnter={() => setMouseOverCounter(true)}
      onMouseLeave={() => setMouseOverCounter(false)}
    >
      {!mouseOverCounter && (
        <p>{`Getting next posts in ${secondsTillGettingNextPosts} seconds`}</p>
      )}
      {mouseOverCounter && <p>{`Get post row now?`}</p>}
    </div>
  );
};
export default SecondsTillNextPostRowCounter;
