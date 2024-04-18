import useInitializeApp from "../hook/use-initialize-app.ts";
import { useContext } from "react";
import { RedditServiceContext } from "../context/reddit-service-context.ts";
import useRedditClient from "../hook/use-reddit-client.ts";
import useRedditList from "../hook/use-reddit-list.ts";

const AppInitialization: React.FC = () => {
  const redditService = useContext(RedditServiceContext);
  const redditClient = useRedditClient();
  const redditListsHook = useRedditList();
  const text = useInitializeApp(redditService, redditClient, redditListsHook);
  return (
    <>
      <div className="app-initialization-wrapper">
        <div className="loader"></div>
        <p className="app-initialization-text">{text}</p>
      </div>
    </>
  );
};

export default AppInitialization;
