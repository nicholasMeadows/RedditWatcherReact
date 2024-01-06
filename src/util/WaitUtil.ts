import store from "../redux/store.ts";
import { POST_ROW_ROUTE } from "../RedditWatcherConstants.ts";
import { submitAppNotification } from "../redux/slice/AppNotificationSlice.ts";

export class WaitUtil {
  static async WaitUntilPostRowScrollY0(scrollY: () => number) {
    const isScrollY0 = () => {
      return scrollY() == 0;
    };

    if (!isScrollY0()) {
      store.dispatch(
        submitAppNotification({ message: "Waiting to scroll to top." })
      );
    }

    while (!isScrollY0()) {
      await new Promise<void>((res) => setTimeout(() => res(), 100));
    }
    return;
  }

  static async WaitUntilPostRowComponentIsVisible(
    postRowsLength: () => number
  ) {
    if (postRowsLength() == 0) {
      return;
    }

    const isOnPostRowRoute = () => {
      return window.location.href.endsWith(POST_ROW_ROUTE);
    };

    if (!isOnPostRowRoute()) {
      store.dispatch(
        submitAppNotification({ message: "Waiting until back on Main Page" })
      );
    }

    while (!isOnPostRowRoute()) {
      await new Promise<void>((res) => setTimeout(() => res(), 100));
    }
    return;
  }

  static async WaitUntilPointerNotOverPostRow(
    mouseOverPostRowUuid: () => string | undefined
  ) {
    const isMouseOverPostRow = () => {
      return mouseOverPostRowUuid() != undefined;
    };
    if (isMouseOverPostRow()) {
      store.dispatch(
        submitAppNotification({
          message: "Waiting until mouse is not over row",
        })
      );
    }
    while (isMouseOverPostRow()) {
      await new Promise<void>((res) => setTimeout(() => res(), 100));
    }
    return;
  }
}
