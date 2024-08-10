import { Dispatch, SetStateAction } from "react";
import { RedditClientState } from "../RedditClientState.ts";

type RedditClientDispatch = Dispatch<SetStateAction<RedditClientState>>;
export default RedditClientDispatch;
