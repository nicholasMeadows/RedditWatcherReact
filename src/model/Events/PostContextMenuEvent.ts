import { Post } from "../Post/Post";
import CustomContextMenuEvent from "./CustomContextMenuEvent";

export default interface PostContextMenuEvent extends CustomContextMenuEvent {
  post: Post;
}
