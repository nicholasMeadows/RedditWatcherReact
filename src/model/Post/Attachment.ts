import { AttachmentResolution } from "./AttachmentResolution.ts";
import { MediaType } from "./MediaTypeEnum.ts";

export interface Attachment {
  status: string;
  mediaType: MediaType;
  url: string;
  base64Img: string | undefined;
  attachmentResolutions: Array<AttachmentResolution>;
}
