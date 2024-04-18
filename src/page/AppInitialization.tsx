import useInitializeApp from "../hook/use-initialize-app.ts";
import { useContext } from "react";
import { RedditServiceContext } from "../context/reddit-service-context.ts";
import useRedditClient from "../hook/use-reddit-client.ts";

const AppInitialization: React.FC = () => {
  const redditService = useContext(RedditServiceContext);
  const redditClient = useRedditClient();
  const text = useInitializeApp(redditService, redditClient);
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
