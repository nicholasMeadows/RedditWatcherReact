import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { POST_ROW_ROUTE, REDDIT_SIGNIN_ROUTE } from "../RedditWatcherConstants";
import { RedditAuthenticationStatus } from "../model/RedditAuthenticationState";
import { loadAppConfig } from "../redux/slice/AppConfigSlice";
import { setText } from "../redux/slice/AppInitializationSlice";
import { authenticateReddit } from "../redux/slice/RedditClientSlice";
import { loadSubredditLists } from "../redux/slice/RedditListsSlice";
import store, { useAppDispatch, useAppSelector } from "../redux/store";
import { startLoopingForPosts } from "../service/RedditService";

const AppInitialization: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const text = useAppSelector((state) => state.appInitialization.text);
  const configLoaded = useAppSelector((state) => state.appConfig.configLoaded);
  const subredditListsLoaded = useAppSelector(
    (state) => state.subredditLists.subredditListsLoaded
  );
  const redditAuthenticationStatus = useAppSelector(
    (state) => state.redditClient.redditAuthenticationStatus
  );
  const postRows = useAppSelector((state) => state.postRows.postRows);

  useEffect(() => {
    if (!configLoaded) {
      dispatch(loadAppConfig());
    } else if (configLoaded && !subredditListsLoaded) {
      dispatch(loadSubredditLists());
    } else if (configLoaded && subredditListsLoaded) {
      const redditCredentials = store.getState().appConfig.redditCredentials;
      if (redditCredentials == undefined) {
        navigate(REDDIT_SIGNIN_ROUTE);
      } else if (
        redditAuthenticationStatus == RedditAuthenticationStatus.NOT_YET_AUTHED
      ) {
        const username = redditCredentials.username;
        const password = redditCredentials.password;
        const clientId = redditCredentials.clientId;
        const clientSecret = redditCredentials.clientSecret;

        if (
          username == "" ||
          password == "" ||
          clientId == "" ||
          clientSecret == ""
        ) {
          navigate(REDDIT_SIGNIN_ROUTE);
        } else {
          console.log("Authetnicationg Reddit");
          dispatch(setText("Logging In..."));
          dispatch(authenticateReddit());
        }
      } else if (
        redditAuthenticationStatus ==
        RedditAuthenticationStatus.AUTHENTICATION_DENIED
      ) {
        navigate(REDDIT_SIGNIN_ROUTE);
      } else if (postRows.length == 0) {
        dispatch(setText("Getting Posts..."));

        const loopingForPosts = store.getState().redditClient.loopingForPosts;
        if (!loopingForPosts) {
          startLoopingForPosts();
        }
      } else {
        navigate(POST_ROW_ROUTE);
      }
    }
  }, [
    dispatch,
    navigate,
    configLoaded,
    subredditListsLoaded,
    redditAuthenticationStatus,
    postRows,
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
