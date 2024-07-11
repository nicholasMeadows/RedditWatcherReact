import { Capacitor } from "@capacitor/core";
import { Platform } from "../model/Platform";
import SubredditSourceOptionsEnum from "../model/config/enums/SubredditSourceOptionsEnum.ts";

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
  option: SubredditSourceOptionsEnum
): boolean {
  if (
    option == SubredditSourceOptionsEnum.RedditListDotCom24HourGrowth ||
    option == SubredditSourceOptionsEnum.RedditListDotComRecentActivity ||
    option == SubredditSourceOptionsEnum.RedditListDotComSubscribers
  ) {
    return getPlatform() != Platform.Web;
  }
  return true;
}
