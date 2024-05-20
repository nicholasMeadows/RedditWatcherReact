import MediaMetadataItem from "./MediaMetadataItem";
import MediaMetadataResolution from "./MediaMetadataResolution.ts";

export default interface MediaMetadata {
  status: string;
  m: string;
  s: MediaMetadataItem;
  p: Array<MediaMetadataResolution>;
}
