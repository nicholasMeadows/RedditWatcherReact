import useInitializeApp from "../hook/use-initialize-app.ts";
import { useContext } from "react";
import { RedditServiceContext } from "../context/reddit-service-context.ts";

const AppInitialization: React.FC = () => {
  const redditService = useContext(RedditServiceContext);
  const text = useInitializeApp(redditService);
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
