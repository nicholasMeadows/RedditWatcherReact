import { Subreddit } from "../Subreddit/Subreddit";
import CustomContextMenuEvent from "./CustomContextMenuEvent";

export default interface SideBarSubredditMenuEvent
  extends CustomContextMenuEvent {
  subreddit: Subreddit;
}
