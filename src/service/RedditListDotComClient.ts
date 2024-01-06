import { CapacitorHttp } from "@capacitor/core";

export function getSubredditsFromRedditListDotCom(): Promise<Array<string>> {
  return new Promise((resolve) => {
    try {
      callGetRedditListDotComHtml().then((promiseResultArr) => {
        const fulfilledPromises = promiseResultArr.filter(
          (promise) => promise.status == "fulfilled"
        );
        const htmlArray = fulfilledPromises.map(
          (result) => (result as PromiseFulfilledResult<string>).value
        );
        resolve(htmlArray);
      });
    } catch (e) {
      console.log("caught e", e);
    }
  });
}

function callGetRedditListDotComHtml() {
  const promiseArr: Array<Promise<string>> = [];
  for (let i = 0; i < 5; ++i) {
    promiseArr.push(
      new Promise((httpResolve) => {
        const url = `https://redditlist.com/nsfw${
          i == 0 ? "" : (i + 1).toString()
        }.html`;
        CapacitorHttp.get({
          url: url,
        }).then((response) => {
          response.data;
          const html = response.data.replace(/[\r\n\t]/gm, "");
          httpResolve(html);
        });
      })
    );
  }
  return Promise.allSettled(promiseArr);
}
