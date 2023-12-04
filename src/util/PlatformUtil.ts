import { Capacitor } from "@capacitor/core";
import { Platform } from "../model/Platform";
import SubredditSortOrderOptionsEnum from "../model/config/enums/SubredditSortOrderOptionsEnum";

export default function getPlatform(): Platform {
  if (
    typeof navigator === "object" &&
    typeof navigator.userAgent === "string" &&
    navigator.userAgent.indexOf("Electron") >= 0
  ) {
    return Platform.Electron;
  }
  const platform = Capacitor.getPlatform();
  switch (platform) {
    case "web":
      return Platform.Web;
    case "android":
      return Platform.Android;
    case "ios":
      return Platform.Ios;
  }
  return Platform.Unknown;
}
export function checkPlatformForSubredditSortOrderOption(
  option: SubredditSortOrderOptionsEnum
): boolean {
  if (
    option == SubredditSortOrderOptionsEnum.RedditListDotCom24HourGrowth ||
    option == SubredditSortOrderOptionsEnum.RedditListDotComRecentActivity ||
    option == SubredditSortOrderOptionsEnum.RedditListDotComSubscribers
  ) {
    return getPlatform() != Platform.Web;
  }
  return true;
}
