import { FC, ReactNode, useReducer } from "react";
import {
  SinglePostPageContext,
  SinglePostPageDispatchContext,
} from "../single-post-page-context.ts";
import SinglePostPageReducer from "../../reducer/single-post-page-reducer.ts";

type Props = {
  children: ReactNode;
};
const SinglePostPageContextProvider: FC<Props> = ({ children }) => {
  const [singlePostPageState, dispatch] = useReducer(SinglePostPageReducer, {
    postUuid: undefined,
    postRowUuid: undefined,
  });
  return (
    <SinglePostPageContext.Provider value={singlePostPageState}>
      <SinglePostPageDispatchContext.Provider value={dispatch}>
        {children}
      </SinglePostPageDispatchContext.Provider>
    </SinglePostPageContext.Provider>
  );
};
export default SinglePostPageContextProvider;
