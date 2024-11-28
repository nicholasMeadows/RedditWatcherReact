import "../theme/seconds-till-next-post-row-counter.scss";
import { FC, useContext, useState } from "react";
import { RedditServiceStateContext } from "../context/reddit-service-context.ts";
import { CountdownTimerOnCLickContext } from "../page/PostRowPage.tsx";

const SecondsTillNextPostRowCounter: FC = () => {
  const { secondsTillGettingNextPosts, isGettingPosts } = useContext(RedditServiceStateContext);
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
        {(() => {
            if(mouseOverCounter) {
                if(isGettingPosts) {
                    return <p>{`Already getting posts...`}</p>;
                } else {
                    return <p>{`Get post row now?`}</p>;
                }

            } else {
                return <p>{`Getting next posts in ${secondsTillGettingNextPosts} seconds`}</p>;
            }
        })()}
    </div>
  );
};
export default SecondsTillNextPostRowCounter;
