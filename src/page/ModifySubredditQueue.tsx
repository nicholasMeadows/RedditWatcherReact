import { useContext } from "react";
import { RedditServiceStateContext } from "../context/reddit-service-context.ts";
import useRedditQueue from "../hook/use-reddit-queue.ts";
import { AppConfigStateContext } from "../context/app-config-context.ts";

const ModifySubredditQueue: React.FC = () => {
  const { darkMode } = useContext(AppConfigStateContext);
  const { subredditQueue } = useContext(RedditServiceStateContext);

  const {
    removeSubredditFromQueue,
    moveSubredditQueueItemForward,
    moveSubredditQueueItemBackwards,
  } = useRedditQueue();

  return (
    <>
      <div className="modify-subreddit-queue-ion-content">
        <div className="modify-subreddit-queue-root">
          {subredditQueue.length == 0 && (
            <h3 className="empty-subreddit-queue-text">
              Subreddit Queue is Empty...
            </h3>
          )}

          {subredditQueue.length != 0 && (
            <>
              {subredditQueue.map((subredditQueueItem) => (
                <div
                  key={subredditQueueItem.subredditQueueItemUuid}
                  className="subreddit-queue-item"
                >
                  <h1 className={"subreddit-queue-item-label"}>
                    {subredditQueueItem.displayName}
                  </h1>

                  <div className="subreddit-queue-item-controls">
                    <img
                      src={`assets/x_close_${
                        darkMode ? "dark" : "light"
                      }_mode.png`}
                      className={"queue-item-control"}
                      onClick={() =>
                        removeSubredditFromQueue(subredditQueueItem)
                      }
                    />
                    <img
                      src={`assets/arrow_up_${
                        darkMode ? "dark" : "light"
                      }_mode.png`}
                      className={"queue-item-control"}
                      onClick={() => {
                        moveSubredditQueueItemForward(subredditQueueItem);
                      }}
                    />
                    <img
                      src={`assets/arrow_down_${
                        darkMode ? "dark" : "light"
                      }_mode.png`}
                      className={"queue-item-control"}
                      onClick={() => {
                        moveSubredditQueueItemBackwards(subredditQueueItem);
                      }}
                    />
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ModifySubredditQueue;
