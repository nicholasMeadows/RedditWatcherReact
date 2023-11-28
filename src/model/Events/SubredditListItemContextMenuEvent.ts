import { Subreddit } from "../Subreddit/Subreddit";
import CustomContextMenuEvent from "./CustomContextMenuEvent";

export default interface SubredditListItemContextMenuEvent
  extends CustomContextMenuEvent {
  subreddit: Subreddit;
}
