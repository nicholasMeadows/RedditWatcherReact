import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  moveSubredditQueueItemBack,
  moveSubredditQueueItemForward,
  removeSubredditQueueItem,
} from "../redux/slice/RedditClientSlice";

const ModifySubredditQueue: React.FC = () => {
  const dispatch = useAppDispatch();
  const subredditQueue = useAppSelector(
    (state) => state.redditClient.subredditQueue
  );

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
                  <h1>{subredditQueueItem.displayName}</h1>

                  <div className="subreddit-queue-item-controls">
                    <span
                      className="queue-item-control-delete"
                      onClick={() =>
                        dispatch(
                          removeSubredditQueueItem(
                            subredditQueueItem.subredditQueueItemUuid
                          )
                        )
                      }
                    >
                      {" "}
                      &#10006;{" "}
                    </span>
                    <span
                      className="queue-item-control-move-up-down"
                      onClick={() => {
                        dispatch(
                          moveSubredditQueueItemForward(
                            subredditQueueItem.subredditQueueItemUuid
                          )
                        );
                      }}
                    >
                      {" "}
                      &#10094;{" "}
                    </span>

                    <span
                      className="queue-item-control-move-up-down queue-item-control-move-down-margin-left"
                      onClick={() =>
                        dispatch(
                          moveSubredditQueueItemBack(
                            subredditQueueItem.subredditQueueItemUuid
                          )
                        )
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
