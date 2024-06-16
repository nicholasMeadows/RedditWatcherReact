import { FC, ReactNode, useReducer } from "react";
import {
  SubredditQueueDispatchContext,
  SubredditQueueStateContext,
} from "../sub-reddit-queue-context.ts";
import SubredditQueueReducer from "../../reducer/sub-reddit-queue-reducer.ts";

type Props = {
  children: ReactNode;
};
const SubredditQueueContextProvider: FC<Props> = ({ children }) => {
  const [subredditQueueState, dispatch] = useReducer(SubredditQueueReducer, {
    subredditQueue: [],
  });
  return (
    <SubredditQueueStateContext.Provider value={subredditQueueState}>
      <SubredditQueueDispatchContext.Provider value={dispatch}>
        {children}
      </SubredditQueueDispatchContext.Provider>
    </SubredditQueueStateContext.Provider>
  );
};
export default SubredditQueueContextProvider;
