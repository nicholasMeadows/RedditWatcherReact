import { useContext } from "react";
import { RedditClientContext } from "../context/reddit-client-context.ts";
import useRedditClient from "../hook/use-reddit-client.ts";

const ModifySubredditQueue: React.FC = () => {
  const redditClient = useRedditClient();
  const { redditClientContextData } = useContext(RedditClientContext);

  return (
    <>
      <div className="modify-subreddit-queue-ion-content">
        <div className="modify-subreddit-queue-root">
          {redditClientContextData.subredditQueue.length == 0 && (
            <h3 className="empty-subreddit-queue-text">
              Subreddit Queue is Empty...
            </h3>
          )}

          {redditClientContextData.subredditQueue.length != 0 && (
            <>
              {redditClientContextData.subredditQueue.map(
                (subredditQueueItem) => (
                  <div
                    key={subredditQueueItem.subredditQueueItemUuid}
                    className="subreddit-queue-item"
                  >
                    <h1 className={"subreddit-queue-item-label"}>
                      {subredditQueueItem.displayName}
                    </h1>

                    <div className="subreddit-queue-item-controls">
                      <span
                        className="queue-item-control-delete"
                        onClick={() =>
                          redditClient.removeSubredditQueueItem(
                            subredditQueueItem.subredditQueueItemUuid
                          )
                        }
                      >
                        {" "}
                        &#10006;{" "}
                      </span>
                      <span
                        className="queue-item-control-move-up-down"
                        onClick={() => {
                          redditClient.moveSubredditQueueItemForward(
                            subredditQueueItem.subredditQueueItemUuid
                          );
                        }}
                      >
                        {" "}
                        &#10094;{" "}
                      </span>

                      <span
                        className="queue-item-control-move-up-down queue-item-control-move-down-margin-left"
                        onClick={() =>
                          redditClient.moveSubredditQueueItemBack(
                            subredditQueueItem.subredditQueueItemUuid
                          )
                        }
                      >
                        {" "}
                        &#10095;{" "}
                      </span>
                    </div>
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ModifySubredditQueue;
