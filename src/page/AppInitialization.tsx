import { useContext, useEffect } from "react";
import { useAppInitialization } from "../hook/use-app-initialization.ts";
import { AppConfigStateContext } from "../context/app-config-context.ts";
import { RedditListStateContext } from "../context/reddit-list-context.ts";
import { RedditClientContext } from "../context/reddit-client-context.ts";
import { RedditAuthenticationStatus } from "../model/RedditAuthenticationState.ts";
import RedditServiceContext from "../context/reddit-service-context.ts";
import { PostRowsContext } from "../context/post-rows-context.ts";
import { POST_ROW_ROUTE } from "../RedditWatcherConstants.ts";
import { useNavigate } from "react-router-dom";

const AppInitialization: React.FC = () => {
  const { configLoaded } = useContext(AppConfigStateContext);
  const { subredditListsLoaded } = useContext(RedditListStateContext);
  const { redditClientContextData } = useContext(RedditClientContext);
  const {
    text,
    loadConfigAsync,
    loadSubredditListsAsync,
    authReddit,
    loadSubscribedSubredditsAndGetFirstPostRow,
  } = useAppInitialization();
  const { postRows } = useContext(PostRowsContext);
  const { masterSubscribedSubredditList } = useContext(RedditServiceContext);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("nicholas - app initialization use effect");
    if (!configLoaded) {
      loadConfigAsync();
    } else if (!subredditListsLoaded) {
      loadSubredditListsAsync();
    } else if (
      redditClientContextData.redditAuthenticationStatus ===
      RedditAuthenticationStatus.NOT_YET_AUTHED
    ) {
      authReddit();
    } else if (masterSubscribedSubredditList.current.length === 0) {
      loadSubscribedSubredditsAndGetFirstPostRow();
    } else if (postRows.length > 0) {
      navigate(POST_ROW_ROUTE);
    }
  }, [
    authReddit,
    configLoaded,
    loadConfigAsync,
    loadSubredditListsAsync,
    loadSubscribedSubredditsAndGetFirstPostRow,
    masterSubscribedSubredditList,
    navigate,
    postRows.length,
    redditClientContextData.redditAuthenticationStatus,
    subredditListsLoaded,
  ]);
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
