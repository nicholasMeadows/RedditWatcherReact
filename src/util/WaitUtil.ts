export class WaitUtil {
  static async WaitUntilGetPostsIsNotPaused(getPostsIsPaused: () => boolean) {
    while (getPostsIsPaused()) {
      await new Promise<void>((res) => setTimeout(() => res(), 100));
    }
  }
}
