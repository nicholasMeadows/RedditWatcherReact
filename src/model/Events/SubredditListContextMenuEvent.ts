import { SubredditLists } from "../SubredditList/SubredditLists";
import CustomContextMenuEvent from "./CustomContextMenuEvent";

export default interface SubredditListContextMenuEvent extends CustomContextMenuEvent {
    subredditList: SubredditLists
}