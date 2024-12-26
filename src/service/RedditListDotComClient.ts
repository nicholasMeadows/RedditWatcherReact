import { CapacitorHttp } from "@capacitor/core";
import {
  REDDIT_LIST_DOT_COM_HTTP_REQUEST_FAILED_FRIENDLY_ERROR_MESSAGE
} from "../RedditWatcherConstants.ts";

export default class RedditListDotComClient {
  private readonly redditListDotComUrlTemplate = `https://redditlist.com/nsfw{page_number}.html`;

  getRedditListDotComHtmlForPage(pageNumber: number): Promise<string> {
    console.log(`Getting html for redditlist.com page #${pageNumber}`)
    return new Promise<string>((resolve, reject) => {
      const url = this.redditListDotComUrlTemplate.replace("{page_number}", pageNumber.toString());
      CapacitorHttp.get({
        url: url,
      }).then((response) => {
        response.data;
        const html = response.data.replace(/[\r\n\t]/gm, "");
        resolve(html);
      }).catch(() => {
        reject({
          statusCode: undefined,
          friendlyMessage: REDDIT_LIST_DOT_COM_HTTP_REQUEST_FAILED_FRIENDLY_ERROR_MESSAGE
        })
      });
    });
  }
}