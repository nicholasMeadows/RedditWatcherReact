import { Subreddit } from "../Subreddit/Subreddit";
import { Attachment } from "./Attachment";

export interface Post {
  postUuid: string;
  postId: string;
  randomSourceString: string;
  over18: boolean;
  domain: string;
  url: string;
  attachments: Array<Attachment>;
  created: number;
  permaLink: string;
  currentAttachmentIndex: number;
  subreddit: Subreddit;
  thumbnail: string;
}
