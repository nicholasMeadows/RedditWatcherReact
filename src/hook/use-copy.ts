import { MediaType } from "../model/Post/MediaTypeEnum.ts";

export function useCopy() {
  return {
    copy: async (copyInfo: { url: string; mediaType: MediaType }) => {
      if (copyInfo.mediaType == MediaType.Image) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const context = canvas.getContext("2d");
          if (context != undefined) {
            context.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
              if (blob != undefined) {
                navigator.clipboard.write([
                  new ClipboardItem({ "image/png": blob }),
                ]);
              }
            });
          }
        };
        img.onerror = (event) => {
          console.log(
            `Could not load image url ${copyInfo.url} into image tag for copy. ${event}`
          );
          navigator.clipboard.writeText(copyInfo.url);
        };
        img.src = copyInfo.url;
      } else {
        await navigator.clipboard.writeText(copyInfo.url);
      }
    },
  };
}
