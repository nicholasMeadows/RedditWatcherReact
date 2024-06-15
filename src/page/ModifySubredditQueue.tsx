import { useContext } from "react";
import {
  SubredditQueueDispatchContext,
  SubredditQueueStateContext,
} from "../context/sub-reddit-queue-context.ts";
import { SubredditQueueActionType } from "../reducer/sub-reddit-queue-reducer.ts";

const ModifySubredditQueue: React.FC = () => {
  const subredditQueueState = useContext(SubredditQueueStateContext);
  const subredditQueueDispatch = useContext(SubredditQueueDispatchContext);

  return (
    <>
      <div className="modify-subreddit-queue-ion-content">
        <div className="modify-subreddit-queue-root">
          {subredditQueueState.subredditQueue.length == 0 && (
            <h3 className="empty-subreddit-queue-text">
              Subreddit Queue is Empty...
            </h3>
          )}

          {subredditQueueState.subredditQueue.length != 0 && (
            <>
              {subredditQueueState.subredditQueue.map((subredditQueueItem) => (
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
                        subredditQueueDispatch({
                          type: SubredditQueueActionType.REMOVE_SUBREDDIT_QUEUE_ITEM,
                          payload: subredditQueueItem,
                        })
                      }
                    >
                      {" "}
                      &#10006;{" "}
                    </span>
                    <span
                      className="queue-item-control-move-up-down"
                      onClick={() => {
                        subredditQueueDispatch({
                          type: SubredditQueueActionType.MOVE_SUBREDDIT_QUEUE_ITEM_FORWARD,
                          payload: subredditQueueItem,
                        });
                      }}
                    >
                      {" "}
                      &#10094;{" "}
                    </span>

                    <span
                      className="queue-item-control-move-up-down queue-item-control-move-down-margin-left"
                      onClick={() =>
                        subredditQueueDispatch({
                          type: SubredditQueueActionType.MOVE_SUBREDDIT_QUEUE_ITEM_BACKWARD,
                          payload: subredditQueueItem,
                        })
                      }
                    >
                      {" "}
                      &#10095;{" "}
                    </span>
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
