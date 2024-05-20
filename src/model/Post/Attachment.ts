import { AttachmentResolution } from "./AttachmentResolution.ts";

export interface Attachment {
  status: string;
  mediaType: string;
  url: string;
  attachmentResolutions: Array<AttachmentResolution>;
}
